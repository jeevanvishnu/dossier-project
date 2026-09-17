import { db } from "./db";
import { users } from "./schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { BACKEND_ECTD_TREE_SEED } from "./ctdTreeSeed";

dotenv.config();

interface UserSeed {
  email: string;
  rawPassword: string;
  role: "user" | "admin" | "superadmin";
  name: string;
}

const USERS_TO_SEED: UserSeed[] = [
  {
    email: "admindossier@gmail.com",
    rawPassword: "testadmin@2244",
    role: "admin",
    name: "Admin Dossier",
  },
  {
    email: "testuser@gmail.com",
    rawPassword: "testpass@2244",
    role: "user",
    name: "Test User",
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
            password: hashedPassword,
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

    console.log(`✅ Loaded ${BACKEND_ECTD_TREE_SEED.length} top-level eCTD modules into backend seed taxonomy.`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();


