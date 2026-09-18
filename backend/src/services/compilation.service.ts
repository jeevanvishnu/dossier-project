import { ZipArchive } from "archiver";
import * as archiverModule from "archiver";
import { Writable } from "stream";
import { downloadFileBuffer } from "./imagekit.service";
import { calculateMD5 } from "../utils/crypto.util";
import { ProjectDocument, Project, DossierConfig } from "../db/schema";
import { generateEaeuManifestXml, getRussianDocName, mapNodeIdToEaeuCode } from "./eaeu-manifest.service";

/**
 * Concurrency helper to download files without pulling in ESM-only limiters
 */
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Helper to escape special XML characters.
 */
function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Sanitizes file names for file system and XML output while preserving Cyrillic and original characters.
 * Removes invalid path characters like < > : " / \ | ? *.
 * E.g., "Сорбит ОХЛП ЕАЭС_18.04.2025.pdf" -> "Сорбит ОХЛП ЕАЭС_18.04.2025.pdf"
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return "";
  return fileName.trim().replace(/[<>:"/\\|?*]+/g, "");
}

/**
 * Sanitizes sequence input into a strict 4-digit integer string (e.g., "0000").
 * Strips out text like "Sequence 0000" or raw numbers like "1" -> "0001".
 */
export function sanitizeSequence(rawSeq?: string | null): string {
  if (!rawSeq) return "0000";
  const digits = rawSeq.replace(/\D/g, "");
  if (!digits) return "0000";
  return digits.slice(-4).padStart(4, "0");
}

import { findCtdDocCodeEntry } from "../constants/ctdDocCodes";

/**
 * Maps a document's eCTD nodeId (or docCode) to verbatim Windows-style eCTD directory path (e.g. 'm1\1.3\1.3.1').
 * Returns exact folderPath WITHOUT a trailing backslash.
 */
export function getEctdFolderPath(nodeId: string, _countryStr?: string | null, docCode?: string): string {
  const entry = findCtdDocCodeEntry(nodeId, docCode);
  if (entry) {
    return entry.folderPath.replace(/[\/\\]+$/, "");
  }

  if (!nodeId) return "m1";

  const cleanCode = nodeId.replace(/-\d{5}$/, "").trim();
  const parts = cleanCode.split(".").filter(Boolean);
  if (parts.length > 0) {
    return `m${parts[0]}`;
  }

  return "m1";
}

export interface CompilationResult {
  zipBuffer: Buffer;
  xmlChecksum: string;
  zipChecksum: string;
  fullName: string;
  size: number;
}

function createZipArchive(options?: any) {
  if (typeof ZipArchive === "function") {
    return new ZipArchive(options);
  }
  const mod = archiverModule as any;
  if (mod && typeof mod.ZipArchive === "function") {
    return new mod.ZipArchive(options);
  }
  if (typeof mod === "function") {
    return mod("zip", options);
  }
  if (mod && mod.default && typeof mod.default === "function") {
    return mod.default("zip", options);
  }
  throw new Error("Unable to instantiate archiver ZipArchive instance.");
}

/**
 * Compiles active project documents and generated EAEU R.022 index.xml into an in-memory ZIP archive.
 */
export async function compileEctdPackage(
  project: Project,
  config: DossierConfig | null,
  documents: ProjectDocument[]
): Promise<CompilationResult> {
  const country = (config?.submissionCountry || "KZ").toUpperCase();
  const sequenceStr = sanitizeSequence(config?.dossierSequence);

  // Filter valid documents (sequence 0000 only includes active documents)
  const validDocs = sequenceStr === "0000"
    ? documents.filter((d) => d.status === "active")
    : documents.filter((d) => d.status === "active" || (d.status === "deleted" && d.sequence !== "0000"));

  // 1. Concurrently download physical document buffers (filtering out 'delete' tombstones)
  const docsToDownload = validDocs.filter(
    (d) => d.status !== "deleted" && d.operation !== "delete" && !!d.imageKitUrl
  );

  const downloadedDocs = await mapConcurrent(docsToDownload, 5, async (doc) => {
    try {
      const buffer = await downloadFileBuffer(doc.imageKitUrl!);
      const realMd5 = calculateMD5(buffer);
      return { doc: { ...doc, md5Checksum: realMd5 }, buffer };
    } catch (err: any) {
      throw new Error(`Failed to download document "${doc.originalName}" (${doc.nodeId}): ${err.message}`);
    }
  });

  // Map updated documents with their real computed MD5 checksums
  const updatedDocuments = validDocs.map((d) => {
    const downloaded = downloadedDocs.find((item) => item.doc.id === d.id);
    return downloaded ? downloaded.doc : d;
  });

  // 2. Generate EAEU R.022 XML Backbone in memory with verified file checksums
  const xmlContent = generateEaeuManifestXml(project, config, updatedDocuments, {
    sanitizeFileNameFn: sanitizeFileName,
    sanitizeSequenceFn: sanitizeSequence,
    getEctdFolderPathFn: (nodeId, countryStr, docCode) => getEctdFolderPath(nodeId, countryStr, docCode),
  });
  const xmlChecksum = calculateMD5(xmlContent);

  // 3. Construct ZIP Archive entirely in memory
  const archive = createZipArchive({ zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  const bufferStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      callback();
    },
  });

  const streamFinished = new Promise<void>((resolve, reject) => {
    bufferStream.on("finish", resolve);
    bufferStream.on("error", reject);
  });

  // Pipe zip archive stream into buffer stream
  archive.pipe(bufferStream);

  const cleanProduct = (project.productName || project.projectCode)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\u0400-\u04FF-]/gi, "");
  const projectXmlFileName = `${cleanProduct || "dossier"}_${sequenceStr}.xml`;

  // Append single project-named XML manifest into the root of the archive (e.g. sorbit_0000.xml)
  archive.append(Buffer.from(xmlContent, "utf-8"), { name: projectXmlFileName });

  // Append physical documents into their respective eCTD folders
  for (const { doc, buffer } of downloadedDocs) {
    const eaeuDocCode = mapNodeIdToEaeuCode(doc.nodeId, doc.docCode || undefined);
    const effectiveDocName = getRussianDocName(doc.originalName, eaeuDocCode, doc.nodeId);
    const folderPath = getEctdFolderPath(doc.nodeId, country, doc.docCode || undefined);
    const sanitizedName = sanitizeFileName(effectiveDocName);
    const fullZipEntryName = `${folderPath.replace(/[\/\\]+$/, "")}\\${sanitizedName}`.replace(/\\\\+/g, "\\");
    archive.append(buffer, { name: fullZipEntryName });
  }

  await archive.finalize();
  await streamFinished;

  // Wait for stream write completion
  const zipBuffer = Buffer.concat(chunks);
  const zipChecksum = calculateMD5(zipBuffer);
  const fullName = `${project.projectCode}_${sequenceStr}_${Date.now()}.zip`;

  return {
    zipBuffer,
    xmlChecksum,
    zipChecksum,
    fullName,
    size: zipBuffer.length,
  };
}


