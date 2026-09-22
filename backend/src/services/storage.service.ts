import { db } from "../db/db";
import { projectDocuments, projects, companyMembers } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export class StorageService {
  /**
   * Returns used bytes for the user's company.
   * Sums fileSize of all 'active' documents in projects belonging to the user's company.
   */
  static async getUsedBytesForUser(userId: string): Promise<number> {
    const [membership] = await db
      .select({ companyId: companyMembers.companyId })
      .from(companyMembers)
      .where(eq(companyMembers.userId, userId))
      .limit(1);

    if (!membership) return 0; // User is not associated with any company

    const [result] = await db
      .select({
        usedBytes: sql<number>`COALESCE(SUM(${projectDocuments.fileSize}), 0)::bigint`,
      })
      .from(projectDocuments)
      .innerJoin(projects, eq(projectDocuments.projectId, projects.id))
      .where(
        and(
          eq(projects.companyId, membership.companyId),
          eq(projectDocuments.status, "active")
        )
      );

    return Number(result?.usedBytes || 0);
  }

  /**
   * Returns the storageGb cap for the given userId's company membership.
   * Returns null if user is not a company member.
   */
  static async getStorageCapForUser(userId: string): Promise<number | null> {
    const [membership] = await db
      .select({ storageGb: companyMembers.storageGb })
      .from(companyMembers)
      .where(eq(companyMembers.userId, userId))
      .limit(1);

    return membership ? membership.storageGb : null;
  }

  /**
   * Throws an error if adding newFileBytes would exceed the company's storage cap.
   */
  static async assertStorageAvailable(userId: string, newFileBytes: number): Promise<void> {
    const storageGb = await this.getStorageCapForUser(userId);
    if (storageGb === null) {
      // User is not bound to a company storage limit (e.g. superadmin)
      return;
    }

    const maxSizeBytes = storageGb * 1024 * 1024 * 1024; // Convert GB to Bytes
    const usedBytes = await this.getUsedBytesForUser(userId);
    const projectedBytes = usedBytes + newFileBytes;

    if (projectedBytes > maxSizeBytes) {
      const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
      const fileMB = (newFileBytes / (1024 * 1024)).toFixed(2);
      throw new Error(
        `Storage limit exceeded. Used ${usedGB} GB of ${storageGb} GB allocated. Cannot upload ${fileMB} MB file.`
      );
    }
  }
}
