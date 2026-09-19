import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq, ilike, or, and, count, desc } from "drizzle-orm";
import { db } from "../db/db";
import { users, refreshSessions } from "../db/schema";
import { sendWelcomeEmail } from "./email.service";
import {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQueryInput,
} from "../validators/user.validator";

/**
 * Generate a strong random temporary password if none is provided.
 */
function generateRandomPassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    pwd += chars[randomIndex];
  }
  return pwd;
}

export class UserManagementService {
  /**
   * Create a single user, hash password, and trigger welcome email.
   */
  static async createUser(input: CreateUserInput) {
    // 1. Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing) {
      throw new Error(`User with email "${input.email}" already exists.`);
    }

    // 2. Determine password to use
    const plainPassword = input.password || generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // 3. Insert user into DB
    const [createdUser] = await db
      .insert(users)
      .values({
        name: input.name || null,
        email: input.email,
        password: hashedPassword,
        role: input.role || "user",
        isBlocked: false,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    // 4. Send Welcome Email (Non-blocking background send)
    sendWelcomeEmail({
      to: createdUser.email,
      name: createdUser.name,
      email: createdUser.email,
      plainPassword,
      role: createdUser.role,
    }).catch((err) => {
      console.error(`[USER_SERVICE] Error background-sending welcome email to ${createdUser.email}:`, err);
    });

    return {
      user: createdUser,
      generatedPassword: input.password ? undefined : plainPassword,
    };
  }

  /**
   * Create multiple users in bulk (up to 50 users at once).
   */
  static async createBulkUsers(userInputs: CreateUserInput[]) {
    const results: Array<{
      email: string;
      status: "created" | "failed";
      user?: object;
      error?: string;
    }> = [];

    let succeededCount = 0;
    let failedCount = 0;

    for (const input of userInputs) {
      try {
        const result = await this.createUser(input);
        results.push({
          email: input.email,
          status: "created",
          user: result.user,
        });
        succeededCount++;
      } catch (err: any) {
        results.push({
          email: input.email,
          status: "failed",
          error: err.message || "Failed to create user",
        });
        failedCount++;
      }
    }

    return {
      totalProcessed: userInputs.length,
      succeededCount,
      failedCount,
      results,
    };
  }

  /**
   * Update user details (name, email, role).
   */
  static async updateUser(userId: number, patch: UpdateUserInput) {
    // 1. Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found.");
    }

    // 2. If email is being changed, check if new email is taken by another user
    if (patch.email && patch.email !== user.email) {
      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, patch.email))
        .limit(1);

      if (existingEmail) {
        throw new Error(`Email "${patch.email}" is already in use by another user.`);
      }
    }

    // 3. Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.email !== undefined && { email: patch.email }),
        ...(patch.role !== undefined && { role: patch.role }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  }

  /**
   * Block a user and immediately invalidate all active refresh sessions.
   */
  static async blockUser(userId: number) {
    const now = new Date();

    const result = await db.transaction(async (tx) => {
      // 1. Mark user as blocked
      const [blockedUser] = await tx
        .update(users)
        .set({
          isBlocked: true,
          updatedAt: now,
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          isBlocked: users.isBlocked,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      if (!blockedUser) {
        throw new Error("User not found.");
      }

      // 2. Revoke all active refresh sessions for this user
      await tx
        .update(refreshSessions)
        .set({ revokedAt: now, updatedAt: now })
        .where(eq(refreshSessions.userId, userId));

      return blockedUser;
    });

    console.log(`[USER_SERVICE] 🚫 User id=${userId} blocked and all refresh sessions revoked.`);
    return result;
  }

  /**
   * Unblock a user.
   */
  static async unblockUser(userId: number) {
    const [unblockedUser] = await db
      .update(users)
      .set({
        isBlocked: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!unblockedUser) {
      throw new Error("User not found.");
    }

    console.log(`[USER_SERVICE] ✅ User id=${userId} unblocked.`);
    return unblockedUser;
  }

  /**
   * Permanently delete a user (cascade deletes refresh sessions and project memberships).
   */
  static async deleteUser(userId: number) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email });

    if (!deletedUser) {
      throw new Error("User not found.");
    }

    console.log(`[USER_SERVICE] 🗑️ User id=${userId} (${deletedUser.email}) permanently deleted.`);
    return deletedUser;
  }

  /**
   * Get single user details by ID.
   */
  static async getUserById(userId: number) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }

  /**
   * List users with pagination, search, role, and block filters.
   */
  static async listUsers(query: ListUsersQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    // Filter by search (name or email)
    if (query.search) {
      const searchPattern = `%${query.search}%`;
      conditions.push(
        or(ilike(users.name, searchPattern), ilike(users.email, searchPattern))
      );
    }

    // Filter by role
    if (query.role) {
      conditions.push(eq(users.role, query.role));
    }

    // Filter by blocked status
    if (query.isBlocked !== undefined) {
      conditions.push(eq(users.isBlocked, query.isBlocked));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(users)
      .where(whereClause);

    // Fetch page items
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: userList,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
