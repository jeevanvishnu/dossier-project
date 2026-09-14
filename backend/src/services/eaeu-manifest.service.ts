import { create } from "xmlbuilder2";
import crypto from "crypto";
import { Project, DossierConfig, ProjectDocument } from "../db/schema";

/**
 * Maps internal CTD node IDs (e.g. '1.0', '1.2.1-01002') to 5-digit EAEU document codes (codeListId="2058").
 */
export function mapNodeIdToEaeuCode(nodeId: string): string {
  if (!nodeId) return "01001";

  // Check if nodeId already contains a 5-digit docId suffix (e.g., '1.2.1-01002' -> '01002')
  const dashMatch = nodeId.match(/-(\d{5})$/);
  if (dashMatch) {
    return dashMatch[1];
  }

  // Exact map for standard node codes without explicit suffix
  const codeMap: Record<string, string> = {
    "1.0": "01001",
    "1.1": "25001",
    "1.2": "01002",
    "1.2.1": "01002",
    "1.2.2": "01005",
    "1.2.3": "01006",
    "1.2.4": "01009",
    "1.2.5": "01016",
    "1.2.6": "01011",
    "1.3": "02001",
    "1.3.1": "02001",
    "1.3.2": "02003",
    "1.3.3": "02009",
    "1.3.4": "02010",
    "1.4": "01013",
    "1.4.1": "01013",
    "1.5": "03001",
    "1.5.1": "03001",
    "1.5.2": "03004",
    "1.5.3": "03005",
    "1.5.4": "03006",
    "1.5.5": "03007",
    "1.5.6": "03008",
    "1.5.7": "13028",
    "1.6": "04001",
    "1.6.1": "04001",
    "1.6.2": "04003",
    "1.6.3": "04005",
    "1.6.6": "04010",
    "1.6.7": "04011",
    "1.6.8": "04012",
    "1.6.9": "04014",
    "1.6.11": "04016",
    "1.7": "05001",
    "1.7.1": "05001",
    "1.7.2": "05002",
    "1.7.3": "05003",
    "1.8": "01015",
    "1.8.1": "01015",
    "1.8.2": "04017",
    "1.8.3": "04025",
    "1.9": "06001",
    "1.9.1": "06001",
    "1.10": "07001",
    "1.10.1": "07001",
    "1.10.2": "07003",
    "1.10.3": "07004",
    "1.10.4": "07005",
    "1.11": "08001",
    "2.1": "25002",
    "2.2": "09001",
    "2.3": "09002",
    "2.4": "10001",
    "2.5": "11001",
    "2.6": "10008",
    "2.7": "11002",
    "3.1": "25003",
    "3.2": "12001",
    "3.3": "25004",
    "4.1": "25005",
    "4.2": "14001",
    "5.1": "25006",
    "5.2": "17001",
  };

  if (codeMap[nodeId]) {
    return codeMap[nodeId];
  }

  // Fallback: extract any 5 consecutive digits if available
  const match = nodeId.match(/\d{5}/);
  return match ? match[0] : "01001";
}

/**
 * Normalizes country strings to 2-letter ISO/EAEU country codes (P.CLS.019).
 */
export function normalizeCountryCode(countryStr?: string | null): string {
  if (!countryStr) return "KZ";
  const cleaned = countryStr.trim().toUpperCase();
  if (cleaned.includes("KAZAKHSTAN") || cleaned === "KZ") return "KZ";
  if (cleaned.includes("RUSSIA") || cleaned === "RU") return "RU";
  if (cleaned.includes("BELARUS") || cleaned === "BY") return "BY";
  if (cleaned.includes("ARMENIA") || cleaned === "AM") return "AM";
  if (cleaned.includes("KYRGYZSTAN") || cleaned === "KG") return "KG";
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

export const EAEU_RUSSIAN_DOC_NAMES: Record<string, string> = {
  "01001": "Сопроводительное письмо",
  "25001": "Содержание регистрационного досье",
  "01002": "Заявление о регистрации лекарственного препарата",
  "01005": "Документ, подтверждающий уплату пошлины",
  "01006": "Копия лицензии на производство",
  "01009": "Отчет о результатах инспектирования производства",
  "01016": "Заключительное письмо",
  "01011": "Рекомендательное письмо",
  "02001": "Общая характеристика лекарственного препарата (ОХЛП)",
  "02002": "Листок-вкладыш (ЛВ)",
  "02003": "Макет первичной упаковки",
  "02004": "Макет вторичной (потребительской) упаковки",
  "02005": "Текст маркировки первичной и вторичной упаковки",
  "02009": "Паспорт качества / Сертификат анализа",
  "02010": "Нормативный документ по качеству (НД)",
  "02011": "Инструкция по медицинскому применению",
  "01013": "Копия документа о государственной регистрации",
  "03001": "Резюме документации общего характера",
  "04001": "Документация по качеству",
  "05001": "Отчеты о доклинических исследованиях",
  "06001": "Отчеты о клинических исследованиях",
};

/**
 * EAEU government portals (Kazakhstan NDDA, Russia Roszdravnadzor, etc.) strictly prohibit English document names.
 * This function ensures all document names in the XML manifest and ZIP archive conform to Russian EAEU regulatory standards.
 * If the filename is in Russian (Cyrillic), it is preserved.
 * If the filename is in English, it is automatically mapped to the official EAEU Russian regulatory title.
 */
export function getRussianDocName(originalName: string, eaeuCode?: string, nodeId?: string): string {
  if (!originalName) return "Документ.pdf";

  // If already contains Cyrillic characters, preserve exact user filename!
  if (/[\u0400-\u04FF]/.test(originalName)) {
    return originalName;
  }

  const extMatch = originalName.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : ".pdf";

  const code = eaeuCode || "";
  const node = nodeId || "";

  const russianTitle =
    EAEU_RUSSIAN_DOC_NAMES[code] ||
    EAEU_RUSSIAN_DOC_NAMES[node] ||
    "Документ регистрационного досье";

  const cleanCode = node.replace(/-\d{5}$/, "").trim();
  return cleanCode ? `${cleanCode}. ${russianTitle}${ext}` : `${russianTitle}${ext}`;
}

export interface EaeuManifestOptions {
  sanitizeFileNameFn: (fileName: string) => string;
  sanitizeSequenceFn: (rawSeq?: string | null) => string;
  getEctdFolderPathFn: (nodeId: string, countryStr?: string | null) => string;
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
    const eaeuDocCode = mapNodeIdToEaeuCode(doc.nodeId);
    const effectiveDocName = getRussianDocName(doc.originalName, eaeuDocCode, doc.nodeId);
    const sanitizedName = helpers.sanitizeFileNameFn(effectiveDocName);
    const folderPath = helpers.getEctdFolderPathFn(doc.nodeId, countryCode);
    const relativeZipPath = `${folderPath}${sanitizedName}`;
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
