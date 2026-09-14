import { Request, Response } from "express";
import { db } from "../db/db";
import { projectDocuments, auditLogs, dossierConfig } from "../db/schema";
import { uploadToImageKit, deleteFromImageKit } from "../services/imagekit.service";
import { calculateMD5 } from "../utils/crypto.util";
import { parseIdParam, getSingleParam } from "../utils/params.util";
import { eq, and } from "drizzle-orm";

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  const projectId = parseIdParam(req.params.id);
  const nodeId = getSingleParam(req.params.nodeId);
  const operationInput = (req.body.operation || req.query.operation || "new").toString().toLowerCase();

  if (isNaN(projectId) || !nodeId) {
    res.status(400).json({ success: false, message: "Invalid project ID or node ID." });
    return;
  }

  const operation: "new" | "replace" | "delete" =
    operationInput === "replace" ? "replace" : operationInput === "delete" ? "delete" : "new";

  const config = await db.query.dossierConfig.findFirst({
    where: eq(dossierConfig.projectId, projectId),
  });
  const currentSeq = config?.dossierSequence || "0000";

  // Check for pre-existing active document at this nodeId
  const existingActive = await db.query.projectDocuments.findFirst({
    where: and(
      eq(projectDocuments.projectId, projectId),
      eq(projectDocuments.nodeId, nodeId),
      eq(projectDocuments.status, "active")
    ),
  });

  // ─── 1. OPERATION = 'delete' ───────────────────────────────────────────────
  if (operation === "delete") {
    if (!existingActive) {
      res.status(400).json({
        success: false,
        message: `No active document exists at node '${nodeId}' to delete.`,
      });
      return;
    }

    try {
      // Create tombstone record & supersede active document in transaction
      const tombstoneRecord = await db.transaction(async (tx) => {
        await tx
          .update(projectDocuments)
          .set({ status: "superseded" })
          .where(eq(projectDocuments.id, existingActive.id));

        const [tombstone] = await tx
          .insert(projectDocuments)
          .values({
            projectId,
            nodeId,
            originalName: existingActive.originalName,
            imageKitUrl: null,
            imageKitFileId: null,
            fileSize: 0,
            sequence: currentSeq,
            md5Checksum: existingActive.md5Checksum,
            status: "deleted",
            operation: "delete",
          })
          .returning();

        await tx.insert(auditLogs).values({
          projectId,
          logType: "WARNING",
          message: `Created eCTD tombstone delete record for document '${existingActive.originalName}' at node '${nodeId}'.`,
          userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
        });

        return tombstone;
      });

      // Physically delete old file from ImageKit remote storage
      if (existingActive.imageKitFileId) {
        try {
          await deleteFromImageKit(existingActive.imageKitFileId);
        } catch (ikErr: any) {
          console.warn(
            `[ImageKit Deletion Warning] Could not remove cloud file ${existingActive.imageKitFileId}: ${ikErr.message}`
          );
        }
      }

      res.status(200).json({
        success: true,
        data: tombstoneRecord,
        message: `Document at node '${nodeId}' marked as deleted with eCTD tombstone record.`,
      });
      return;
    } catch (error: any) {
      console.error(`[Delete Document Error - Project ${projectId}, Node ${nodeId}]`, error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process document deletion.",
      });
      return;
    }
  }

  // ─── 2. OPERATION = 'new' OR 'replace' REQUIRES FILE PAYLOAD ──────────────
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: `No file attached for '${operation}' document operation.`,
    });
    return;
  }

  if (operation === "new" && existingActive) {
    res.status(400).json({
      success: false,
      message: `An active document already exists at node '${nodeId}'. Use 'replace' operation to supersede it.`,
    });
    return;
  }

  if (operation === "replace" && !existingActive) {
    res.status(400).json({
      success: false,
      message: `No active document exists at node '${nodeId}' to replace. Use 'new' operation.`,
    });
    return;
  }

  const file = req.file;
  const md5Checksum = calculateMD5(file.buffer);
  let uploadedFileId: string | null = null;

  try {
    const ikResult = await uploadToImageKit(
      file.buffer,
      file.originalname,
      `/ectd-dossiers/proj-${projectId}`
    );
    uploadedFileId = ikResult.fileId;

    const newDocRecord = await db.transaction(async (tx) => {
      if (existingActive) {
        await tx
          .update(projectDocuments)
          .set({ status: "superseded" })
          .where(eq(projectDocuments.id, existingActive.id));
      }

      const [inserted] = await tx
        .insert(projectDocuments)
        .values({
          projectId,
          nodeId,
          originalName: file.originalname,
          imageKitUrl: ikResult.url,
          imageKitFileId: ikResult.fileId,
          fileSize: file.size,
          sequence: currentSeq,
          md5Checksum,
          status: "active",
          operation,
        })
        .returning();

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Uploaded document '${file.originalname}' (Operation: ${operation}) to node '${nodeId}'. MD5: ${md5Checksum}. Sequence: ${currentSeq}.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return inserted;
    });

    res.status(201).json({
      success: true,
      data: newDocRecord,
      message: `Document (${operation}) uploaded successfully.`,
    });
  } catch (error: any) {
    console.error(`[Upload Document Error - Project ${projectId}, Node ${nodeId}]`, error);

    if (uploadedFileId) {
      console.warn(`[Distributed Rollback] Cleaning up orphaned ImageKit file: ${uploadedFileId}`);
      try {
        await deleteFromImageKit(uploadedFileId);
      } catch (cleanupErr) {
        console.error(`[Distributed Rollback Failed] Could not delete orphaned file ${uploadedFileId}:`, cleanupErr);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process document upload",
    });
  }
}

export async function getDocumentByNode(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    const nodeId = getSingleParam(req.params.nodeId);

    if (isNaN(projectId) || !nodeId) {
      res.status(400).json({ success: false, message: "Invalid project ID or node ID." });
      return;
    }

    const document = await db.query.projectDocuments.findFirst({
      where: and(
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.nodeId, nodeId),
        eq(projectDocuments.status, "active")
      ),
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: `No active document found for node ID '${nodeId}' in project ${projectId}.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    console.error("[Get Document Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch document" });
  }
}

export async function deleteDocumentByNode(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    const nodeId = getSingleParam(req.params.nodeId);

    if (isNaN(projectId) || !nodeId) {
      res.status(400).json({ success: false, message: "Invalid project ID or node ID." });
      return;
    }

    const activeDoc = await db.query.projectDocuments.findFirst({
      where: and(
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.nodeId, nodeId),
        eq(projectDocuments.status, "active")
      ),
    });

    if (!activeDoc) {
      res.status(404).json({ success: false, message: `Active document for node '${nodeId}' not found.` });
      return;
    }

    const config = await db.query.dossierConfig.findFirst({
      where: eq(dossierConfig.projectId, projectId),
    });
    const currentSeq = config?.dossierSequence || "0000";

    const tombstoneRecord = await db.transaction(async (tx) => {
      await tx
        .update(projectDocuments)
        .set({ status: "superseded" })
        .where(eq(projectDocuments.id, activeDoc.id));

      const [tombstone] = await tx
        .insert(projectDocuments)
        .values({
          projectId,
          nodeId,
          originalName: activeDoc.originalName,
          imageKitUrl: null,
          imageKitFileId: null,
          fileSize: 0,
          sequence: currentSeq,
          md5Checksum: activeDoc.md5Checksum,
          status: "deleted",
          operation: "delete",
        })
        .returning();

      await tx.insert(auditLogs).values({
        projectId,
        logType: "WARNING",
        message: `Deleted active document '${activeDoc.originalName}' from node '${nodeId}' and created eCTD tombstone record.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return tombstone;
    });

    if (activeDoc.imageKitFileId) {
      try {
        await deleteFromImageKit(activeDoc.imageKitFileId);
      } catch (ikErr) {
        console.warn(`[Delete Document Warning] Failed to delete file ${activeDoc.imageKitFileId} from ImageKit`, ikErr);
      }
    }

    res.status(200).json({
      success: true,
      data: tombstoneRecord,
      message: `Document at node '${nodeId}' deleted successfully.`,
    });
  } catch (error: any) {
    console.error("[Delete Document Error]", error);
    res.status(500).json({ success: false, message: "Failed to delete document" });
  }
}

export async function seedSorbitDossier(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const config = await db.query.dossierConfig.findFirst({
      where: eq(dossierConfig.projectId, projectId),
    });
    const currentSeq = config?.dossierSequence || "0000";

    const { activeDocuments } = await import("../fixtures/sorbitDossier.fixture");

    const insertedDocs = await db.transaction(async (tx) => {
      await tx
        .update(projectDocuments)
        .set({ status: "superseded" })
        .where(and(eq(projectDocuments.projectId, projectId), eq(projectDocuments.status, "active")));

      const docsToInsert = activeDocuments.map((item, index) => ({
        projectId,
        nodeId: item.nodeId,
        originalName: item.originalName,
        sequence: currentSeq,
        uploadedAt: new Date("2026-08-12T15:07:50Z"),
        status: "active" as const,
        operation: "new" as const,
        imageKitUrl: `https://ik.imagekit.io/ectd/test/${encodeURIComponent(item.originalName)}`,
        imageKitFileId: `seed_file_${index + 1}`,
        fileSize: 1024567,
        md5Checksum: "d9e1049125db0e4d416206eb7e5b54ef",
      }));

      const inserted = await tx.insert(projectDocuments).values(docsToInsert).returning();

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Seeded project ${projectId} with ${activeDocuments.length} Russian client Sorbit dossier documents.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return inserted;
    });

    res.status(200).json({
      success: true,
      count: insertedDocs.length,
      data: insertedDocs,
      message: "Seeded project with Russian client Sorbit dossier documents successfully.",
    });
  } catch (error: any) {
    console.error("[Seed Sorbit Dossier Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to seed Sorbit dossier" });
  }
}


