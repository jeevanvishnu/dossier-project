import { create } from "xmlbuilder2";
import crypto from "crypto";
import { Project, DossierConfig, ProjectDocument } from "../db/schema";
import { findCtdDocCodeEntry, getCanonicalDocLabelByCode, getCtdDocCodeEntry } from "../constants/ctdDocCodes";

/**
 * Maps internal CTD node IDs (e.g. '1.0', '1.2.1') or explicit docCodes to 5-digit EAEU document codes (codeListId="2058").
 * Throws a clear error if the mapping is unresolvable or missing required selection.
 */
export function mapNodeIdToEaeuCode(nodeId: string, docCode?: string): string {
  if (docCode) {
    const entry = getCtdDocCodeEntry(docCode);
    if (entry) return entry.docCode;
  }

  const entry = findCtdDocCodeEntry(nodeId, docCode);
  if (entry) {
    return entry.docCode;
  }

  // Graceful fallback: log a warning but do NOT throw.
  // Throwing here would crash the entire XML compilation because of a single unresolvable node.
  // '00000' is used as a safe placeholder so the manifest is still generated.
  console.warn(
    `[EAEU Manifest] Unresolvable doc code for node '${nodeId}'${docCode ? ` (docCode: '${docCode}')` : ""}. Using fallback '00000'. Add a matching entry to CTD_DOC_CODES to resolve this.`
  );
  return "00000";
}

/**
 * Normalizes country strings to 2-letter ISO/EAEU country codes (P.CLS.019).
 */
export function normalizeCountryCode(countryStr?: string | null): string {
  if (!countryStr) return "KZ";
  const cleaned = countryStr.trim().toUpperCase();
  if (cleaned.includes("RUSSIA") || cleaned.includes("РОССИЯ") || cleaned === "RU" || cleaned === "РФ" || cleaned === "RUS") return "RU";
  if (cleaned.includes("KAZAKHSTAN") || cleaned.includes("КАЗАХСТАН") || cleaned === "KZ" || cleaned === "РК" || cleaned === "KAZ") return "KZ";
  if (cleaned.includes("BELARUS") || cleaned.includes("БЕЛАРУСЬ") || cleaned === "BY" || cleaned === "РБ" || cleaned === "BLR") return "BY";
  if (cleaned.includes("ARMENIA") || cleaned.includes("АРМЕНИЯ") || cleaned === "AM" || cleaned === "ARM") return "AM";
  if (cleaned.includes("KYRGYZSTAN") || cleaned.includes("КЫРГЫЗСТАН") || cleaned.includes("КИРГИЗИЯ") || cleaned === "KG" || cleaned === "KGZ") return "KG";
  const validEaeuCodes = ["KZ", "RU", "BY", "AM", "KG"];
  const twoChar = cleaned.slice(0, 2);
  return validEaeuCodes.includes(twoChar) ? twoChar : "KZ";
}

/**
 * Maps database document status to EAEU operation attribute.
 */
export function mapOperationAttribute(status?: string | null): "new" | "replace" | "delete" {
  if (status === "superseded") return "replace";
  if (status === "deleted") return "delete";
  return "new";
}

/**
 * Returns true if the string contains at least one Cyrillic character (U+0400–U+04FF).
 * Used to decide the separator: Cyrillic labels get '. ' (period + space),
 * Latin/English labels get ' ' (space only), matching the sorbit_.xml reference filenames.
 */
function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Ensures document names in XML manifest conform to Russian EAEU regulatory standards.
 *
 * Rules applied in order:
 * 1. If the user already uploaded it with the correct node prefix (e.g. "1.0. Custom Name.pdf"),
 *    return it unchanged — bypass all further logic.
 * 2. If the user's filename stem exactly matches the canonical label for this docCode (meaning
 *    the user uploaded the file under its own meaningful name without a node prefix, as seen in
 *    the sorbit_.xml reference for 13028), return the original filename unchanged — no prefix added.
 * 3. Otherwise, construct "<nodeId><separator><canonicalLabel><ext>" where separator is:
 *    - ". "  (period + space) if the canonical label contains Cyrillic (e.g. 01001, 06001)
 *    - " "   (space only)    if the canonical label is Latin/English (e.g. 01013, 01015)
 */
export function getRussianDocName(originalName: string, eaeuCode?: string, nodeId?: string): string {
  if (!originalName) return "Документ.pdf";

  const cleanNode = (nodeId || "").replace(/-\d{5}$/, "").trim();

  // Bypass 1: user already included the node prefix — preserve verbatim
  if (cleanNode && originalName.startsWith(cleanNode)) {
    return originalName;
  }

  const extMatch = originalName.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : ".pdf";
  const originalStem = extMatch ? originalName.slice(0, -extMatch[0].length) : originalName;

  const code = eaeuCode || "";
  const canonicalLabel = code ? getCanonicalDocLabelByCode(code) : undefined;
  const russianTitle = canonicalLabel || "Документ регистрационного досье";

  // Bypass 2: user's filename stem matches the canonical label exactly — the filer intentionally
  // preserved the original filename without a node prefix (confirmed in sorbit_.xml for 13028).
  // Do NOT force-prepend a node-number prefix in this case.
  if (canonicalLabel && originalStem === canonicalLabel) {
    return originalName;
  }

  // Separator rule: inspect actual text of the canonical label for Cyrillic characters.
  // Cyrillic labels → ". " (period + space), as in "1.0. Сопроводительное письмо Сорбит.pdf"
  // Latin labels    → " "  (space only),      as in "1.8.1 Addetional trade name.pdf"
  const separator = cleanNode && hasCyrillic(russianTitle) ? ". " : " ";

  return cleanNode ? `${cleanNode}${separator}${russianTitle}${ext}` : `${russianTitle}${ext}`;
}

export interface EaeuManifestOptions {
  sanitizeFileNameFn: (fileName: string) => string;
  sanitizeSequenceFn: (rawSeq?: string | null) => string;
  getEctdFolderPathFn: (nodeId: string, countryStr?: string | null, docCode?: string) => string;
}

/**
 * Generates an EAEU R.022 DrugRegistrationDocDossierContentDetails XML document matching
 * urn:EEC:R:DrugRegistrationDocDossierContentDetails:v1.1.0 schema using xmlbuilder2.
 */
export function generateEaeuManifestXml(
  project: Project,
  config: DossierConfig | null,
  documents: ProjectDocument[],
  helpers: EaeuManifestOptions
): string {
  const sequenceStr = helpers.sanitizeSequenceFn(config?.dossierSequence);
  const countryCode = normalizeCountryCode(config?.submissionCountry);
  // Format datetime as 'yyyy-MM-ddTHH:mm:ss' (no milliseconds, no Z) as required by EAEU schema
  const nowIso = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace("Z", "");

  // Root element with strict schema namespaces
  const root = create({ version: "1.0", encoding: "UTF-8" })
    .ele("doc:DrugRegistrationDocDossierContentDetails", {
      "xmlns:doc": "urn:EEC:R:DrugRegistrationDocDossierContentDetails:v1.1.0",
      "xmlns:bdt": "urn:EEC:M:BaseDataTypes:v0.4.11",
      "xmlns:ccdo": "urn:EEC:M:ComplexDataObjects:v0.4.11",
      "xmlns:csdo": "urn:EEC:M:SimpleDataObjects:v0.4.11",
      "xmlns:hcsdo": "urn:EEC:M:HC:SimpleDataObjects:v1.0.17",
      "xmlns:hccdo": "urn:EEC:M:HC:ComplexDataObjects:v1.0.17",
      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "xsi:schemaLocation": "urn:EEC:R:DrugRegistrationDocDossierContentDetails:v1.1.0 EEC_R_DrugRegistrationDocDossierContentDetails_v1.1.0.xsd",
    });

  // Global Metadata
  root.ele("csdo:EDocCode").txt("R.022").up();
  root.ele("csdo:EDocId").txt(crypto.randomUUID()).up();
  root.ele("csdo:EDocDateTime").txt(nowIso).up();
  root.ele("csdo:UnifiedCountryCode", { codeListId: "P.CLS.019" }).txt(countryCode).up();
  root.ele("hcsdo:RegistrationKindCode").txt("01").up();

  // Document Iteration
  for (const doc of documents) {
    const docId = crypto.randomUUID();
    const eaeuDocCode = mapNodeIdToEaeuCode(doc.nodeId, doc.docCode || undefined);
    const effectiveDocName = getRussianDocName(doc.originalName, eaeuDocCode, doc.nodeId);
    const sanitizedName = helpers.sanitizeFileNameFn(effectiveDocName);
    const rawFolderPath = helpers.getEctdFolderPathFn(doc.nodeId, countryCode, doc.docCode || eaeuDocCode);
    const cleanFolderPath = rawFolderPath.replace(/[\/\\]+$/, "");
    const relativeZipPath = `${cleanFolderPath}\\${sanitizedName}`.replace(/\\\\+/g, "\\");
    const creationDate = doc.uploadedAt
      ? new Date(doc.uploadedAt).toISOString().split("T")[0]
      : nowIso.split("T")[0];
    const operation = doc.operation || mapOperationAttribute(doc.status);
    const checksum = doc.md5Checksum || "00000000000000000000000000000000";

    const docDetails = root.ele("hccdo:RegistrationDossierDocDetails");
    docDetails.ele("hcsdo:RegistrationFileIndicator").txt("1").up();
    docDetails.ele("csdo:DocId").txt(docId).up();
    docDetails.ele("csdo:DocName").txt(effectiveDocName).up();
    docDetails.ele("hcsdo:DrugRegistrationDocCode", { codeListId: "2058" }).txt(eaeuDocCode).up();
    docDetails.ele("csdo:DocCreationDate").txt(creationDate).up();
    docDetails.ele("hcsdo:DrugAttributeEnumText", { DrugAttributeKindEnumCode: "05" }).txt(relativeZipPath).up();
    docDetails.ele("hcsdo:DrugAttributeEnumText", { AttributeKindName: "CHECKSUMM" }).txt(checksum).up();
    docDetails.ele("hcsdo:DrugAttributeEnumText", { AttributeKindName: "CHECK_ALG" }).txt("MD5").up();
    docDetails.ele("hcsdo:SubmissionSequence").txt(sequenceStr).up();
    docDetails.ele("hcsdo:OperationAtribute").txt(operation).up();
  }

  return "\uFEFF" + root.end({ prettyPrint: true });
}

