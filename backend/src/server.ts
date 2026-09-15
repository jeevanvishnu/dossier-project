import app from "./app";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { cleanupExpiredSessions } from "./controller/auth.controller";

const PORT = process.env.PORT || 5000;

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
