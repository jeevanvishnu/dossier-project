import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { sql } from "drizzle-orm";

import { db } from "./db/db";
import authRouter from "./router/auth.router";
import projectRoutes from "./router/project.routes";
import memberRoutes from "./router/member.routes";
import documentRoutes from "./router/document.routes";
import auditRoutes from "./router/audit.routes";
import compilationRoutes from "./router/compilation.routes";
import { cleanupExpiredSessions } from "./controller/auth.controller";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration & Validation ───────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

if (isProduction && !frontendUrl) {
  throw new Error("FATAL: FRONTEND_URL environment variable must be explicitly defined in production mode!");
}

const allowedOrigin = frontendUrl || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Body Parser & Cookie Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// eCTD Project & Dossier Management Routes
app.use("/api/projects", projectRoutes);
app.use("/api/projects", memberRoutes);
app.use("/api/projects", documentRoutes);
app.use("/api/projects", auditRoutes);
app.use("/api/projects", compilationRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "eCTD Regulatory Dossier Management API is running." });
});

// Database Health Check Route
app.get("/health", async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`SELECT NOW() as current_time, VERSION() as version`);
    res.json({
      status: "healthy",
      database: "connected",
      neonTime: result.rows[0]?.current_time || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message || "Failed to connect to Neon database",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Migration execution on server boot.
 * NOTE / KNOWN CONSTRAINT:
 * Running migrate() on startup is intended for single-instance Node servers.
 * For multi-instance clustered deployments, run migrations as a pre-deploy step
 * to prevent concurrent schema lock conflicts.
 */
async function runBootMigrations() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("⚠️ Cannot run migrations: DATABASE_URL is missing.");
    return;
  }
  try {
    console.log("⏳ Running Drizzle migrations on boot...");
    const sqlClient = neon(connectionString);
    const migrationDb = drizzle(sqlClient);
    await migrate(migrationDb, { migrationsFolder: "./drizzle" });
    console.log("✅ Drizzle migrations verified and up to date.");
  } catch (err: any) {
    console.error("❌ Migration failed on server startup:", err.message);
  }
}

/**
 * Scheduled Session Cleanup Task
 * NOTE / SERVERLESS CONSIDERATION:
 * The 24-hour setInterval task relies on a long-running Node.js process.
 * If deploying to serverless environments (e.g., Vercel, AWS Lambda),
 * configure a cron trigger (e.g. Vercel Cron or CloudWatch) to invoke cleanup.
 */
function scheduleSessionCleanup() {
  cleanupExpiredSessions().catch(() => null);
  setInterval(() => {
    cleanupExpiredSessions().catch(() => null);
  }, 24 * 60 * 60 * 1000);
}

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  await runBootMigrations();
  scheduleSessionCleanup();
});
