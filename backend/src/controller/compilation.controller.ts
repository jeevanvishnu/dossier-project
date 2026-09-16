import { Request, Response } from "express";
import { db } from "../db/db";
import { projects, dossierConfig, projectDocuments, packageArchives, auditLogs } from "../db/schema";
import { compileEctdPackage, sanitizeSequence } from "../services/compilation.service";
import { uploadToImageKit } from "../services/imagekit.service";
import { resolveProjectId } from "../utils/params.util";
import { eq, and, desc, inArray, ne, or } from "drizzle-orm";

export async function getPackageArchives(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const archives = await db.query.packageArchives.findMany({
      where: eq(packageArchives.projectId, projectId),
      orderBy: [desc(packageArchives.generatedAt)],
    });

    res.status(200).json({
      success: true,
      count: archives.length,
      data: archives,
    });
  } catch (error: any) {
    console.error("[Get Package Archives Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch package archives" });
  }
}

export async function compileProjectPackage(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    const targetConfigId = req.body?.dossierConfigId || req.query?.dossierConfigId;
    const targetSeqParam = req.body?.sequence || req.query?.sequence;

    let targetConfig = null;

    if (targetConfigId) {
      targetConfig = await db.query.dossierConfig.findFirst({
        where: and(eq(dossierConfig.id, parseInt(String(targetConfigId))), eq(dossierConfig.projectId, projectId)),
      });
    } else if (targetSeqParam) {
      const cleanSeq = sanitizeSequence(String(targetSeqParam));
      const allConfigs = await db.query.dossierConfig.findMany({
        where: eq(dossierConfig.projectId, projectId),
        orderBy: [desc(dossierConfig.id)],
      });
      targetConfig = allConfigs.find((c) => sanitizeSequence(c.dossierSequence) === cleanSeq) || allConfigs[0] || null;
    } else {
      targetConfig = await db.query.dossierConfig.findFirst({
        where: eq(dossierConfig.projectId, projectId),
        orderBy: [desc(dossierConfig.id)],
      });
    }

    const targetSequence = sanitizeSequence(targetConfig?.dossierSequence);

    // For sequence 0000 (initial registration submission), compile ONLY active documents.
    // Draft deletes during sequence 0000 do not create tombstones in initial sequence XML.
    // For subsequent sequences (> 0000), compile active documents and valid sequence tombstones.
    const docsToCompile = await db.query.projectDocuments.findMany({
      where:
        targetSequence === "0000"
          ? and(
            eq(projectDocuments.projectId, projectId),
            eq(projectDocuments.status, "active")
          )
          : and(
            eq(projectDocuments.projectId, projectId),
            or(
              eq(projectDocuments.status, "active"),
              and(
                eq(projectDocuments.status, "deleted"),
                eq(projectDocuments.sequence, targetSequence),
                ne(projectDocuments.sequence, "0000")
              )
            )
          ),
    });

    if (docsToCompile.length === 0) {
      res.status(400).json({
        success: false,
        message: "Cannot compile dossier: No active documents found for this project.",
      });
      return;
    }

    console.log(`[eCTD Compiler] Compiling ${docsToCompile.length} active documents for Project ${projectId} (Sequence ${targetSequence})...`);
    const compilation = await compileEctdPackage(project, targetConfig || null, docsToCompile);

    const ikResult = await uploadToImageKit(
      compilation.zipBuffer,
      compilation.fullName,
      `/ectd-archives/proj-${projectId}`
    );

    const createdArchive = await db.transaction(async (tx) => {
      const [archiveRecord] = await tx
        .insert(packageArchives)
        .values({
          projectId,
          fullName: compilation.fullName,
          size: compilation.size,
          xmlChecksum: compilation.xmlChecksum,
          zipChecksum: compilation.zipChecksum,
          downloadUrl: ikResult.url,
        })
        .returning();

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Compiled eCTD archive '${compilation.fullName}'. ZIP MD5: ${compilation.zipChecksum}, XML MD5: ${compilation.xmlChecksum}, Size: ${compilation.size} bytes.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return archiveRecord;
    });

    res.status(201).json({
      success: true,
      data: createdArchive,
      message: "eCTD Dossier package compiled and uploaded successfully",
    });
  } catch (error: any) {
    console.error("[Compilation Controller Error]", error);

    const projectId = await resolveProjectId(req.params.id);
    if (projectId) {
      try {
        await db.insert(auditLogs).values({
          projectId,
          logType: "ERROR",
          message: `Compilation failed: ${error.message || "Unknown error during ZIP generation"}`,
          userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
        });
      } catch (auditErr) {
        console.error("Failed to log compilation failure audit:", auditErr);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to compile eCTD dossier package",
    });
  }
}
