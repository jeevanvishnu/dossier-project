import { db } from "../db/db";
import { refreshSessions } from "../db/schema";
import { isNull } from "drizzle-orm";

async function revokeAllSessions() {
  console.log("[SESSION_REVOCATION] Revoking all active refresh sessions...");
  const now = new Date();
  const result = await db
    .update(refreshSessions)
    .set({ revokedAt: now, updatedAt: now })
    .where(isNull(refreshSessions.revokedAt))
    .returning({ id: refreshSessions.id });

  console.log(`[SESSION_REVOCATION] Successfully revoked ${result.length} active sessions.`);
  process.exit(0);
}

revokeAllSessions().catch((err) => {
  console.error("[SESSION_REVOCATION] Failed to revoke sessions:", err);
  process.exit(1);
});
