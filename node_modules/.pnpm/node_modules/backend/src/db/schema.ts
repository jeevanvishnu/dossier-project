import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "superadmin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),                          // bcrypt hashed password
  role: roleEnum("role").default("user").notNull(),
  refreshToken: text("refresh_token"),                           // nullable — cleared on logout
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
