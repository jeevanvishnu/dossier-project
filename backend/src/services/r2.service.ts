import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";
import crypto from "crypto";
import { Readable } from "stream";

let r2ClientInstance: S3Client | null = null;

/**
 * Resets the singleton S3Client instance.
 * Essential for credential rotation in production without restarting the process.
 */
export function resetR2Client(): void {
  r2ClientInstance = null;
  console.log("[R2 Service] S3Client instance cache cleared. Will re-initialize with fresh credentials on next call.");
}

/**
 * Returns a configured singleton instance of the S3Client targeting Cloudflare R2.
 * Includes explicit HTTPS Agent configuration with keepAlive and TLS 1.2+ to prevent
 * socket termination and SSL alert 40 errors during connection handshakes.
 */
export function getR2Client(): S3Client {
  if (r2ClientInstance) return r2ClientInstance;

  const rawAccountId = process.env.R2_ACCOUNT_ID;
  const rawAccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const rawSecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!rawAccountId || !rawAccessKeyId || !rawSecretAccessKey) {
    console.error("[R2 Service Error] Missing R2 credentials in environment variables:", {
      hasAccountId: Boolean(rawAccountId),
      hasAccessKeyId: Boolean(rawAccessKeyId),
      hasSecretAccessKey: Boolean(rawSecretAccessKey),
    });
    throw new Error(
      "[R2 Service] Missing Cloudflare R2 configuration. Ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are set in .env"
    );
  }

  // Strip potential wrapping quotes or whitespace from .env strings
  const accountId = rawAccountId.trim().replace(/^["']|["']$/g, "");
  const accessKeyId = rawAccessKeyId.trim().replace(/^["']|["']$/g, "");
  const secretAccessKey = rawSecretAccessKey.trim().replace(/^["']|["']$/g, "");
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  console.log(`[R2 Service] Initializing S3Client for Account ID: ${accountId.slice(0, 6)}... Endpoint: ${endpoint}`);

  // Create an HTTPS Agent with keepAlive and TLS 1.2+ to avoid SSL alert 40 (handshake failure)
  const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  });

  r2ClientInstance = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestHandler: new NodeHttpHandler({
      httpsAgent,
      connectionTimeout: 15000,
      requestTimeout: 60000,
    }),
  });

  return r2ClientInstance;
}

/**
 * Resolves the configured bucket name for R2 storage.
 */
export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  const cleanBucket = (bucket || "ectd-dossiers").trim().replace(/^["']|["']$/g, "");
  return cleanBucket;
}

/**
 * Standard multipart chunk size: 100 MB.
 * 100 MB chunks allow up to 5 GB files in 50 parts, safely below R2's 10,000 part ceiling.
 */
export const CHUNK_SIZE = 100 * 1024 * 1024; // 100 MB

export interface PresignedPartUrl {
  partNumber: number;
  url: string;
}

export interface InitiateMultipartResult {
  uploadId: string;
  partUrls: PresignedPartUrl[];
  chunkSize: number;
  totalParts: number;
}

/**
 * Formats and prints diagnostic details for S3 / TLS / SSL errors to console.log/error
 */
export function logR2Error(action: string, error: unknown, context?: Record<string, unknown>): void {
  const err = error as Record<string, unknown> | undefined;
  const message = (err?.message as string) || String(error);
  const code = (err?.code as string) || (err?.Code as string) || "UNKNOWN_CODE";
  const errno = err?.errno as number | undefined;
  const syscall = err?.syscall as string | undefined;
  const metadata = err?.$metadata as Record<string, unknown> | undefined;

  console.error(`[R2 Service Error] ❌ ${action} failed:`, {
    message,
    code,
    errno,
    syscall,
    metadata,
    context,
  });

  // Provide specific diagnostic hints based on the error pattern
  if (code === "EPROTO" || message.includes("SSL alert number 40") || message.includes("handshake failure")) {
    console.error(
      `[R2 Diagnostics] ⚠️ SSL Alert 40 / EPROTO (TLS Handshake Failure):\n` +
      `  - Target Endpoint: https://${(process.env.R2_ACCOUNT_ID || "").trim()}.r2.cloudflarestorage.com\n` +
      `  - Root Cause: Node.js TLS connection was rejected during the handshake.\n` +
      `  - Possible Reasons:\n` +
      `    1. The Cloudflare R2 Account ID does not match your Cloudflare account.\n` +
      `    2. A newly created R2 account/bucket SSL certificate is still propagating across Cloudflare edge locations.\n` +
      `    3. Outgoing TLS connection was blocked or dropped by local firewall/proxy.`
    );
  } else if (code === "AccessDenied" || err?.name === "AccessDenied" || metadata?.httpStatusCode === 403) {
    console.error(
      `[R2 Diagnostics] ⚠️ AccessDenied (HTTP 403):\n` +
      `  - Bucket: ${getR2BucketName()}\n` +
      `  - Root Cause: The R2 API Token does not have permission for this operation.\n` +
      `  - Resolution: In Cloudflare Dashboard > R2 > Manage R2 API Tokens, verify that the token has 'Object Read & Write' permission and access to bucket '${getR2BucketName()}'.`
    );
  } else if (code === "NoSuchBucket" || metadata?.httpStatusCode === 404) {
    console.error(
      `[R2 Diagnostics] ⚠️ Bucket '${getR2BucketName()}' not found (HTTP 404). Ensure the bucket exists in your Cloudflare R2 dashboard.`
    );
  }
}

/**
 * Initiates a multipart upload on Cloudflare R2 and generates presigned PUT URLs for all parts.
 */
export async function initiateMultipartUpload(
  key: string,
  mimeType: string,
  fileSize: number,
  chunkSize = CHUNK_SIZE
): Promise<InitiateMultipartResult> {
  const client = getR2Client();
  const bucket = getR2BucketName();
  const effectiveChunkSize = chunkSize > 0 ? chunkSize : CHUNK_SIZE;
  const totalParts = Math.max(1, Math.ceil(fileSize / effectiveChunkSize));

  console.log(`[R2 Service] 🚀 Initiating multipart upload: Bucket="${bucket}", Key="${key}", Size=${fileSize} bytes, TotalParts=${totalParts}`);

  try {
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType || "application/octet-stream",
    });

    const response = await client.send(createCommand);
    const uploadId = response.UploadId;

    if (!uploadId) {
      throw new Error("[R2 Service] Failed to create multipart upload: No UploadId returned.");
    }

    console.log(`[R2 Service] Multipart upload created. UploadId="${uploadId}". Signing ${totalParts} part URL(s)...`);

    const partUrls: PresignedPartUrl[] = await Promise.all(
      Array.from({ length: totalParts }, async (_, i) => {
        const partNumber = i + 1;
        const partCommand = new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        });

        // BUG-3 FIX: Increase part upload URL expiry from 3600 (1 hr) to 14400 (4 hrs)
        // to prevent timeouts during large (5GB-10GB) uploads on slower or fluctuating uplinks.
        const url = await getSignedUrl(client, partCommand, { expiresIn: 14400 });
        return { partNumber, url };
      })
    );

    console.log(`[R2 Service] ✅ Successfully generated ${partUrls.length} presigned part URL(s) for key "${key}"`);

    return {
      uploadId,
      partUrls,
      chunkSize: effectiveChunkSize,
      totalParts,
    };
  } catch (error) {
    logR2Error("initiateMultipartUpload", error, { bucket, key, mimeType, fileSize, totalParts });
    throw error;
  }
}

/**
 * Finalizes an in-progress multipart upload on Cloudflare R2.
 */
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<void> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  if (!parts || parts.length === 0) {
    throw new Error("[R2 Service] Cannot complete multipart upload with zero parts.");
  }

  console.log(`[R2 Service] ⏳ Completing multipart upload: Bucket="${bucket}", Key="${key}", UploadId="${uploadId}", PartsCount=${parts.length}`);

  try {
    const formattedParts = parts
      .slice()
      .sort((a, b) => a.PartNumber - b.PartNumber)
      .map((p) => ({
        PartNumber: p.PartNumber,
        ETag: p.ETag.startsWith('"') && p.ETag.endsWith('"') ? p.ETag : `"${p.ETag.replace(/"/g, "")}"`,
      }));

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: formattedParts,
      },
    });

    await client.send(completeCommand);
    console.log(`[R2 Service] ✅ Multipart upload finalized successfully in R2: Key="${key}"`);
  } catch (error) {
    logR2Error("completeMultipartUpload", error, { bucket, key, uploadId, partsCount: parts?.length });
    throw error;
  }
}

/**
 * Aborts a multipart upload to clean up any orphaned parts in R2.
 */
export async function abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  console.log(`[R2 Service] 🛑 Aborting multipart upload: Bucket="${bucket}", Key="${key}", UploadId="${uploadId}"`);

  try {
    const abortCommand = new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    });

    await client.send(abortCommand);
    console.log(`[R2 Service] ✅ Multipart upload aborted and cleaned up: Key="${key}"`);
  } catch (error) {
    logR2Error("abortMultipartUpload", error, { bucket, key, uploadId });
    throw error;
  }
}

/**
 * Deletes a single object from Cloudflare R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return;
  const client = getR2Client();
  const bucket = getR2BucketName();

  console.log(`[R2 Service] 🗑️ Deleting object from R2: Bucket="${bucket}", Key="${key}"`);

  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(deleteCommand);
    console.log(`[R2 Service] ✅ Object deleted successfully: Key="${key}"`);
  } catch (error) {
    logR2Error("deleteFromR2", error, { bucket, key });
    throw error;
  }
}

/**
 * Deletes multiple objects in batch from Cloudflare R2 (up to 1000 per request).
 */
export async function deleteMultipleFromR2(keys: string[]): Promise<void> {
  const validKeys = keys.filter(Boolean);
  if (validKeys.length === 0) return;

  const client = getR2Client();
  const bucket = getR2BucketName();

  console.log(`[R2 Service] 🗑️ Batch deleting ${validKeys.length} object(s) from R2 bucket "${bucket}"...`);

  try {
    for (let i = 0; i < validKeys.length; i += 1000) {
      const batch = validKeys.slice(i, i + 1000);
      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      });

      await client.send(command);
    }
    console.log(`[R2 Service] ✅ Batch deletion completed for ${validKeys.length} object(s)`);
  } catch (error) {
    logR2Error("deleteMultipleFromR2", error, { bucket, keysCount: validKeys.length });
    throw error;
  }
}

/**
 * Generates a presigned GET download URL for an R2 object key.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  console.log(`[R2 Service] 🔗 Generating presigned GET URL: Bucket="${bucket}", Key="${key}", ExpiresIn=${expiresInSeconds}s`);

  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, getCommand, { expiresIn: expiresInSeconds });
    return url;
  } catch (error) {
    logR2Error("getPresignedDownloadUrl", error, { bucket, key, expiresInSeconds });
    throw error;
  }
}

/**
 * Directly uploads an in-memory buffer to R2 (for small payloads: avatars, logos, compilation archives).
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType = "application/octet-stream"
): Promise<{ key: string; size: number }> {
  if (!buffer || buffer.length === 0) {
    throw new Error("[R2 Service] Cannot upload empty buffer.");
  }

  const client = getR2Client();
  const bucket = getR2BucketName();

  console.log(`[R2 Service] 📦 Uploading buffer directly to R2: Bucket="${bucket}", Key="${key}", Size=${buffer.length} bytes, ContentType="${contentType}"`);

  try {
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await client.send(putCommand);
    console.log(`[R2 Service] ✅ Direct buffer upload completed: Key="${key}" (${buffer.length} bytes)`);

    return {
      key,
      size: buffer.length,
    };
  } catch (error) {
    logR2Error("uploadBufferToR2", error, { bucket, key, contentType, size: buffer.length });
    throw error;
  }
}

/**
 * Downloads an object buffer directly from Cloudflare R2.
 */
export async function downloadBufferFromR2(key: string): Promise<Buffer> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  console.log(`[R2 Service] 📥 Downloading buffer from R2: Bucket="${bucket}", Key="${key}"`);

  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(getCommand);
    if (!response.Body) {
      throw new Error(`[R2 Service] Empty response body for key: ${key}`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const resultBuffer = Buffer.concat(chunks);
    console.log(`[R2 Service] ✅ Buffer downloaded: Key="${key}" (${resultBuffer.length} bytes)`);
    return resultBuffer;
  } catch (error) {
    logR2Error("downloadBufferFromR2", error, { bucket, key });
    throw error;
  }
}

/**
 * Generates an organized, partitioned R2 object storage key.
 */
export function generateR2Key(
  projectId: string,
  originalName: string,
  prefix: string = "ectd-dossiers"
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID();
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_").toLowerCase();
  return `${prefix}/proj-${projectId}/${year}/${month}/${uuid}-${safeName}`;
}
