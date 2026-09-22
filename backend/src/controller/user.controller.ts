import { Request, Response } from "express";
import { db } from "../db/db";
import { companyMembers } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";
import { UserManagementService } from "../services/user.service";
import { getSingleParam } from "../utils/params.util";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
} from "../validators/user.validator";

async function assertUserInCallerCompany(
  caller: { role: string; companyId: string | null } | undefined,
  targetUserId: string
): Promise<boolean> {
  if (!caller || caller.role === "superadmin") return true;
  if (caller.companyId == null) return false;
  const [membership] = await db
    .select({ id: companyMembers.id })
    .from(companyMembers)
    .where(and(eq(companyMembers.userId, targetUserId), eq(companyMembers.companyId, caller.companyId)))
    .limit(1);
  return !!membership;
}

/**
 * POST /api/admin/users
 * Create a single user and send welcome email.
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  if (req.user?.role !== "superadmin" && parsed.data.role && parsed.data.role !== "user") {
    res.status(403).json({
      success: false,
      message: "Standard admins can only create users with the 'user' role.",
    });
    return;
  }

  try {
    const creatorUser = req.user;
    let companyId: string | null = null;
    let maxUsers: number = 0;
    let storageGb: number = 5;

    if (creatorUser && creatorUser.role !== "superadmin") {
      const [adminMembership] = await db
        .select()
        .from(companyMembers)
        .where(eq(companyMembers.userId, creatorUser.id))
        .limit(1);

      if (!adminMembership) {
        res.status(403).json({ success: false, message: "Standard admin is not associated with any company." });
        return;
      }

      companyId = adminMembership.companyId;
      maxUsers = adminMembership.maxUsers;
      storageGb = adminMembership.storageGb;

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(companyMembers)
        .where(
          and(
            eq(companyMembers.companyId, companyId),
            eq(companyMembers.role, "user")
          )
        );
      
      const currentCount = Number(countResult[0]?.count || 0);

      if (currentCount >= maxUsers) {
        res.status(400).json({
          success: false,
          message: `Company user limit reached. Max users allowed: ${maxUsers}`,
        });
        return;
      }
    }

    const result = await UserManagementService.createUser(parsed.data);

    if (companyId !== null) {
      await db.insert(companyMembers).values({
        companyId,
        userId: result.user.id,
        role: result.user.role === "admin" ? "admin" : "user",
        maxUsers,
        storageGb,
      });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully. Welcome email has been queued.",
      data: result,
    });
  } catch (error: any) {
    console.error("[USER_CONTROLLER] Error creating user:", error.message);
    const statusCode = error.message.includes("already exists") ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
}

/**
 * GET /api/admin/users
 * List users with pagination and search.
 */
export async function listUsers(req: Request, res: Response): Promise<void> {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const queryInput = {
      ...parsed.data,
      companyId: req.user?.role !== "superadmin" ? (req.user?.companyId ?? undefined) : parsed.data.companyId,
    };
    const result = await UserManagementService.listUsers(queryInput);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[USER_CONTROLLER] Error listing users:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user list",
    });
  }
}

/**
 * GET /api/admin/users/:id
 * Get single user by ID.
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  const userId = getSingleParam(req.params.id);
  if (!userId) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
    return;
  }

  try {
    if (!(await assertUserInCallerCompany(req.user, userId))) {
      res.status(403).json({ success: false, message: "Forbidden: User does not belong to your company." });
      return;
    }

    const user = await UserManagementService.getUserById(userId);

    // Prevent non-superadmins from viewing superadmin details
    if (user.role === "superadmin" && req.user?.role !== "superadmin") {
      res.status(403).json({
        success: false,
        message: "Access to superadmin details is forbidden",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error(`[USER_CONTROLLER] Error getting user ${userId}:`, error.message);
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update user details (name, email, role).
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  const userId = getSingleParam(req.params.id);
  if (!userId) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
    return;
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  if (req.user?.role !== "superadmin" && parsed.data.role === "superadmin") {
    res.status(403).json({
      success: false,
      message: "Only superadmins can promote users to the 'superadmin' role.",
    });
    return;
  }

  try {
    if (!(await assertUserInCallerCompany(req.user, userId))) {
      res.status(403).json({ success: false, message: "Forbidden: User does not belong to your company." });
      return;
    }

    const updatedUser = await UserManagementService.updateUser(userId, parsed.data);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error(`[USER_CONTROLLER] Error updating user ${userId}:`, error.message);
    const statusCode = error.message.includes("already in use")
      ? 409
      : error.message.includes("not found")
      ? 404
      : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
}

/**
 * PATCH /api/admin/users/:id/block
 * Block a user and revoke all their active sessions.
 */
export async function blockUser(req: Request, res: Response): Promise<void> {
  const userId = getSingleParam(req.params.id);
  if (!userId) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
    return;
  }

  // Prevent self-blocking
  if (req.user?.id === userId) {
    res.status(400).json({
      success: false,
      message: "You cannot block your own account",
    });
    return;
  }

  try {
    if (!(await assertUserInCallerCompany(req.user, userId))) {
      res.status(403).json({ success: false, message: "Forbidden: User does not belong to your company." });
      return;
    }

    const blockedUser = await UserManagementService.blockUser(userId);
    res.status(200).json({
      success: true,
      message: "User blocked successfully and all active sessions revoked.",
      data: { user: blockedUser },
    });
  } catch (error: any) {
    console.error(`[USER_CONTROLLER] Error blocking user ${userId}:`, error.message);
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
}

/**
 * PATCH /api/admin/users/:id/unblock
 * Unblock a user.
 */
export async function unblockUser(req: Request, res: Response): Promise<void> {
  const userId = getSingleParam(req.params.id);
  if (!userId) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
    return;
  }

  try {
    if (!(await assertUserInCallerCompany(req.user, userId))) {
      res.status(403).json({ success: false, message: "Forbidden: User does not belong to your company." });
      return;
    }

    const unblockedUser = await UserManagementService.unblockUser(userId);
    res.status(200).json({
      success: true,
      message: "User unblocked successfully.",
      data: { user: unblockedUser },
    });
  } catch (error: any) {
    console.error(`[USER_CONTROLLER] Error unblocking user ${userId}:`, error.message);
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Permanently delete a user.
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  const userId = getSingleParam(req.params.id);
  if (!userId) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
    return;
  }

  // Prevent self-deletion
  if (req.user?.id === userId) {
    res.status(400).json({
      success: false,
      message: "You cannot delete your own account",
    });
    return;
  }

  try {
    if (!(await assertUserInCallerCompany(req.user, userId))) {
      res.status(403).json({ success: false, message: "Forbidden: User does not belong to your company." });
      return;
    }

    const deletedUser = await UserManagementService.deleteUser(userId);
    res.status(200).json({
      success: true,
      message: `User ${deletedUser.email} deleted successfully.`,
      data: { user: deletedUser },
    });
  } catch (error: any) {
    console.error(`[USER_CONTROLLER] Error deleting user ${userId}:`, error.message);
    res.status(404).json({
      success: false,
      message: error.message || "User not found",
    });
  }
}
