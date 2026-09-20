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
 * Generate a password combining the email prefix and a random hash code (e.g. john@4f8a1d).
 */
function generateUserPassword(email: string): string {
  const emailPrefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
  const randomHash = crypto.randomBytes(3).toString("hex"); // 6 hex characters
  let pwd = `${emailPrefix}@${randomHash}`;
  if (pwd.length < 8) {
    pwd += crypto.randomBytes(2).toString("hex");
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

    // 2. Determine password to use (email prefix + hash code if auto-generated)
    const plainPassword = input.password || generateUserPassword(input.email);
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

    // 4. Send Welcome Email (Awaited with automatic test fallback)
    try {
      const emailResult = await sendWelcomeEmail({
        to: createdUser.email,
        name: createdUser.name,
        email: createdUser.email,
        plainPassword,
        role: createdUser.role,
      });

      if (!emailResult.success) {
        console.warn(
          `[USER_SERVICE] ⚠️ Welcome email could not be delivered to ${createdUser.email}: ${emailResult.error}`
        );
      }
    } catch (err: any) {
      console.error(`[USER_SERVICE] Error sending welcome email to ${createdUser.email}:`, err?.message);
    }

    return {
      user: createdUser,
      generatedPassword: input.password ? undefined : plainPassword,
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
