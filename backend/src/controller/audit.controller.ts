import { Request, Response } from "express";
import { db } from "../db/db";
import { auditLogs } from "../db/schema";
import { parseIdParam, getSingleParam } from "../utils/params.util";
import { eq, desc, ilike, and, or } from "drizzle-orm";

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const searchRaw = req.query.search;
    const searchQuery = typeof searchRaw === "string" ? searchRaw : getSingleParam(searchRaw as any);

    let logs;
    if (searchQuery && searchQuery.trim().length > 0) {
      const pattern = `%${searchQuery.trim()}%`;
      logs = await db.query.auditLogs.findMany({
        where: and(
          eq(auditLogs.projectId, projectId),
          or(
            ilike(auditLogs.message, pattern),
            ilike(auditLogs.userCredentials, pattern),
            ilike(auditLogs.logType, pattern)
          )
        ),
        orderBy: [desc(auditLogs.formationDate)],
      });
    } else {
      logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.projectId, projectId),
        orderBy: [desc(auditLogs.formationDate)],
      });
    }

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    console.error("[Get Audit Logs Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}

export async function exportAuditLogsCsv(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.projectId, projectId),
      orderBy: [desc(auditLogs.formationDate)],
    });

    const filename = `audit_logs_project_${projectId}_${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.write("ID,Log Type,Message,User Credentials,Formation Date\n");

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    for (const log of logs) {
      const row = [
        escapeCsv(log.id),
        escapeCsv(log.logType),
        escapeCsv(log.message),
        escapeCsv(log.userCredentials),
        escapeCsv(log.formationDate.toISOString()),
      ].join(",") + "\n";

      res.write(row);
    }

    res.end();
  } catch (error: any) {
    console.error("[Export Audit Logs CSV Error]", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to export audit logs CSV" });
    }
  }
}
