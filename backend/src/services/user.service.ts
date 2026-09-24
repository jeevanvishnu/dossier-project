import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq, ilike, or, and, count, desc, ne, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { users, refreshSessions, companyMembers } from "../db/schema";
import { sendWelcomeEmail } from "./email.service";
import { CacheService, CacheKeys } from "../lib/cache";
import {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQueryInput,
} from "../validators/user.validator";

/**
 * Generate a strong password with short email name (e.g. "jeevanvishnu" -> "Jeevan"),
 * followed by special characters, letters, and numbers (e.g. Jeevan#%Ae92 or Jeevan@#ae84).
 */
function generateUserPassword(email: string): string {
  const localPart = email.split("@")[0] || "user";
  // Extract alphabetic name part from the email prefix (e.g. "jeevanvishnu21" -> "jeevanvishnu")
  let rawName =
    localPart.split(/[._\-]/)[0].replace(/[^a-zA-Z]/g, "") ||
    localPart.replace(/[^a-zA-Z0-9]/g, "") ||
    "User";

  // Cut to max 6 characters if longer (e.g. "jeevanvishnu" -> "jeevan")
  if (rawName.length > 6) {
    rawName = rawName.slice(0, 6);
  }

  // Capitalize first letter (e.g. "Jeevan")
  const shortName =
    rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

  // Special character combinations (e.g., #%, @#, $%, %&, !#)
  const specialPairs = ["#%", "@#", "$%", "%&", "!#", "@$"];
  const upperChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowerChars = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";

  const getRandomChar = (pool: string) =>
    pool[crypto.randomInt(0, pool.length)];

  const specialPair = specialPairs[crypto.randomInt(0, specialPairs.length)];
  const upper = getRandomChar(upperChars);
  const lower = getRandomChar(lowerChars);
  const num1 = getRandomChar(digits);
  const num2 = getRandomChar(digits);

  // Output format: Jeevan#%Ae92
  return `${shortName}${specialPair}${upper}${lower}${num1}${num2}`;
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
        imageUrl: input.imageUrl || null,
        imageKitFileId: input.imageKitFileId || null,
        isBlocked: false,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        imageUrl: users.imageUrl,
        imageKitFileId: users.imageKitFileId,
        isBlocked: users.isBlocked,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    console.log(`
============================================================
🔑 NEW USER CREATED — LOGIN CREDENTIALS:
   Email:    ${createdUser.email}
   Password: ${plainPassword}
   Role:     ${createdUser.role}
============================================================
`);

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
  static async updateUser(userId: string, patch: UpdateUserInput) {
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

    await CacheService.del(CacheKeys.user(userId));
    return updatedUser;
  }

  /**
   * Block a user and immediately invalidate all active refresh sessions.
   */
  static async blockUser(userId: string) {
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
    await CacheService.del(CacheKeys.user(userId));
    return result;
  }

  /**
   * Unblock a user.
   */
  static async unblockUser(userId: string) {
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
    await CacheService.del(CacheKeys.user(userId));
    return unblockedUser;
  }

  /**
   * Permanently delete a user (cascade deletes refresh sessions and project memberships).
   */
  static async deleteUser(userId: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email });

    if (!deletedUser) {
      throw new Error("User not found.");
    }

    console.log(`[USER_SERVICE] 🗑️ User id=${userId} (${deletedUser.email}) permanently deleted.`);
    await CacheService.del(CacheKeys.user(userId));
    return deletedUser;
  }

  /**
   * Get single user details by ID.
   */
  static async getUserById(userId: string) {
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

    // Filter out superadmins
    conditions.push(ne(users.role, "superadmin"));

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

    // Filter by company membership if companyId is provided
    if (query.companyId != null) {
      const companyUserSubquery = db
        .select({ userId: companyMembers.userId })
        .from(companyMembers)
        .where(eq(companyMembers.companyId, query.companyId));
      conditions.push(inArray(users.id, companyUserSubquery));
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
