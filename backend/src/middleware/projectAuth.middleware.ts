import { Request, Response, NextFunction } from "express";
import { db } from "../db/db";
import { projectMembers } from "../db/schema";
import { resolveProjectId } from "../utils/params.util";
import { eq, and } from "drizzle-orm";

export interface ProjectRequest extends Request {
  projectRole?: "owner" | "editor" | "viewer";
}

/**
 * Middleware factory to enforce project member access control.
 * @param allowedRoles List of allowed project roles ('owner', 'editor', 'viewer')
 */
export function checkProjectRole(...allowedRoles: ("owner" | "editor" | "viewer")[]) {
  return async (req: ProjectRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthorized. Authentication required." });
        return;
      }

      // System admins bypass project member check
      if (user.role === "superadmin" || user.role === "admin") {
        req.projectRole = "owner";
        return next();
      }

      const projectId = await resolveProjectId(req.params.id || req.params.projectId);

      if (!projectId) {
        res.status(400).json({ success: false, message: "Invalid project ID or code parameter." });
        return;
      }

      // Query project_members table
      const memberRecord = await db.query.projectMembers.findFirst({
        where: and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, user.id)
        ),
      });

      if (!memberRecord) {
        res.status(403).json({
          success: false,
          message: "Forbidden. You are not a member of this dossier project.",
        });
        return;
      }

      if (!allowedRoles.includes(memberRecord.role)) {
        res.status(403).json({
          success: false,
          message: `Forbidden. Action requires one of the following project roles: [${allowedRoles.join(", ")}]. Your role: "${memberRecord.role}".`,
        });
        return;
      }

      req.projectRole = memberRecord.role;
      next();
    } catch (error: any) {
      console.error("[Project Auth Middleware Error]", error);
      res.status(500).json({ success: false, message: "Internal server error checking project authorization." });
    }
  };
}
