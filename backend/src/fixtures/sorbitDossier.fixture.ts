import { ProjectDocument } from "../db/schema";

export interface SorbitDossierMapItem {
  nodeId: string;
  docId: string;
  originalName: string;
  status: "active" | "superseded" | "deleted";
  operation: string;
}

export const activeDocuments: SorbitDossierMapItem[] = [
  { nodeId: "1.0-01001", docId: "01001", originalName: "1.0. Сопроводительное письмо Сорбит.pdf", status: "active", operation: "new" },
  { nodeId: "1.2.2-01005", docId: "01005", originalName: "ПП- Сорбит- ЕАЭС-bcc_business_06_11_2025 16_15_30-10.pdf", status: "active", operation: "new" },
  { nodeId: "1.2.4-01009", docId: "01009", originalName: "1.2.4 Report.pdf", status: "active", operation: "new" },
  { nodeId: "1.2.5-01016", docId: "01016", originalName: "1.2.5 Conclusion letter.pdf", status: "active", operation: "new" },
  { nodeId: "1.2.6-01011", docId: "01011", originalName: "1.2.6 Recomendation letter.pdf", status: "active", operation: "new" },
  { nodeId: "1.3.1-02001", docId: "02001", originalName: "Сорбит ОХЛП ЕАЭС_18.04.2025.pdf", status: "active", operation: "new" },
  { nodeId: "1.3.1-02002", docId: "02002", originalName: "Сорбит  ЛВ ЕАЭС_18.04.2025.pdf", status: "active", operation: "new" },
  { nodeId: "1.3.2-02004", docId: "02004", originalName: "1.3.2 Box.pdf", status: "active", operation: "new" },
  { nodeId: "1.3.2-02005", docId: "02005", originalName: "1.3.2 Label.pdf", status: "active", operation: "new" },
  { nodeId: "1.3.4-02010", docId: "02010", originalName: "1.3.4 Sorbit SPC.pdf", status: "active", operation: "new" },
  { nodeId: "1.3.4-02011", docId: "02011", originalName: "1.3.4 Sorbit English PIL.pdf", status: "active", operation: "new" }
];

export const SORBIT_DOSSIER_MAP = activeDocuments;

export const SORBIT_DOSSIER_FIXTURE: ProjectDocument[] = activeDocuments.map((item, index) => ({
  id: index + 1,
  projectId: 1,
  nodeId: item.nodeId,
  originalName: item.originalName,
  sequence: "0000",
  uploadedAt: new Date("2025-04-18T10:00:00Z"),
  status: item.status,
  operation: item.operation,
  issueDate: null,
  expirationDate: null,
  imageKitUrl: `https://ik.imagekit.io/ectd/test/${encodeURIComponent(item.originalName)}`,
  imageKitFileId: `file_${index + 1}`,
  fileSize: 1024567,
  md5Checksum: "e10adc3949ba59abbe56e057f20f883e",
}));
