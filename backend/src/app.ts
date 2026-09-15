import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sql } from "drizzle-orm";

import { db } from "./db/db";
import authRouter from "./router/auth.router";
import projectRoutes from "./router/project.routes";
import memberRoutes from "./router/member.routes";
import documentRoutes from "./router/document.routes";
import auditRoutes from "./router/audit.routes";
import compilationRoutes from "./router/compilation.routes";

const app = express();

// ─── CORS Configuration & Validation ───────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

if (isProduction && !frontendUrl) {
  console.warn("⚠️ FRONTEND_URL environment variable is not defined in production mode!");
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

export default app;
export { app };
