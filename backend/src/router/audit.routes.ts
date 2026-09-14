import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { checkProjectRole } from "../middleware/projectAuth.middleware";
import { getAuditLogs, exportAuditLogsCsv } from "../controller/audit.controller";

const router = Router();

// Fetch audit logs with optional text search filter
router.get("/:id/audit-logs", protect, checkProjectRole("owner", "editor", "viewer"), getAuditLogs);

// Export audit logs as downloadable CSV stream
router.get("/:id/audit-logs/export", protect, checkProjectRole("owner", "editor", "viewer"), exportAuditLogsCsv);

export default router;
