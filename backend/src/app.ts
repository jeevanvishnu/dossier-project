import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { sql } from "drizzle-orm";

import { db } from "./db/db";
import authRouter from "./router/auth.router";
import projectRoutes from "./router/project.routes";
import memberRoutes from "./router/member.routes";
import documentRoutes from "./router/document.routes";
import auditRoutes from "./router/audit.routes";
import compilationRoutes from "./router/compilation.routes";
import userRoutes from "./router/user.routes";
import companyRoutes from "./router/company.routes";
import statsRoutes from "./router/stats.routes";
import dashboardRoutes from "./router/dashboard.routes";

const app = express();

// ─── CORS Configuration & Validation ───────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

if (isProduction && !frontendUrl) {
  console.warn("⚠️ FRONTEND_URL environment variable is not defined in production mode!");
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

const allowedPreviewOrigins = (process.env.ALLOWED_PREVIEW_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        allowedPreviewOrigins.includes(origin) ||
        !isProduction
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy: Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

// Body Parser & Cookie Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ─── Rate Limiting for Authentication Endpoints ──────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

app.use("/api/auth/signin", authLimiter);
app.use("/api/auth/refresh", authLimiter);

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/admin", userRoutes);
app.use("/api/admin", companyRoutes);
app.use("/api/admin", statsRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
    const result = await db.execute(sql`SELECT NOW() as current_time`);
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
      error: isProduction ? "Failed to connect to database" : error.message || "Failed to connect to database",
      timestamp: new Date().toISOString(),
    });
  }
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[GLOBAL ERROR HANDLER]", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message || "Internal server error",
  });
});

export default app;

