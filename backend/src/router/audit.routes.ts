import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { getAuditLogs, exportAuditLogsCsv } from "../controller/audit.controller";

const router = Router();

// Fetch audit logs with optional text search filter
router.get("/:id/audit-logs", protect, getAuditLogs);

// Export audit logs as downloadable CSV stream
router.get("/:id/audit-logs/export", protect, exportAuditLogsCsv);

export default router;
