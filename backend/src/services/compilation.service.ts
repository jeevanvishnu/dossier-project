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

/**
 * Maps a document's eCTD nodeId (e.g., '1.3.1-02001') to Windows-style eCTD directory path (e.g. 'm1\1.3\1.3.1\').
 * Strips regional folders like '/us/' or '/kz/' and builds nested section paths using backslashes.
 */
export function getEctdFolderPath(nodeId: string, _countryStr?: string | null): string {
  if (!nodeId) return "m1\\";

  // Clean off 5-digit docId suffix if present (e.g., '1.3.1-02001' -> '1.3.1')
  const cleanCode = nodeId.replace(/-\d{5}$/, "").trim();

  // Section 1.0 (Cover letter) files reside directly in m1\ root directory
  if (cleanCode === "1.0") return "m1\\";

  // Direct sub-module 1.2 files (e.g. 1.2.2, 1.2.5) reside in m1\1.2\ directory
  if (["1.2", "1.2.1", "1.2.2", "1.2.3", "1.2.5"].includes(cleanCode)) return "m1\\1.2\\";

  const parts = cleanCode.split(".").filter(Boolean);

  if (parts.length === 0) return "m1\\";

  const mainModuleNum = parts[0];
  const modulePrefix = `m${mainModuleNum}`;
  const pathParts: string[] = [modulePrefix];

  let currentSection = mainModuleNum;
  for (let i = 1; i < parts.length; i++) {
    currentSection += `.${parts[i]}`;
    pathParts.push(currentSection);
  }

  return pathParts.join("\\") + "\\";
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

  // 1. Generate EAEU R.022 XML Backbone in memory
  const xmlContent = generateEaeuManifestXml(project, config, documents, {
    sanitizeFileNameFn: sanitizeFileName,
    sanitizeSequenceFn: sanitizeSequence,
    getEctdFolderPathFn: getEctdFolderPath,
  });
  const xmlChecksum = calculateMD5(xmlContent);

  // 2. Concurrently download physical document buffers (filtering out 'delete' tombstones)
  const docsToDownload = documents.filter(
    (d) => d.status !== "deleted" && d.operation !== "delete" && !!d.imageKitUrl
  );

  const downloadedDocs = await mapConcurrent(docsToDownload, 5, async (doc) => {
    try {
      const buffer = await downloadFileBuffer(doc.imageKitUrl!);
      return { doc, buffer };
    } catch (err: any) {
      throw new Error(`Failed to download document "${doc.originalName}" (${doc.nodeId}): ${err.message}`);
    }
  });

  // 3. Construct ZIP Archive entirely in memory
  const archive = createZipArchive({ zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  const bufferStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      callback();
    },
  });

  archive.pipe(bufferStream);

  // Append index.xml (EAEU R.022 XML Manifest)
  archive.append(Buffer.from(xmlContent, "utf-8"), { name: "index.xml" });

  // Append physical documents into their respective eCTD folders
  for (const { doc, buffer } of downloadedDocs) {
    const eaeuDocCode = mapNodeIdToEaeuCode(doc.nodeId);
    const effectiveDocName = getRussianDocName(doc.originalName, eaeuDocCode, doc.nodeId);
    const folderPath = getEctdFolderPath(doc.nodeId, country);
    const sanitizedName = sanitizeFileName(effectiveDocName);
    archive.append(buffer, { name: `${folderPath}${sanitizedName}` });
  }

  await archive.finalize();

  // Wait for stream write completion
  const zipBuffer = Buffer.concat(chunks);
  const zipChecksum = calculateMD5(zipBuffer);
  const sequenceStr = sanitizeSequence(config?.dossierSequence);
  const fullName = `${project.projectCode}_${sequenceStr}_${Date.now()}.zip`;

  return {
    zipBuffer,
    xmlChecksum,
    zipChecksum,
    fullName,
    size: zipBuffer.length,
  };
}


