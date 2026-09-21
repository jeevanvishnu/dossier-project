import { Request, Response } from "express";
import { db } from "../db/db";
import { companyMembers } from "../db/schema";
import { StorageService } from "../services/storage.service";
import { eq } from "drizzle-orm";

export async function getCompanyStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const [membership] = await db
      .select({
        maxUsers: companyMembers.maxUsers,
        storageGb: companyMembers.storageGb,
      })
      .from(companyMembers)
      .where(eq(companyMembers.userId, userId))
      .limit(1);

    const maxUsers = membership ? membership.maxUsers : 1;
    const storageGb = membership ? membership.storageGb : 1;

    const usedStorageBytes = await StorageService.getUsedBytesForUser(userId);

    res.json({
      success: true,
      maxUsers,
      storageGb,
      usedStorageBytes,
    });
  } catch (error: any) {
    console.error("[DASHBOARD] Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
