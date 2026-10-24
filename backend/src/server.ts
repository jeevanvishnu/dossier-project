import "dotenv/config";
import app from "./app";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { cleanupExpiredSessions } from "./controller/auth.controller";

const PORT = process.env.PORT || 5000;


 
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

function scheduleSessionCleanup() {
  cleanupExpiredSessions().catch(() => null);
  setInterval(() => {
    cleanupExpiredSessions().catch(() => null);
  }, 24 * 60 * 60 * 1000);
}

// Start Server
async function startServer() {
  await runBootMigrations();
  scheduleSessionCleanup();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  });
}

startServer();

