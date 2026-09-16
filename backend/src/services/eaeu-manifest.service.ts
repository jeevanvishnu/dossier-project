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

  throw new Error(
    `Unresolvable EAEU document code: node '${nodeId}' ${docCode ? `with docCode '${docCode}'` : ""} requires a valid docCode selection from codelist-2058 lookup table.`
  );
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
 * Ensures document names in XML manifest conform to Russian EAEU regulatory standards.
 * Preserves Cyrillic filenames. For non-Cyrillic filenames, derives title directly from canonical label in ctdDocCodes.ts.
 */
export function getRussianDocName(originalName: string, eaeuCode?: string, nodeId?: string): string {
  if (!originalName) return "Документ.pdf";

  if (/[\u0400-\u04FF]/.test(originalName)) {
    return originalName;
  }

  const extMatch = originalName.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : ".pdf";

  const code = eaeuCode || "";
  const node = nodeId || "";

  const canonicalLabel = code ? getCanonicalDocLabelByCode(code) : undefined;
  const russianTitle = canonicalLabel || "Документ регистрационного досье";

  const cleanNode = node.replace(/-\d{5}$/, "").trim();
  return cleanNode ? `${cleanNode}. ${russianTitle}${ext}` : `${russianTitle}${ext}`;
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
    const eaeuDocCode = mapNodeIdToEaeuCode(doc.nodeId, doc.docCode);
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

  return root.end({ prettyPrint: true });
}

