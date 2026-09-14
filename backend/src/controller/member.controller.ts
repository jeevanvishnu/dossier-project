import { Request, Response } from "express";
import { db } from "../db/db";
import { projectMembers, users, auditLogs } from "../db/schema";
import { addMemberSchema } from "../validators/project.validator";
import { parseIdParam } from "../utils/params.util";
import { eq, and } from "drizzle-orm";

export async function addProjectMember(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const parseResult = addMemberSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.flatten() });
      return;
    }

    const { userId, role } = parseResult.data;

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Target user not found" });
      return;
    }

    const existingMember = await db.query.projectMembers.findFirst({
      where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
    });

    if (existingMember) {
      const [updated] = await db
        .update(projectMembers)
        .set({ role })
        .where(eq(projectMembers.id, existingMember.id))
        .returning();

      res.status(200).json({
        success: true,
        data: updated,
        message: `Updated user ${targetUser.email} role to ${role}`,
      });
      return;
    }

    const [newMember] = await db
      .insert(projectMembers)
      .values({ projectId, userId, role })
      .returning();

    await db.insert(auditLogs).values({
      projectId,
      logType: "SUCCESS",
      message: `User ${targetUser.email} assigned as project ${role}.`,
      userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
    });

    res.status(201).json({
      success: true,
      data: newMember,
      message: `User assigned as ${role} successfully`,
    });
  } catch (error: any) {
    console.error("[Add Member Error]", error);
    res.status(500).json({ success: false, message: "Failed to add project member" });
  }
}

export async function getProjectMembers(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const membersList = await db.query.projectMembers.findMany({
      where: eq(projectMembers.projectId, projectId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: membersList,
    });
  } catch (error: any) {
    console.error("[Get Members Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch project members" });
  }
}

export async function removeProjectMember(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    const memberId = parseIdParam(req.params.memberId);

    if (isNaN(projectId) || isNaN(memberId)) {
      res.status(400).json({ success: false, message: "Invalid IDs provided" });
      return;
    }

    const [deleted] = await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.id, memberId), eq(projectMembers.projectId, projectId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, message: "Project member relationship not found" });
      return;
    }

    await db.insert(auditLogs).values({
      projectId,
      logType: "WARNING",
      message: `Member ID ${memberId} removed from project dossier.`,
      userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
    });

    res.status(200).json({
      success: true,
      message: "Member removed from project successfully",
    });
  } catch (error: any) {
    console.error("[Remove Member Error]", error);
    res.status(500).json({ success: false, message: "Failed to remove project member" });
  }
}
