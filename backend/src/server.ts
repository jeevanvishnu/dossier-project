import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./db/db";
import { sql } from "drizzle-orm";
import authRouter from "./router/auth.router";
import projectRoutes from "./router/project.routes";
import memberRoutes from "./router/member.routes";
import documentRoutes from "./router/document.routes";
import auditRoutes from "./router/audit.routes";
import compilationRoutes from "./router/compilation.routes";


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
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
    // Execute simple query to test Neon DB connection
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

import { ensureDatabaseSchema } from "./db/sync_schema";

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  try {
    await ensureDatabaseSchema();
  } catch (err: any) {
    console.error("Warning: Automatic DB schema sync on startup encountered an issue:", err?.message);
  }
});
