import { db } from "../db/db";
import { projects } from "../db/schema";
import { eq, ilike, or } from "drizzle-orm";

/**
 * Helper to safely extract a single string from Express req.params, which can be string | string[].
 */
export function getSingleParam(param: string | string[] | undefined): string | undefined {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Helper to safely parse an integer ID from Express route parameters.
 */
export function parseIdParam(param: string | string[] | undefined): number {
  const str = getSingleParam(param);
  if (!str) return NaN;
  return parseInt(str, 10);
}

/**
 * Helper to resolve project ID (UUID) from UUID or unique projectCode.
 */
export async function resolveProjectId(param: string | string[] | undefined): Promise<string | null> {
  const rawStr = getSingleParam(param);
  if (!rawStr) return null;

  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(rawStr)) {
    // First try: resolve as primary key (projects.id)
    const byId = await db.query.projects.findFirst({
      where: eq(projects.id, rawStr),
      columns: { id: true },
    });
    if (byId) return byId.id;
    // Fall through: might be a projectCode that also happens to look like a UUID
  }

  // Lookup by exact or case-insensitive unique projectCode
  const existingProject = await db.query.projects.findFirst({
    where: or(eq(projects.projectCode, rawStr), ilike(projects.projectCode, rawStr)),
    columns: { id: true },
  });

  return existingProject ? existingProject.id : null;
}



