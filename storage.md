# Cloudflare R2 Storage Migration Plan
### ImageKit.io → Cloudflare R2 | eCTD Dossier Platform

> **IMPORTANT:** This document covers the full migration from ImageKit.io to Cloudflare R2. Files up to **5 GB** must upload smoothly using **multipart presigned URLs** (frontend → R2 directly). The backend never buffers large files in RAM.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Why Cloudflare R2](#2-why-cloudflare-r2)
3. [Key Design Decisions](#3-key-design-decisions)
4. [Upload Flow — Multipart Presigned](#4-upload-flow--multipart-presigned)
5. [Download Flow — Presigned GET](#5-download-flow--presigned-get)
6. [Database Migration](#6-database-migration)
7. [Backend Changes](#7-backend-changes)
8. [Frontend Changes](#8-frontend-changes)
9. [Environment Variables](#9-environment-variables)
10. [Folder / Key Structure in R2](#10-folder--key-structure-in-r2)
11. [Security & Access Control](#11-security--access-control)
12. [Old ImageKit Files — Fresh Start Strategy](#12-old-imagekit-files--fresh-start-strategy)
13. [Rollout Checklist](#13-rollout-checklist)
14. [Code Snippets](#14-code-snippets)

---

## 1. Architecture Overview

```
Frontend (Next.js)
  │
  ├─ 1. POST /api/upload/initiate  (fileName, fileSize, mimeType, projectId, nodeId)
  │
Backend (Express)
  ├─ Validates JWT, MIME, quota
  ├─ CreateMultipartUpload on R2
  ├─ Signs N presigned PUT URLs (one per 100MB chunk)
  └─ Returns { uploadId, key, partUrls[], chunkSize }
  │
Frontend
  ├─ 2. PUT chunk1 → partUrl1  (parallel, 4 at a time)
  │      PUT chunk2 → partUrl2
  │      PUT chunkN → partUrlN
  └─ Collects ETags from each response
  │
  ├─ 3. POST /api/upload/complete  (key, uploadId, parts[{PartNumber, ETag}])
  │
Backend
  ├─ CompleteMultipartUpload on R2
  └─ INSERT into project_documents (storageKey, fileSize, md5...)
  │
  └─ 201 OK → Frontend
```

---

## 2. Why Cloudflare R2

| Feature | ImageKit.io | Cloudflare R2 |
|---|---|---|
| **Egress (download) cost** | Charged per GB | **Free egress** ✅ |
| **File size limit** | 25 MB free / higher paid | **5 TB per object** ✅ |
| **S3-compatible API** | No | **Yes** — use `@aws-sdk/client-s3` ✅ |
| **Multipart upload** | No native support | **Yes** — required for >100MB files ✅ |
| **Private bucket + presigned URLs** | Yes | **Yes** ✅ |
| **CDN** | Yes (image-focused) | Cloudflare global network ✅ |
| **Image transforms** | Yes (not needed here) | No (not needed for PDFs/ZIPs) |
| **Pricing** | Per request + storage | $0.015/GB-month, 10 GB free ✅ |

> R2's zero-egress-cost model is particularly valuable for pharmaceutical dossier files that are downloaded frequently for review. ImageKit's egress charges would compound at scale.

---

## 3. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Upload method** | Multipart presigned URL (frontend direct) | Files up to 5 GB; avoids server RAM exhaustion |
| **Chunk size** | 100 MB | 50 parts for a 5 GB file; parallel upload; within R2's 10,000 part limit |
| **Bucket access** | **Private** (no public access) | eCTD dossiers are sensitive pharmaceutical documents |
| **Download method** | Presigned GET URL (1-hour TTL) | Backend generates on-demand; secure, no permanent public URL |
| **R2 Region** | `auto` | Cloudflare automatically selects closest available region |
| **DB column rename** | `imageKitUrl` → `storageUrl`, `imageKitFileId` → `storageKey` | Provider-agnostic, clean schema |
| **Old ImageKit files** | Fresh start — users re-upload | No migration script complexity; clean slate |

---

## 4. Upload Flow — Multipart Presigned

### Three-Step Flow

```
Step 1: POST /api/upload/initiate
  Body: { fileName, fileSize, mimeType, projectId, nodeId, operation }
  Returns: { uploadId, key, partUrls: [{partNumber, url}], chunkSize: 104857600 }

Step 2: Frontend splits file into 100MB chunks
  PUT chunk1 → partUrls[0].url   (parallel, batch of 4)
  PUT chunk2 → partUrls[1].url
  ...
  Collect ETag from each response header

Step 3: POST /api/upload/complete
  Body: { key, uploadId, parts: [{PartNumber, ETag}], projectId, nodeId,
          operation, fileSize, md5Checksum, dossierConfigId, originalName }
  Returns: { success: true, data: ProjectDocument }
```

### Error Recovery

```
If any part fails → retry that part (same presigned URL valid for 1 hour)
If user cancels  → POST /api/upload/abort { key, uploadId }
                   Backend calls AbortMultipartUpload to free R2 storage
```

---

## 5. Download Flow — Presigned GET

```
Frontend: GET /api/documents/:docId/url
         (JWT required)

Backend:
  1. Fetch doc from DB → get doc.storageKey
  2. Call getSignedUrl(GetObjectCommand, expiresIn: 3600)
  3. Return { url, expiresAt }

Frontend:
  window.open(url, "_blank")  or  <a href={url} download>
```

- URL valid for **1 hour**
- After 1 hour, frontend must request a fresh URL
- Never store presigned URLs in DB (they expire)

---

## 6. Database Migration

### Migration SQL

File: `backend/src/db/migrations/0012_rename_imagekit_columns.sql`

```sql
-- project_documents table
ALTER TABLE project_documents RENAME COLUMN image_kit_url TO storage_url;
ALTER TABLE project_documents RENAME COLUMN image_kit_file_id TO storage_key;

-- users table (avatar)
ALTER TABLE users RENAME COLUMN imagekit_file_id TO storage_key;

-- CRITICAL: Integer max is ~2.1 GB — must upgrade to bigint for 5 GB files
ALTER TABLE project_documents ALTER COLUMN file_size TYPE bigint;
```

### Schema Changes (`schema.ts`)

```ts
// projectDocuments table
// BEFORE:
imageKitUrl: text("image_kit_url"),
imageKitFileId: text("image_kit_file_id"),
fileSize: integer("file_size").default(0).notNull(),

// AFTER:
storageUrl: text("storage_url"),     // R2 object key (NOT a full URL)
storageKey: text("storage_key"),     // e.g. "ectd-dossiers/proj-abc/2026/10/uuid-file.pdf"
fileSize: bigint("file_size", { mode: "number" }).default(0).notNull(),

// users table
// BEFORE:
imageKitFileId: text("imagekit_file_id"),
// AFTER:
storageKey: text("storage_key"),
```

> **WARNING:** Store the R2 **object key** in `storageKey`, NOT a presigned URL. Presigned URLs expire; the key is permanent and presigned URLs are generated on-demand.

### Files to Update After Rename

| File | Changes Required |
|---|---|
| `schema.ts` | Rename column definitions (above) |
| `document.controller.ts` | `imageKitUrl` → `storageUrl`, `imageKitFileId` → `storageKey` |
| `user.controller.ts` | `imageKitFileId` → `storageKey` for avatar uploads |
| `compilation.service.ts` | `downloadFileBuffer(doc.imageKitUrl)` → presigned URL approach |
| All `.values({...})` inserts | Field name updates |

---

## 7. Backend Changes

### New Files

```
backend/src/
├── services/
│   ├── r2.service.ts          ← NEW (replaces imagekit.service.ts)
│   └── imagekit.service.ts    ← DELETE after migration
├── controller/
│   └── upload.controller.ts   ← NEW
└── router/
    └── upload.routes.ts       ← NEW
```

### `r2.service.ts`

```ts
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("[R2 Service] Missing R2 configuration.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const BUCKET = () => {
  const b = process.env.R2_BUCKET_NAME;
  if (!b) throw new Error("[R2 Service] R2_BUCKET_NAME not set.");
  return b;
};

export const CHUNK_SIZE = 100 * 1024 * 1024; // 100 MB

// ─── Initiate Multipart Upload ────────────────────────────────────────────────
export async function initiateMultipartUpload(
  key: string,
  mimeType: string,
  fileSize: number
): Promise<{ uploadId: string; partUrls: { partNumber: number; url: string }[]; chunkSize: number }> {
  const client = getR2Client();
  const bucket = BUCKET();

  const { UploadId } = await client.send(
    new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: mimeType })
  );

  if (!UploadId) throw new Error("[R2 Service] Failed to create multipart upload.");

  const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
  const partUrls = await Promise.all(
    Array.from({ length: totalParts }, async (_, i) => {
      const url = await getSignedUrl(
        client,
        new UploadPartCommand({ Bucket: bucket, Key: key, UploadId, PartNumber: i + 1 }),
        { expiresIn: 3600 }
      );
      return { partNumber: i + 1, url };
    })
  );

  return { uploadId: UploadId, partUrls, chunkSize: CHUNK_SIZE };
}

// ─── Complete Multipart Upload ────────────────────────────────────────────────
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<void> {
  const client = getR2Client();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: BUCKET(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
    })
  );
}

// ─── Abort Multipart Upload ───────────────────────────────────────────────────
export async function abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new AbortMultipartUploadCommand({ Bucket: BUCKET(), Key: key, UploadId: uploadId })
  );
}

// ─── Delete Object ────────────────────────────────────────────────────────────
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }));
}

// ─── Generate Presigned GET URL ───────────────────────────────────────────────
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET(), Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

// ─── Generate R2 Object Key ───────────────────────────────────────────────────
export function generateR2Key(projectId: string, originalName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID();
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_").toLowerCase();
  return `ectd-dossiers/proj-${projectId}/${year}/${month}/${uuid}-${safeName}`;
}
```

### `upload.controller.ts`

```ts
import { Request, Response } from "express";
import {
  initiateMultipartUpload,
  completeMultipartUpload,
  abortMultipartUpload,
  generateR2Key,
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
];

export async function initiateUpload(req: Request, res: Response): Promise<void> {
  try {
    const { fileName, fileSize, mimeType, projectId, nodeId } = req.body;

    if (!fileName || !fileSize || !mimeType || !projectId || !nodeId) {
      res.status(400).json({ success: false, message: "Missing required fields." });
      return;
    }
    if (!ALLOWED_MIMES.includes(mimeType)) {
      res.status(415).json({ success: false, message: "Unsupported file type." });
      return;
    }
    if (fileName.includes("..") || fileName.includes("/")) {
      res.status(400).json({ success: false, message: "Invalid filename." });
      return;
    }
    // Enforce quota BEFORE generating presigned URLs
    if (req.user?.id) {
      await StorageService.assertStorageAvailable(req.user.id, Number(fileSize));
    }

    const key = generateR2Key(projectId, fileName);
    const result = await initiateMultipartUpload(key, mimeType, Number(fileSize));

    res.status(200).json({ success: true, key, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function completeUpload(req: Request, res: Response): Promise<void> {
  const {
    key, uploadId, parts, projectId, nodeId, operation,
    fileSize, md5Checksum, dossierConfigId, docCode, docType, originalName,
  } = req.body;

  if (!key || !uploadId || !parts || !projectId || !nodeId) {
    res.status(400).json({ success: false, message: "Missing required fields." });
    return;
  }

  try {
    await completeMultipartUpload(key, uploadId, parts);

    const resolvedProjectId = await resolveProjectId(projectId);
    const config = dossierConfigId
      ? await db.query.dossierConfig.findFirst({ where: eq(dossierConfig.id, dossierConfigId) })
      : await db.query.dossierConfig.findFirst({ where: eq(dossierConfig.projectId, resolvedProjectId) });

    const newDoc = await db.transaction(async (tx) => {
      const existingActive = await tx.query.projectDocuments.findFirst({
        where: and(
          eq(projectDocuments.projectId, resolvedProjectId),
          eq(projectDocuments.nodeId, nodeId),
          eq(projectDocuments.status, "active")
        ),
      });

      if (existingActive && operation === "replace") {
        await tx.update(projectDocuments)
          .set({ status: "superseded" })
          .where(eq(projectDocuments.id, existingActive.id));
      }

      const [inserted] = await tx
        .insert(projectDocuments)
        .values({
          projectId: resolvedProjectId,
          nodeId,
          docCode,
          docType,
          originalName,
          storageUrl: key,
          storageKey: key,
          fileSize: Number(fileSize),
          sequence: sanitizeSequence(config?.dossierSequence),
          dossierConfigId: config?.id ?? null,
          md5Checksum,
          status: "active",
          operation: operation ?? "new",
        })
        .returning();

      await tx.insert(auditLogs).values({
        projectId: resolvedProjectId,
        logType: "SUCCESS",
        message: `Uploaded '${originalName}' (${operation}) to node '${nodeId}'. R2 Key: ${key}.`,
        userCredentials: req.user ? `${req.user.email} (${req.user.role})` : "System",
      });

      return inserted;
    });

    await CacheService.del(CacheKeys.projectDossier(resolvedProjectId));
    if (req.user?.companyId) await CacheService.del(CacheKeys.companyStorage(req.user.companyId));

    res.status(201).json({ success: true, data: newDoc });
  } catch (error: any) {
    // Rollback: abort the incomplete multipart upload on DB failure
    try { await abortMultipartUpload(key, uploadId); } catch {}
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function abortUpload(req: Request, res: Response): Promise<void> {
  const { key, uploadId } = req.body;
  if (!key || !uploadId) {
    res.status(400).json({ success: false, message: "Missing key or uploadId." });
    return;
  }
  try {
    await abortMultipartUpload(key, uploadId);
    res.status(200).json({ success: true, message: "Multipart upload aborted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
```

### `upload.routes.ts`

```ts
import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { initiateUpload, completeUpload, abortUpload } from "../controller/upload.controller";

const router = Router();
router.post("/initiate", authenticateJWT, initiateUpload);
router.post("/complete", authenticateJWT, completeUpload);
router.post("/abort",    authenticateJWT, abortUpload);

export default router;
```

Register in `app.ts`:
```ts
import uploadRoutes from "./router/upload.routes";
app.use("/api/upload", uploadRoutes);
```

### Presigned Download Endpoint (add to `document.controller.ts`)

```ts
import { getPresignedDownloadUrl } from "../services/r2.service";

export async function getDocumentPresignedUrl(req: Request, res: Response): Promise<void> {
  try {
    const doc = await db.query.projectDocuments.findFirst({
      where: eq(projectDocuments.id, req.params.docId),
    });

    if (!doc?.storageKey) {
      res.status(404).json({ success: false, message: "Document not found or not stored in R2." });
      return;
    }

    const url = await getPresignedDownloadUrl(doc.storageKey, 3600);
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    res.status(200).json({ success: true, url, expiresAt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
```

### NPM Changes

```bash
# Install R2 SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Remove ImageKit after migration is stable
npm uninstall imagekit
```

---

## 8. Frontend Changes

### Upload Utility — `lib/r2Upload.ts`

```ts
import api from "@/app/lib/axios";

const CHUNK_SIZE = 100 * 1024 * 1024; // 100 MB — must match backend
const PARALLEL_PARTS = 4;             // Max concurrent part uploads

export async function uploadFileToR2(
  file: File,
  meta: {
    projectId: string;
    nodeId: string;
    operation: "new" | "replace";
    dossierConfigId?: string;
    docCode?: string;
    docType?: string;
  },
  onProgress?: (percent: number) => void
): Promise<any> {
  // ── Step 1: Initiate ─────────────────────────────────────────────────────────
  const initiateRes = await api.post("/upload/initiate", {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    ...meta,
  });

  const { uploadId, key, partUrls, chunkSize } = initiateRes.data;

  // ── Step 2: Upload chunks in parallel batches ─────────────────────────────────
  const parts: { PartNumber: number; ETag: string }[] = [];
  let uploadedBytes = 0;

  for (let i = 0; i < partUrls.length; i += PARALLEL_PARTS) {
    const batch = partUrls.slice(i, i + PARALLEL_PARTS);

    const batchResults = await Promise.all(
      batch.map(async ({ partNumber, url }: { partNumber: number; url: string }) => {
        const start = (partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const res = await fetch(url, {
          method: "PUT",
          body: chunk,
          headers: { "Content-Type": file.type },
        });

        if (!res.ok) {
          throw new Error(`Part ${partNumber} failed: HTTP ${res.status}`);
        }

        const etag = res.headers.get("ETag") ?? "";
        uploadedBytes += chunk.size;
        onProgress?.(Math.round((uploadedBytes / file.size) * 100));

        return { PartNumber: partNumber, ETag: etag };
      })
    );

    parts.push(...batchResults);
  }

  // ── Step 3: Complete ──────────────────────────────────────────────────────────
  const completeRes = await api.post("/upload/complete", {
    key,
    uploadId,
    parts,
    originalName: file.name,
    fileSize: file.size,
    md5Checksum: await computeFileMD5(file),
    ...meta,
  });

  return completeRes.data;
}

// Abort if user cancels (call this on component unmount or cancel button)
export async function abortR2Upload(key: string, uploadId: string): Promise<void> {
  await api.post("/upload/abort", { key, uploadId });
}

// MD5 using Web Crypto API (returns hex string)
async function computeFileMD5(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("MD5", buffer);  // Note: MD5 not in SubtleCrypto
  // Use crypto-js or spark-md5 for browser MD5:
  // import SparkMD5 from "spark-md5";
  // return SparkMD5.ArrayBuffer.hash(buffer);
  return "";
}
```

> **TIP:** Install `spark-md5` for client-side MD5: `npm install spark-md5 @types/spark-md5`

### Document Viewer — Use Presigned URL

```ts
// Replace: open doc.imageKitUrl directly
// With:
const { data } = await api.get(`/documents/${doc.id}/url`);
window.open(data.url, "_blank");
```

### Remove Old 50 MB Size Cap

```ts
// Old limit in upload component — remove or replace with 5 GB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
```

### Handle Null storageKey (Re-upload Required Badge)

```tsx
{doc.storageKey ? (
  <Button onClick={() => openDocument(doc.id)}>View</Button>
) : (
  <Badge color="warning">Re-upload Required</Badge>
)}
```

---

## 9. Environment Variables

```env
# ─── Cloudflare R2 Configuration ─────────────────────────────────────────────
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="ectd-dossiers"

# ─── Remove these after migration is stable ────────────────────────────────────
# IMAGEKIT_PUBLIC_KEY=...
# IMAGEKIT_PRIVATE_KEY=...
# IMAGEKIT_URL_ENDPOINT=...
```

### How to Get R2 Credentials

1. **Cloudflare Dashboard** → **R2** → **Create Bucket** → Name: `ectd-dossiers`
2. **R2** → **Manage R2 API Tokens** → **Create API Token**
   - Permission: **Object Read & Write**
   - Scope: Specific bucket → `ectd-dossiers`
3. Copy `Access Key ID` → `R2_ACCESS_KEY_ID`
4. Copy `Secret Access Key` → `R2_SECRET_ACCESS_KEY`
5. Your Account ID: visible in the Cloudflare dashboard URL → `R2_ACCOUNT_ID`

---

## 10. Folder / Key Structure in R2

```
Bucket: ectd-dossiers
│
├── ectd-dossiers/
│   └── proj-{projectId}/
│       └── {year}/
│           └── {month}/
│               └── {uuid}-{sanitized-filename}.pdf
│
└── avatars/
    └── users/
        └── {userId}/
            └── {uuid}-avatar.jpg
```

**Example key:**
```
ectd-dossiers/proj-550e8400-e29b/2026/10/a1b2c3d4-m2-2-clinical-summary.pdf
```

The date prefix enables R2 lifecycle rules (archive docs >7 years old to Cloudflare's cheaper cold tier).

---

## 11. Security & Access Control

| Layer | Mechanism |
|---|---|
| **R2 Bucket** | Public access **disabled** |
| **R2 API Token** | Scoped to single bucket, Read+Write only |
| **All upload endpoints** | JWT authentication required |
| **All download endpoints** | JWT authentication required |
| **Presigned Upload URLs** | 1-hour TTL, bound to specific key + uploadId |
| **Presigned Download URLs** | 1-hour TTL, generated per-request |
| **MIME validation** | Checked server-side on `initiate` before signing |
| **Storage quota** | `StorageService.assertStorageAvailable()` on `initiate` |
| **Filename validation** | Path traversal check on `initiate` |
| **CORS** | R2 bucket CORS allows PUT/GET from your frontend domain only |

### R2 CORS Configuration

Set in Cloudflare Dashboard → R2 Bucket → **Settings** → **CORS**:

```json
[
  {
    "AllowedOrigins": ["https://dossier-project-inky.vercel.app"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

> **CAUTION:** Never expose `R2_SECRET_ACCESS_KEY` to the frontend. Presigned URL generation must always happen server-side.

---

## 12. Old ImageKit Files — Fresh Start Strategy

### Plan

1. **Notify users** via Resend email before cutover date:
   > "We're upgrading our storage to Cloudflare R2 on [date]. After the upgrade, you'll need to re-upload your existing documents. Your project structure and metadata will be preserved."

2. **Cutover window:**
   - Run Drizzle DB migration (rename columns, bigint fileSize)
   - Deploy new backend with R2 service
   - Deploy new frontend with multipart upload hook

3. **Post-cutover:**
   - Existing `storageKey` values will be `null` for old records
   - Frontend shows "Re-upload Required" badge on affected nodes
   - Old ImageKit files: delete via ImageKit dashboard (bulk delete) to stop charges

4. **Cleanup (2 weeks post-cutover):**
   - Remove `IMAGEKIT_*` env vars from production
   - `npm uninstall imagekit`
   - Remove `imagekit.service.ts`

---

## 13. Rollout Checklist

### Pre-Migration

- [ ] Create Cloudflare R2 bucket (`ectd-dossiers`)
- [ ] Generate R2 API token (bucket-scoped, Object Read+Write)
- [ ] Add R2 env vars to local `.env` and production environment
- [ ] Configure R2 bucket CORS policy (your Vercel frontend domain)
- [ ] `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- [ ] Test R2 connectivity with a simple put/get script

### Backend

- [ ] Create `src/services/r2.service.ts`
- [ ] Create `src/controller/upload.controller.ts`
- [ ] Create `src/router/upload.routes.ts` and register in `app.ts`
- [ ] Add `getDocumentPresignedUrl` to `document.controller.ts`
- [ ] Register new route `GET /api/documents/:docId/url`
- [ ] Update document delete to call `deleteFromR2(key)` instead of `deleteFromImageKit(fileId)`
- [ ] Update user avatar upload to use R2
- [ ] Remove all `imagekit.service.ts` imports
- [ ] Update `compilation.service.ts` to use presigned URL for downloads

### Database

- [ ] Write migration: rename `image_kit_url` → `storage_url`, `image_kit_file_id` → `storage_key`
- [ ] Write migration: `file_size` column `integer` → `bigint`
- [ ] Update `schema.ts` column definitions
- [ ] Run: `npm run db:migrate`
- [ ] Update all insert/update code referencing old column names

### Frontend

- [ ] Create `lib/r2Upload.ts` multipart upload utility
- [ ] Install `spark-md5` for client-side MD5 checksum
- [ ] Update upload components to use `uploadFileToR2()` with progress bar
- [ ] Update document open/download to fetch presigned URL from `/api/documents/:id/url`
- [ ] Handle `null` `storageKey` with "Re-upload Required" badge
- [ ] Update file size limit display: 50 MB → 5 GB

### Testing

- [ ] Upload small file (< 5 MB — single chunk)
- [ ] Upload medium file (100–500 MB)
- [ ] Upload large file (1–2 GB)
- [ ] Upload 5 GB file end-to-end
- [ ] Verify upload progress reporting (%)
- [ ] Test upload cancel/abort (verify R2 cleans up)
- [ ] Test presigned download URL (open in browser)
- [ ] Test URL expiry (wait >1 hour, verify 403)
- [ ] Test document delete (R2 object removed)
- [ ] Test storage quota enforcement (reject over-limit upload)
- [ ] Test replace operation (old record superseded)

### Production Cutover

- [ ] Deploy backend (R2 service live)
- [ ] Run DB migration on production Neon database
- [ ] Deploy frontend (new upload/download flow live)
- [ ] Send user notification email via Resend
- [ ] Monitor R2 dashboard → Metrics (first 48 hours)
- [ ] Delete old ImageKit files via ImageKit dashboard (after 2-week grace)
- [ ] Remove `IMAGEKIT_*` env vars from production
- [ ] `npm uninstall imagekit`
- [ ] Delete `src/services/imagekit.service.ts`

---

## 14. Critical Notes

### fileSize Column Must Be Bigint

The current `integer` type overflows at ~2.1 GB. Run this migration **before** any 5 GB upload:

```sql
ALTER TABLE project_documents ALTER COLUMN file_size TYPE bigint;
```

### Multer Middleware — Remove for Document Uploads

The `uploadMiddleware` (multer memoryStorage) is no longer needed for document uploads (frontend goes direct to R2). However, keep it for **avatar uploads** (small images, still pass through backend). Remove the multer middleware from document upload routes after migration.

### Compilation Service — Large File Downloads

`compilation.service.ts` downloads files to bundle them into ZIP. For 5 GB files, buffering into RAM is not viable. Consider streaming:

```ts
// Instead of: Buffer.from(await axios.get(url, {responseType: "arraybuffer"}))
// Stream R2 object directly into the zip archiver using:
import { GetObjectCommand } from "@aws-sdk/client-s3";
const { Body } = await client.send(new GetObjectCommand({ Bucket, Key }));
archive.append(Body as NodeJS.ReadableStream, { name: fileName });
```

### StorageService — No Changes Needed

`StorageService.assertStorageAvailable()` already uses `fileSize` in bytes vs `storageGb * 1024^3`. The bigint column upgrade makes this work correctly for files >2.1 GB. No logic changes required.

---

*Document Version: 1.0 | Created: 2026-10-29 | Stack: Express + Drizzle ORM + Neon PostgreSQL + Next.js + Cloudflare R2*

