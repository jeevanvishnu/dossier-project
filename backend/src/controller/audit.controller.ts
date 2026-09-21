import { Request, Response } from "express";
import { db } from "../db/db";
import { auditLogs } from "../db/schema";
import { resolveProjectId, getSingleParam } from "../utils/params.util";
import { eq, desc, ilike, and, or, count } from "drizzle-orm";

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const searchRaw = req.query.search;
    const searchQuery = typeof searchRaw === "string" ? searchRaw : getSingleParam(searchRaw as any);

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    let logs;
    let totalCount = 0;
    
    if (searchQuery && searchQuery.trim().length > 0) {
      const pattern = `%${searchQuery.trim()}%`;
      const whereClause = and(
        eq(auditLogs.projectId, projectId),
        or(
          ilike(auditLogs.message, pattern),
          ilike(auditLogs.userCredentials, pattern),
          ilike(auditLogs.logType, pattern)
        )
      );
      
      const [logsData, [{ total }]] = await Promise.all([
        db.query.auditLogs.findMany({
          where: whereClause,
          orderBy: [desc(auditLogs.formationDate)],
          limit,
          offset,
        }),
        db.select({ total: count() }).from(auditLogs).where(whereClause),
      ]);
      logs = logsData;
      totalCount = Number(total || 0);
    } else {
      const whereClause = eq(auditLogs.projectId, projectId);
      const [logsData, [{ total }]] = await Promise.all([
        db.query.auditLogs.findMany({
          where: whereClause,
          orderBy: [desc(auditLogs.formationDate)],
          limit,
          offset,
        }),
        db.select({ total: count() }).from(auditLogs).where(whereClause),
      ]);
      logs = logsData;
      totalCount = Number(total || 0);
    }

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error("[Get Audit Logs Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
}

export async function exportAuditLogsCsv(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.projectId, projectId),
      orderBy: [desc(auditLogs.formationDate)],
      limit: 10000,
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
