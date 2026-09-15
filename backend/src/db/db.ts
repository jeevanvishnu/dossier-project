import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL is not set in environment variables.");
}

// Use neon-http for stateless serverless-ready database connections (compatible with Vercel)
const sql = neon(connectionString || "postgres://placeholder:placeholder@localhost/db");
export const db = drizzle(sql, { schema });
