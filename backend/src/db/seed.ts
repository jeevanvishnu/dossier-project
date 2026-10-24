import "dotenv/config";
import { db } from "./db";
import { users } from "./schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { BACKEND_ECTD_TREE_SEED } from "./ctdTreeSeed";


interface UserSeed {
  email: string;
  rawPassword: string;
  role: "user" | "admin" | "superadmin";
  name: string;
}

const USERS_TO_SEED: UserSeed[] = [
  {
    email: process.env.SEED_SUPERADMIN_EMAIL || "",
    rawPassword: process.env.SEED_SUPERADMIN_PASSWORD || "" ,
    role: "superadmin",
    name: "Super Admin",
  },
];
async function seedUsers() {
  try {
    for (const userData of USERS_TO_SEED) {
      console.log(`Hashing password for ${userData.email}...`);
      const hashedPassword = await bcrypt.hash(userData.rawPassword, 10);

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser) {
        console.log(`User ${userData.email} already exists (ID: ${existingUser.id}). Updating user record...`);
        const [updated] = await db
          .update(users)
          .set({
            role: userData.role,
            name: existingUser.name || userData.name,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();

        console.log("✅ User updated successfully:", {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          name: updated.name,
        });
      } else {
        console.log(`Inserting new user ${userData.email}...`);
        const [inserted] = await db
          .insert(users)
          .values({
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            name: userData.name,
          })
          .returning();

        console.log("✅ User inserted successfully:", {
          id: inserted.id,
          email: inserted.email,
          role: inserted.role,
          name: inserted.name,
        });
      }
    }

    console.log(`✅ Verified ${BACKEND_ECTD_TREE_SEED.length} top-level eCTD modules available in backend seed taxonomy.`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
