import SparkMD5 from "spark-md5";
import { api } from "@/app/lib/axios";

export const CHUNK_SIZE = 100 * 1024 * 1024; // 100 MB per part
export const DEFAULT_CONCURRENCY = 4;
export const MAX_PART_RETRIES = 3;

export interface R2UploadMeta {
  projectId: string;
  nodeId: string;
  operation: "new" | "replace";
  dossierConfigId?: string;
  docCode?: string;
  docType?: string;
  replaceDocId?: string;
}

export interface UploadProgressInfo {
  percent: number;
  uploadedBytes: number;
  totalBytes: number;
  currentPart: number;
  totalParts: number;
}

export type UploadStatus = "idle" | "hashing" | "initiating" | "uploading" | "completing" | "success" | "error";

export interface R2UploadOptions {
  onProgress?: (info: UploadProgressInfo) => void;
  onStatusChange?: (status: UploadStatus) => void;
  signal?: AbortSignal;
  concurrency?: number;
}

export interface UploadCompleteResponse {
  success: boolean;
  data: Record<string, unknown>;
  message?: string;
}

export interface CompletedPart {
  PartNumber: number;
  ETag: string;
}

/**
 * Computes the MD5 checksum of a large file incrementally without blowing browser RAM.
 * Reads in 10 MB chunks and updates SparkMD5.ArrayBuffer.
 */
export async function computeFileMD5(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  console.log(`[R2 Upload Client] 🔍 Computing MD5 checksum for "${file.name}" (${file.size} bytes)...`);

  return new Promise((resolve, reject) => {
    const sliceSize = 10 * 1024 * 1024; // 10 MB slices for hashing
    const totalSlices = Math.ceil(file.size / sliceSize);
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    let currentSlice = 0;

    fileReader.onload = (e) => {
      try {
        if (e.target?.result) {
          spark.append(e.target.result as ArrayBuffer);
        }
        currentSlice++;
        if (onProgress && totalSlices > 0) {
          onProgress(Math.min(100, Math.round((currentSlice / totalSlices) * 100)));
        }

        if (currentSlice < totalSlices) {
          loadNext();
        } else {
          const hash = spark.end();
          console.log(`[R2 Upload Client] ✅ Computed MD5: ${hash}`);
          resolve(hash);
        }
      } catch (err) {
        console.error(`[R2 Upload Client Error] MD5 hashing failed:`, err);
        reject(err);
      }
    };

    fileReader.onerror = () => {
      console.error(`[R2 Upload Client Error] FileReader error during MD5 calculation.`);
      reject(new Error("Failed to read file for MD5 calculation."));
    };

    function loadNext() {
      const start = currentSlice * sliceSize;
      const end = Math.min(start + sliceSize, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}

/**
 * Uploads a single multipart chunk to Cloudflare R2 via presigned PUT URL with retry logic.
 */
async function uploadPartWithRetry(
  url: string,
  blob: Blob,
  partNumber: number,
  mimeType: string,
  signal?: AbortSignal,
  retries = MAX_PART_RETRIES
): Promise<CompletedPart> {
  let attempt = 0;

  while (attempt < retries) {
    if (signal?.aborted) {
      throw new Error("Upload aborted by user.");
    }

    try {
      if (blob.size === 0) {
        throw new Error(`Part ${partNumber} payload is 0 bytes. Empty part upload is not permitted.`);
      }

      console.log(`[R2 Upload Client] ⬆️ Uploading Part ${partNumber} (${blob.size} bytes, attempt ${attempt + 1}/${retries})...`);

      // In S3 multipart uploads, chunk parts are raw byte slices signed with host only.
      // Omitting Content-Type on part PUT avoids CORS preflight header validation mismatches.
      const response = await fetch(url, {
        method: "PUT",
        body: blob,
        signal,
      });

      if (!response.ok) {
        let errorDetails = "";
        try {
          errorDetails = await response.text();
        } catch {
          // ignore stream read error
        }
        throw new Error(`HTTP ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ""}`);
      }

      const rawEtag = response.headers.get("ETag") || response.headers.get("etag") || "";
      const etag = rawEtag.replace(/^["']|["']$/g, "").trim();

      // BUG-5 FIX: Fail fast if ETag is missing. Never submit synthetic "part-N" placeholders.
      if (!etag) {
        throw new Error(
          `Part ${partNumber} upload succeeded (HTTP ${response.status}), but the browser could not read the 'ETag' response header.\n` +
          `  Root Cause: Cloudflare R2 CORS policy must specify 'ExposeHeaders: ["ETag"]'.\n` +
          `  Without genuine ETags from R2, finalizing multipart upload will fail.`
        );
      }

      console.log(`[R2 Upload Client] ✅ Part ${partNumber} uploaded. ETag: ${etag}`);

      return {
        PartNumber: partNumber,
        ETag: etag,
      };
    } catch (err: unknown) {
      if (signal?.aborted) {
        throw new Error("Upload aborted by user.");
      }

      attempt++;
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[R2 Upload Client Warning] ⚠️ Part ${partNumber} attempt ${attempt} failed: ${errorMessage}`);

      // Provide immediate diagnostic guidance if browser blocked request due to CORS
      if (errorMessage.includes("Failed to fetch") || (err instanceof TypeError && errorMessage.includes("fetch"))) {
        console.error(
          `[R2 Upload Client Error] 🛑 Cross-Origin (CORS) Blocked: 'Failed to fetch' on Part ${partNumber}.\n` +
          `  The browser's preflight OPTIONS request to Cloudflare R2 was rejected.\n` +
          `  ACTION REQUIRED IN CLOUDFLARE DASHBOARD:\n` +
          `  1. Navigate to: dash.cloudflare.com > R2 Storage > Bucket 'ctdex' > Settings > CORS Policy\n` +
          `  2. Set CORS Policy to allow Origins (http://localhost:3000), Methods (GET, PUT, HEAD), Headers (*), and ExposeHeaders (ETag).`
        );
      }

      if (attempt >= retries) {
        console.error(`[R2 Upload Client Error] ❌ Part ${partNumber} failed permanently after ${retries} attempts.`);
        throw new Error(`Part ${partNumber} failed after ${retries} attempts: ${errorMessage}`);
      }

      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 8000);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error(`Part ${partNumber} failed to upload.`);
}

/**
 * Main multipart upload engine: direct browser-to-Cloudflare R2 streaming.
 * Supports files up to 5 GB without buffering in server memory.
 */
export async function uploadFileToR2(
  file: File,
  meta: R2UploadMeta,
  options?: R2UploadOptions
): Promise<UploadCompleteResponse> {
  const { onProgress, onStatusChange, signal, concurrency = DEFAULT_CONCURRENCY } = options || {};

  console.log(`[R2 Upload Client] 🚀 Starting multipart upload for "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`, meta);

  if (!file || file.size <= 0) {
    throw new Error("Cannot upload an empty file (0 bytes).");
  }

  let activeUploadId: string | null = null;
  let activeKey: string | null = null;

  try {
    // ── Phase 1: Client MD5 Checksum ───────────────────────────────────────────
    onStatusChange?.("hashing");
    const md5Checksum = await computeFileMD5(file);

    if (signal?.aborted) {
      throw new Error("Upload aborted by user.");
    }

    // ── Phase 2: Initiate Multipart with Backend ───────────────────────────────
    onStatusChange?.("initiating");
    console.log(`[R2 Upload Client] Calling POST /api/upload/initiate...`);

    const initiateRes = await api.post("/upload/initiate", {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      projectId: meta.projectId,
      nodeId: meta.nodeId,
      operation: meta.operation,
      dossierConfigId: meta.dossierConfigId,
      replaceDocId: meta.replaceDocId,
    });

    if (!initiateRes.data?.success) {
      throw new Error(initiateRes.data?.message || "Failed to initiate multipart upload.");
    }

    const { uploadId, key, partUrls, chunkSize, totalParts } = initiateRes.data;
    activeUploadId = uploadId;
    activeKey = key;

    console.log(`[R2 Upload Client] 📋 Multipart initiated: UploadId="${uploadId}", Key="${key}", TotalParts=${totalParts}, ChunkSize=${chunkSize}`);

    // ── Phase 3: Parallel Chunk Uploading ──────────────────────────────────────
    onStatusChange?.("uploading");

    const partsResult: CompletedPart[] = new Array(totalParts);
    let uploadedBytes = 0;
    let completedPartsCount = 0;

    let currentIndex = 0;

    const worker = async () => {
      while (currentIndex < partUrls.length) {
        if (signal?.aborted) {
          throw new Error("Upload aborted by user.");
        }

        const taskIndex = currentIndex++;
        const { partNumber, url } = partUrls[taskIndex];
        const start = (partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunkBlob = file.slice(start, end);

        // BUG-2 FIX: Skip zero-byte chunk to avoid sending empty parts to R2
        if (chunkBlob.size === 0) {
          console.warn(`[R2 Upload Client] ⚠️ Skipping zero-byte slice for Part ${partNumber}`);
          continue;
        }

        const partResult = await uploadPartWithRetry(
          url,
          chunkBlob,
          partNumber,
          file.type,
          signal
        );

        partsResult[taskIndex] = partResult;
        uploadedBytes += chunkBlob.size;
        completedPartsCount++;

        const percent = Math.min(99, Math.round((uploadedBytes / file.size) * 100));
        onProgress?.({
          percent,
          uploadedBytes,
          totalBytes: file.size,
          currentPart: completedPartsCount,
          totalParts,
        });
      }
    };

    console.log(`[R2 Upload Client] Spawning ${Math.min(concurrency, partUrls.length)} concurrent upload worker(s)...`);
    const workerPool = Array.from(
      { length: Math.min(concurrency, partUrls.length) },
      () => worker()
    );

    await Promise.all(workerPool);

    if (signal?.aborted) {
      throw new Error("Upload aborted by user.");
    }

    console.log(`[R2 Upload Client] ✅ All ${totalParts} part(s) uploaded successfully.`);

    // ── Phase 4: Finalize Multipart Upload in R2 & Register in DB ─────────────
    onStatusChange?.("completing");
    console.log(`[R2 Upload Client] Finalizing upload with POST /api/upload/complete...`);

    const completeRes = await api.post("/upload/complete", {
      key,
      uploadId,
      parts: partsResult.filter((p): p is CompletedPart => Boolean(p && p.PartNumber && p.ETag)),
      projectId: meta.projectId,
      nodeId: meta.nodeId,
      operation: meta.operation,
      fileSize: file.size,
      md5Checksum,
      dossierConfigId: meta.dossierConfigId,
      docCode: meta.docCode,
      docType: meta.docType,
      originalName: file.name,
      replaceDocId: meta.replaceDocId,
    });

    if (!completeRes.data?.success) {
      throw new Error(completeRes.data?.message || "Failed to complete upload registration.");
    }

    console.log(`[R2 Upload Client] 🎉 Upload completed and registered successfully in database!`, completeRes.data);

    onStatusChange?.("success");
    onProgress?.({
      percent: 100,
      uploadedBytes: file.size,
      totalBytes: file.size,
      currentPart: totalParts,
      totalParts,
    });

    return completeRes.data;
  } catch (error: unknown) {
    onStatusChange?.("error");
    console.error("[R2 Upload Client Error] ❌ uploadFileToR2 failed:", error);

    // Clean up R2 parts if aborted or failed
    if (activeKey && activeUploadId) {
      console.log(`[R2 Upload Client] Cleaning up orphaned upload parts: Key="${activeKey}", UploadId="${activeUploadId}"`);
      abortR2Upload(activeKey, activeUploadId).catch((abortErr) => {
        console.warn("[R2 Abort Warning] Failed to clean up multipart:", abortErr);
      });
    }

    throw error;
  }
}

/**
 * Aborts an active multipart upload to free Cloudflare R2 storage.
 */
export async function abortR2Upload(key: string, uploadId: string): Promise<void> {
  try {
    console.log(`[R2 Upload Client] Calling POST /api/upload/abort for key "${key}"...`);
    await api.post("/upload/abort", { key, uploadId });
  } catch (err) {
    console.warn("[abortR2Upload] Error notifying backend of upload abort:", err);
  }
}

/**
 * Requests an on-demand presigned GET download URL for an active document.
 */
export async function getDocumentPresignedUrl(docId: string): Promise<string> {
  console.log(`[R2 Upload Client] Requesting presigned download URL for docId: "${docId}"...`);
  const response = await api.get(`/upload/url/${docId}`);
  if (response.data?.success && response.data?.url) {
    console.log(`[R2 Upload Client] ✅ Received presigned download URL (Expires: ${response.data.expiresAt})`);
    return response.data.url;
  }
  throw new Error(response.data?.message || "Failed to obtain presigned download URL.");
}
