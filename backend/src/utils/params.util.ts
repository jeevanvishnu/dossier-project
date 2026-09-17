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
 * Helper to resolve numeric project ID from numeric ID or unique projectCode UUID.
 */
export async function resolveProjectId(param: string | string[] | undefined): Promise<number | null> {
  const rawStr = getSingleParam(param);
  if (!rawStr) return null;

  // If purely numeric digits, parse directly as number
  if (/^\d+$/.test(rawStr)) {
    const parsedId = parseInt(rawStr, 10);
    return isNaN(parsedId) ? null : parsedId;
  }

  // Lookup by exact or case-insensitive unique projectCode
  const existingProject = await db.query.projects.findFirst({
    where: or(eq(projects.projectCode, rawStr), ilike(projects.projectCode, rawStr)),
    columns: { id: true },
  });

  return existingProject ? existingProject.id : null;
}



