import { Request, Response } from "express";
import { db } from "../db/db";
import { projectDocuments, auditLogs, dossierConfig } from "../db/schema";
import { uploadToImageKit, deleteFromImageKit } from "../services/imagekit.service";
import { compileEctdPackage, sanitizeSequence } from "../services/compilation.service";
import { calculateMD5 } from "../utils/crypto.util";
import { resolveProjectId, getSingleParam } from "../utils/params.util";
import { eq, and } from "drizzle-orm";

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  const projectId = await resolveProjectId(req.params.id);
  const nodeId = getSingleParam(req.params.nodeId);
  const rawOp = req.query.operation || req.body?.operation || "new";
  const operationInput = rawOp.toString().toLowerCase();

  if (!projectId || !nodeId) {
    res.status(400).json({ success: false, message: "Invalid project ID or node ID." });
    return;
  }

  const operation: "new" | "replace" | "delete" =
    operationInput === "replace" ? "replace" : operationInput === "delete" ? "delete" : "new";

  const config = await db.query.dossierConfig.findFirst({
    where: eq(dossierConfig.projectId, projectId),
  });
  const currentSeq = sanitizeSequence(config?.dossierSequence);

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
  const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : undefined);
  if (!file || !file.buffer) {
    res.status(400).json({
      success: false,
      message: `Missing 'file' parameter for '${operation}' document operation. Please attach a file.`,
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

  const md5Checksum = calculateMD5(file.buffer);
  let uploadedFileId: string | null = null;

  try {
    const ikResult = await uploadToImageKit(
      file.buffer,
      file.originalname,
      `/ectd-dossiers/proj-${projectId}`
    );
    uploadedFileId = ikResult.fileId;

    const rawDocCode = req.query.docCode || req.body?.docCode;
    const rawDocType = req.query.docType || req.body?.docType;
    const docCode = rawDocCode ? rawDocCode.toString() : undefined;
    const docType = rawDocType ? rawDocType.toString() : undefined;

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
          docCode,
          docType,
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
    const projectId = await resolveProjectId(req.params.id);
    const nodeId = getSingleParam(req.params.nodeId);

    if (!projectId || !nodeId) {
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

export async function getAllProjectDocuments(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID." });
      return;
    }

    const documents = await db.query.projectDocuments.findMany({
      where: and(
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.status, "active")
      ),
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error("[Get All Project Documents Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch project documents" });
  }
}

export async function deleteDocumentByNode(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    const nodeId = getSingleParam(req.params.nodeId);

    if (!projectId || !nodeId) {
      res.status(400).json({ success: false, message: "Invalid project ID or node ID." });
      return;
    }

    const docIdParam = req.query.docId || req.body?.docId;
    let activeDoc = null;

    if (docIdParam && !isNaN(parseInt(String(docIdParam), 10))) {
      const parsedId = parseInt(String(docIdParam), 10);
      activeDoc = await db.query.projectDocuments.findFirst({
        where: and(
          eq(projectDocuments.projectId, projectId),
          eq(projectDocuments.id, parsedId)
        ),
      });
    }

    if (!activeDoc) {
      activeDoc = await db.query.projectDocuments.findFirst({
        where: and(
          eq(projectDocuments.projectId, projectId),
          eq(projectDocuments.nodeId, nodeId),
          eq(projectDocuments.status, "active")
        ),
      });
    }

    if (!activeDoc) {
      res.status(200).json({
        success: true,
        message: `No active document found at node '${nodeId}' to delete.`,
      });
      return;
    }

    const config = await db.query.dossierConfig.findFirst({
      where: eq(dossierConfig.projectId, projectId),
    });
    const currentSeq = sanitizeSequence(config?.dossierSequence);

    const tombstoneRecord = await db.transaction(async (tx) => {
      await tx
        .update(projectDocuments)
        .set({ status: "superseded" })
        .where(eq(projectDocuments.id, activeDoc.id));

      const [tombstone] = await tx
        .insert(projectDocuments)
        .values({
          projectId,
          nodeId: activeDoc.nodeId || nodeId,
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
        message: `Deleted active document '${activeDoc.originalName}' from node '${activeDoc.nodeId || nodeId}' and created eCTD tombstone record.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return tombstone;
    });

    if (activeDoc.imageKitFileId) {
      try {
        await deleteFromImageKit(activeDoc.imageKitFileId);
      } catch (ikErr: any) {
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
    res.status(500).json({ success: false, message: error.message || "Failed to delete document" });
  }
}

export async function seedSorbitDossier(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    const config = await db.query.dossierConfig.findFirst({
      where: eq(dossierConfig.projectId, projectId),
    });
    const currentSeq = sanitizeSequence(config?.dossierSequence);

    const { activeDocuments } = await import("../fixtures/sorbitDossier.fixture.js");

    const insertedDocs = await db.transaction(async (tx) => {
      await tx
        .update(projectDocuments)
        .set({ status: "superseded" })
        .where(and(eq(projectDocuments.projectId, projectId), eq(projectDocuments.status, "active")));

      const docsToInsert = activeDocuments.map((item: any, index: number) => ({
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

export async function updateDocumentDates(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    const nodeId = getSingleParam(req.params.nodeId);
    const { issueDate, expirationDate } = req.body;

    if (!projectId || !nodeId) {
      res.status(400).json({ success: false, message: "Invalid project ID or node ID." });
      return;
    }

    if (issueDate && expirationDate) {
      const issue = new Date(issueDate);
      const exp = new Date(expirationDate);
      if (exp < issue) {
        res.status(400).json({
          success: false,
          message: "Document expiration date cannot be earlier than issue date.",
        });
        return;
      }
    }

    let activeDoc = await db.query.projectDocuments.findFirst({
      where: and(
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.nodeId, nodeId),
        eq(projectDocuments.status, "active")
      ),
    });

    if (!activeDoc && req.body.docId && !isNaN(parseInt(req.body.docId, 10))) {
      activeDoc = await db.query.projectDocuments.findFirst({
        where: eq(projectDocuments.id, parseInt(req.body.docId, 10)),
      });
    }

    const config = await db.query.dossierConfig.findFirst({
      where: eq(dossierConfig.projectId, projectId),
    });
    const currentSeq = sanitizeSequence(config?.dossierSequence);

    const updatedDoc = await db.transaction(async (tx) => {
      let doc;
      if (activeDoc) {
        [doc] = await tx
          .update(projectDocuments)
          .set({
            issueDate: issueDate ? new Date(issueDate) : null,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
          })
          .where(eq(projectDocuments.id, activeDoc.id))
          .returning();
      } else {
        [doc] = await tx
          .insert(projectDocuments)
          .values({
            projectId,
            nodeId,
            originalName: req.body.fileName || `${nodeId}. Cover Letter Miconazole.pdf`,
            sequence: currentSeq,
            status: "active",
            operation: "new",
            fileSize: 0,
            md5Checksum: "MD5",
            issueDate: issueDate ? new Date(issueDate) : null,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
          })
          .returning();
      }

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Updated dates for document '${doc.originalName}' at node '${nodeId}' (Issue Date: ${issueDate || "N/A"}, Expiration Date: ${expirationDate || "N/A"}).`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return doc;
    });

    res.status(200).json({
      success: true,
      data: updatedDoc,
      message: "Document dates updated successfully.",
    });
  } catch (error: any) {
    console.error("[Update Document Dates Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update document dates" });
  }
}



