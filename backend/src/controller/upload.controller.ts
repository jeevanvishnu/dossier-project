import { Request, Response } from "express";
import {
  initiateMultipartUpload,
  completeMultipartUpload,
  abortMultipartUpload,
  deleteFromR2,
  generateR2Key,
  getPresignedDownloadUrl,
  getR2BucketName,
} from "../services/r2.service";
import { db } from "../db/db";
import { projectDocuments, auditLogs, dossierConfig } from "../db/schema";
import { StorageService } from "../services/storage.service";
import { CacheService, CacheKeys } from "../lib/cache";
import { sanitizeSequence } from "../services/compilation.service";
import { resolveProjectId } from "../utils/params.util";
import { eq, and } from "drizzle-orm";

const ALLOWED_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/xml",
  "text/xml",
  "application/zip",
  "image/png",
  "image/jpeg",
  "image/webp",
];

/**
 * POST /api/upload/initiate
 * Validates file meta, enforces company quota, and generates multipart presigned PUT URLs.
 */
export async function initiateUpload(req: Request, res: Response): Promise<void> {
  const { fileName, fileSize, mimeType, projectId, nodeId, operation, dossierConfigId } = req.body || {};

  console.log(`[Upload Controller] 📥 POST /api/upload/initiate received:`, {
    fileName,
    fileSize,
    mimeType,
    projectId,
    nodeId,
    operation,
    dossierConfigId,
    userId: req.user?.id,
  });

  try {
    if (!fileName || fileSize === undefined || !mimeType || !projectId || !nodeId) {
      console.warn(`[Upload Controller] Missing required fields in initiate request`);
      res.status(400).json({
        success: false,
        message: "Missing required fields: fileName, fileSize, mimeType, projectId, and nodeId are required.",
      });
      return;
    }

    const numericSize = Number(fileSize);
    if (isNaN(numericSize) || numericSize <= 0) {
      console.warn(`[Upload Controller] Invalid fileSize: ${fileSize}`);
      res.status(400).json({ success: false, message: "Invalid fileSize specified." });
      return;
    }

    if (!ALLOWED_MIMES.includes(mimeType)) {
      console.warn(`[Upload Controller] Unsupported MIME type: ${mimeType}`);
      res.status(415).json({
        success: false,
        message: `Unsupported file type: ${mimeType}. Allowed formats: PDF, DOC, DOCX, XML, ZIP, PNG, JPG.`,
      });
      return;
    }

    // Path traversal safety
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      console.warn(`[Upload Controller] Potential path traversal filename: ${fileName}`);
      res.status(400).json({ success: false, message: "Invalid file name format." });
      return;
    }

    const resolvedProjectId = await resolveProjectId(projectId);
    if (!resolvedProjectId) {
      console.warn(`[Upload Controller] Project not found: ${projectId}`);
      res.status(404).json({ success: false, message: "Project not found." });
      return;
    }

    // Check for existing active document to accurately calculate delta for quota
    const existingActive = await db.query.projectDocuments.findFirst({
      where: and(
        eq(projectDocuments.projectId, resolvedProjectId),
        eq(projectDocuments.nodeId, nodeId),
        eq(projectDocuments.status, "active")
      ),
    });

    if (operation === "new" && existingActive) {
      console.warn(`[Upload Controller] Active document already exists at node '${nodeId}'`);
      res.status(409).json({
        success: false,
        message: `An active document already exists at node '${nodeId}'. Use 'replace' operation to supersede it.`,
      });
      return;
    }

    // BUG-4 FIX: Enforce authentication and storage quota. Never skip if user context is missing.
    if (!req.user?.id) {
      console.warn(`[Upload Controller] Unauthorized initiate attempt: missing user context`);
      res.status(401).json({ success: false, message: "Authentication required to initiate file upload." });
      return;
    }

    const bytesToAdd =
      operation === "replace" && existingActive
        ? Math.max(0, numericSize - existingActive.fileSize)
        : numericSize;

    try {
      await StorageService.assertStorageAvailable(req.user.id, bytesToAdd);
    } catch (storageErr: any) {
      console.warn(`[Upload Controller] Quota exceeded: ${storageErr.message}`);
      res.status(507).json({
        success: false,
        message: storageErr.message || "Insufficient storage space in company subscription quota.",
      });
      return;
    }

    // Partition key in R2: ectd-dossiers/proj-{projectId}/{YYYY}/{MM}/{uuid}-{safeName}
    const key = generateR2Key(resolvedProjectId, fileName, "ectd-dossiers");
    console.log(`[Upload Controller] Target R2 key: "${key}" in bucket: "${getR2BucketName()}"`);

    const multipartData = await initiateMultipartUpload(key, mimeType, numericSize);

    console.log(`[Upload Controller] ✅ Multipart initiated successfully. UploadId: "${multipartData.uploadId}", Parts: ${multipartData.totalParts}`);

    res.status(200).json({
      success: true,
      key,
      ...multipartData,
    });
  } catch (error: any) {
    console.error("[Upload Controller Error] ❌ initiateUpload failed:", {
      message: error.message,
      name: error.name,
      code: error.code || error.Code,
      errno: error.errno,
      syscall: error.syscall,
      metadata: error.$metadata,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate multipart upload.",
      code: error.code || error.name || "UPLOAD_INITIATE_FAILED",
      details: error.errno ? `System error (${error.syscall}): ${error.code} (errno ${error.errno})` : undefined,
    });
  }
}

/**
 * POST /api/upload/complete
 * Assembles multipart upload on Cloudflare R2 and persists document record in DB transaction.
 */
export async function completeUpload(req: Request, res: Response): Promise<void> {
  const {
    key,
    uploadId,
    parts,
    projectId,
    nodeId,
    operation,
    fileSize,
    md5Checksum,
    dossierConfigId,
    docCode,
    docType,
    originalName,
  } = req.body || {};

  console.log(`[Upload Controller] 📥 POST /api/upload/complete received:`, {
    key,
    uploadId,
    partsCount: Array.isArray(parts) ? parts.length : 0,
    projectId,
    nodeId,
    operation,
    fileSize,
    md5Checksum,
  });

  if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0 || !projectId || !nodeId) {
    console.warn(`[Upload Controller] Complete upload validation failed: missing key, uploadId, parts, projectId or nodeId`);
    res.status(400).json({
      success: false,
      message: "Missing required fields: key, uploadId, parts array, projectId, and nodeId are required.",
    });
    return;
  }

  // BUG-2 & BUG-5 FIX: Validate that each part has a genuine ETag from R2 and no dummy placeholders
  const sanitizedParts = parts.filter(
    (p: any) =>
      p &&
      typeof p.PartNumber === "number" &&
      p.PartNumber > 0 &&
      typeof p.ETag === "string" &&
      p.ETag.trim().length > 0 &&
      !/^part-\d+$/i.test(p.ETag.trim())
  );

  if (sanitizedParts.length === 0 || sanitizedParts.length !== parts.length) {
    console.warn(`[Upload Controller] Invalid parts array provided: contains missing or placeholder ETags`);
    res.status(400).json({
      success: false,
      message: "Invalid parts array. Every uploaded part must have a valid PartNumber and genuine ETag returned by R2.",
    });
    return;
  }

  let multipartCompleted = false;

  try {
    // 1. Finalize multipart upload on Cloudflare R2
    console.log(`[Upload Controller] Calling completeMultipartUpload for key "${key}" with ${sanitizedParts.length} validated parts...`);
    await completeMultipartUpload(key, uploadId, sanitizedParts);
    multipartCompleted = true;

    const resolvedProjectId = await resolveProjectId(projectId);
    if (!resolvedProjectId) {
      throw new Error(`Project ${projectId} not found.`);
    }

    const config = dossierConfigId
      ? await db.query.dossierConfig.findFirst({ where: eq(dossierConfig.id, dossierConfigId) })
      : await db.query.dossierConfig.findFirst({ where: eq(dossierConfig.projectId, resolvedProjectId) });

    const currentSeq = sanitizeSequence(config?.dossierSequence);
    const resolvedDossierConfigId = config?.id ?? null;

    // 2. Persist in database transaction
    let oldStorageKeyToDelete: string | null = null;

    const newDoc = await db.transaction(async (tx) => {
      const existingActive = await tx.query.projectDocuments.findFirst({
        where: resolvedDossierConfigId
          ? and(
              eq(projectDocuments.projectId, resolvedProjectId),
              eq(projectDocuments.nodeId, nodeId),
              eq(projectDocuments.status, "active"),
              eq(projectDocuments.dossierConfigId, resolvedDossierConfigId)
            )
          : and(
              eq(projectDocuments.projectId, resolvedProjectId),
              eq(projectDocuments.nodeId, nodeId),
              eq(projectDocuments.status, "active")
            ),
      });

      if (existingActive && operation === "replace") {
        await tx
          .update(projectDocuments)
          .set({ status: "superseded" })
          .where(eq(projectDocuments.id, existingActive.id));

        if (existingActive.storageKey && existingActive.storageKey !== key) {
          oldStorageKeyToDelete = existingActive.storageKey;
        }
      }

      const [inserted] = await tx
        .insert(projectDocuments)
        .values({
          projectId: resolvedProjectId,
          nodeId,
          docCode: docCode || null,
          docType: docType || null,
          originalName: originalName || key.split("/").pop() || "document.pdf",
          storageUrl: key,
          storageKey: key,
          fileSize: Number(fileSize) || 0,
          sequence: currentSeq,
          dossierConfigId: resolvedDossierConfigId,
          md5Checksum: md5Checksum || null,
          status: "active",
          operation: operation || "new",
        })
        .returning();

      await tx.insert(auditLogs).values({
        projectId: resolvedProjectId,
        logType: "SUCCESS",
        message: `Uploaded '${inserted.originalName}' (${operation || "new"}) to node '${nodeId}'. Storage Key: ${key}. Size: ${fileSize} bytes.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return inserted;
    });

    console.log(`[Upload Controller] ✅ Database record created with ID "${newDoc.id}". StorageKey: "${newDoc.storageKey}"`);

    // Clean up replaced file asynchronously from R2 if applicable
    if (oldStorageKeyToDelete) {
      deleteFromR2(oldStorageKeyToDelete).catch((err) => {
        console.warn(`[R2 Cleanup Warning] Failed to delete superseded object ${oldStorageKeyToDelete}:`, err);
      });
    }

    // Invalidate Redis caches
    await CacheService.del(CacheKeys.projectDossier(resolvedProjectId));
    if (req.user?.companyId) {
      await CacheService.del(CacheKeys.companyStorage(req.user.companyId));
    }

    res.status(201).json({
      success: true,
      data: newDoc,
      message: "Document uploaded and registered successfully in Cloudflare R2.",
    });
  } catch (error: any) {
    console.error("[Upload Controller Error] ❌ completeUpload failed:", {
      message: error.message,
      name: error.name,
      code: error.code || error.Code,
      errno: error.errno,
      syscall: error.syscall,
      metadata: error.$metadata,
      stack: error.stack,
    });

    // Rollback storage if completion or database write failed
    try {
      if (!multipartCompleted) {
        console.log(`[Upload Controller Rollback] Aborting incomplete multipart upload "${uploadId}"...`);
        await abortMultipartUpload(key, uploadId);
      } else {
        console.log(`[Upload Controller Rollback] Deleting completed R2 object "${key}" due to DB persistence failure...`);
        await deleteFromR2(key);
      }
    } catch (cleanupErr) {
      console.error("[Upload Rollback Error] Could not clean up orphaned object:", cleanupErr);
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete multipart upload.",
      code: error.code || error.name || "UPLOAD_COMPLETE_FAILED",
    });
  }
}

/**
 * POST /api/upload/abort
 * Aborts an incomplete multipart upload to prevent dangling storage costs.
 */
export async function abortUpload(req: Request, res: Response): Promise<void> {
  const { key, uploadId } = req.body || {};

  console.log(`[Upload Controller] 🛑 POST /api/upload/abort received:`, { key, uploadId });

  if (!key || !uploadId) {
    res.status(400).json({ success: false, message: "Both key and uploadId are required to abort upload." });
    return;
  }

  try {
    await abortMultipartUpload(key, uploadId);
    res.status(200).json({ success: true, message: "Multipart upload aborted and cleaned up successfully." });
  } catch (error: any) {
    console.error("[Upload Controller Error] ❌ abortUpload failed:", {
      message: error.message,
      name: error.name,
      code: error.code,
      metadata: error.$metadata,
    });
    res.status(500).json({ success: false, message: error.message || "Failed to abort multipart upload." });
  }
}

/**
 * GET /api/upload/url/:docId
 * Generates an on-demand presigned download URL for an active document.
 */
export async function getDocumentPresignedUrlDirect(req: Request, res: Response): Promise<void> {
  try {
    const docId = req.params.docId;
    console.log(`[Upload Controller] 🔗 GET /api/upload/url/:docId received for docId: "${docId}"`);

    if (!docId) {
      res.status(400).json({ success: false, message: "Document ID is required." });
      return;
    }

    const doc = await db.query.projectDocuments.findFirst({
      where: eq(projectDocuments.id, String(docId)),
    });

    if (!doc) {
      console.warn(`[Upload Controller] Document not found for ID: "${docId}"`);
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    const storageKey = doc.storageKey || doc.storageUrl;

    if (!storageKey) {
      console.warn(`[Upload Controller] Missing storageKey for doc "${doc.originalName}" (${doc.id})`);
      res.status(404).json({
        success: false,
        message: "This document does not have a Cloudflare R2 storage key. Re-upload is required.",
      });
      return;
    }

    // If storageKey is a full legacy external URL (e.g. older ImageKit record), return it directly
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
      res.status(200).json({
        success: true,
        url: storageKey,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      });
      return;
    }

    const url = await getPresignedDownloadUrl(storageKey, 3600);
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();

    console.log(`[Upload Controller] ✅ Generated presigned download URL for doc "${doc.originalName}"`);

    res.status(200).json({
      success: true,
      url,
      expiresAt,
    });
  } catch (error: any) {
    console.error("[Upload Controller Error] ❌ getDocumentPresignedUrlDirect failed:", {
      message: error.message,
      name: error.name,
      code: error.code,
      metadata: error.$metadata,
    });
    res.status(500).json({ success: false, message: error.message || "Failed to generate download URL." });
  }
}
