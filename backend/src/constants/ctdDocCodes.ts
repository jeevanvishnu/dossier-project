export interface CtdDocCodeEntry {
  docCode: string;
  nodeId: string;
  docTypeLabel: string;
  folderPath: string;
  source: 'sample-dossier' | 'inferred';
  notes?: string;
}

export const CTD_DOC_CODES: CtdDocCodeEntry[] = [
  { docCode: "01001", nodeId: "1.0", docTypeLabel: "Сопроводительное письмо Сорбит", folderPath: "m1", source: "sample-dossier" },
  { docCode: "01002", nodeId: "1.2.1", docTypeLabel: "Подписанное заявление", folderPath: "m1\\1.2\\1.2.1", source: "sample-dossier" },
  { docCode: "01003", nodeId: "1.2.1", docTypeLabel: "Заявление о приведении в соответствие с требованиями ЕАЭС", folderPath: "m1\\1.2\\1.2.1", source: "inferred", notes: "Inferred folderPath matched to confirmed sibling 01002 (same section 1.2.1) in sorbit_.xml — includes subfolder, per verbatim reference. 01003 itself remains unconfirmed." },
  { docCode: "01004", nodeId: "1.2.1", docTypeLabel: "Заявление о внесении изменений в регистрационное досье", folderPath: "m1\\1.2\\1.2.1", source: "inferred", notes: "Inferred folderPath matched to confirmed sibling 01002 (same section 1.2.1) in sorbit_.xml — includes subfolder, per verbatim reference. 01004 itself remains unconfirmed." },
  { docCode: "01005", nodeId: "1.2", docTypeLabel: "ПП- Сорбит- ЕАЭС-bcc_business_06_11_2025 16_15_30-10", folderPath: "m1\\1.2", source: "sample-dossier" },
  { docCode: "01006", nodeId: "1.2.3", docTypeLabel: "Копия лицензии на производство", folderPath: "m1\\1.2", source: "inferred", notes: "Inferred folderPath based on section 1.2.3 pattern. No comparable sibling found in sorbit_.xml." },
  { docCode: "01009", nodeId: "1.2.4", docTypeLabel: "Report", folderPath: "m1\\1.2\\1.2.4", source: "sample-dossier" },
  { docCode: "01011", nodeId: "1.2.6", docTypeLabel: "Recomendation letter", folderPath: "m1\\1.2\\1.2.6", source: "sample-dossier" },
  { docCode: "01013", nodeId: "1.4.1", docTypeLabel: "Information on registration in other countries", folderPath: "m1\\1.4", source: "sample-dossier" },
  { docCode: "01015", nodeId: "1.8.1", docTypeLabel: "Addetional trade name", folderPath: "m1\\1.8", source: "sample-dossier" },
  { docCode: "01016", nodeId: "1.2.5", docTypeLabel: "Conclusion letter", folderPath: "m1\\1.2", source: "sample-dossier" },
  { docCode: "01017", nodeId: "1.8.2.5", docTypeLabel: "Summary for an application for registration of a medicinal product", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "01018", nodeId: "1.8.2.6", docTypeLabel: "Application for generic, hybrid or biosimilar", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "01019", nodeId: "1.8.2.7", docTypeLabel: "Patent Information", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "01020", nodeId: "1.8.2.8", docTypeLabel: "Application CV", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "01021", nodeId: "1.8.2.9", docTypeLabel: "Summary of application", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "02001", nodeId: "1.3.1", docTypeLabel: "Сорбит ОХЛП ЕАЭС_18.04.2025", folderPath: "m1\\1.3\\1.3.1", source: "sample-dossier" },
  { docCode: "02002", nodeId: "1.3.1", docTypeLabel: "Сорбит  ЛВ ЕАЭС_18.04.2025", folderPath: "m1\\1.3\\1.3.1", source: "sample-dossier" },
  { docCode: "02003", nodeId: "1.3.2", docTypeLabel: "Макет первичной упаковки", folderPath: "m1\\1.3\\1.3.2", source: "inferred", notes: "Inferred folderPath matched to confirmed sibling 02004 (same section 1.3.2) in sorbit_.xml — includes subfolder, per verbatim reference. 02003 itself remains unconfirmed." },
  { docCode: "02004", nodeId: "1.3.2", docTypeLabel: "Box", folderPath: "m1\\1.3\\1.3.2", source: "sample-dossier" },
  { docCode: "02005", nodeId: "1.3.2", docTypeLabel: "Label", folderPath: "m1\\1.3\\1.3.2", source: "sample-dossier" },
  { docCode: "02009", nodeId: "1.3.3", docTypeLabel: "Паспорт качества / Сертификат анализа", folderPath: "m1\\1.3\\1.3.3", source: "inferred", notes: "Inferred folderPath based on section 1.3.3 pattern. No comparable sibling found in sorbit_.xml." },
  { docCode: "02010", nodeId: "1.3.4", docTypeLabel: "Sorbit SPC", folderPath: "m1\\1.3\\1.3.4", source: "sample-dossier" },
  { docCode: "02011", nodeId: "1.3.4", docTypeLabel: "Sorbit English PIL", folderPath: "m1\\1.3\\1.3.4", source: "sample-dossier" },
  { docCode: "03001", nodeId: "1.5.1", docTypeLabel: "Резюме документации общего характера", folderPath: "m1\\1.5\\1.5.1", source: "inferred", notes: "Inferred folderPath matched to confirmed sibling 03002 (same section 1.5.1) in sorbit_.xml — includes subfolder, per verbatim reference. 03001 itself remains unconfirmed." },
  { docCode: "03002", nodeId: "1.5.1", docTypeLabel: "TSE - BSE ROQUETTE-Quality-Information note-BSE TSE-EN", folderPath: "m1\\1.5\\1.5.1", source: "sample-dossier" },
  { docCode: "03003", nodeId: "1.5.1", docTypeLabel: "Document issued by authorized veterinary supervision bodies of country of origin of raw materials", folderPath: "m1\\1.5\\1.5.1", source: "inferred", notes: "Inferred folderPath matched to confirmed siblings 03001 and 03002 (same section 1.5.1). This document applies only to products with animal-origin raw materials (TSE risk); sorbit_.xml does not contain it because Sorbitol is synthetic. 03003 itself remains unconfirmed in the reference dossier." },
  { docCode: "03006", nodeId: "1.5.4", docTypeLabel: "CEP_NEOSORB _Medical Union Pharmaceuticals _08.12.2023", folderPath: "m1\\1.5", source: "sample-dossier" },
  { docCode: "03007", nodeId: "1.5.5", docTypeLabel: "Plasma master file", folderPath: "m1\\1.5", source: "sample-dossier" },
  { docCode: "03008", nodeId: "1.5.6", docTypeLabel: "Vaccine master file", folderPath: "m1\\1.5", source: "sample-dossier" },
  { docCode: "04001", nodeId: "1.6.1", docTypeLabel: "GMP  30-1-2026", folderPath: "m1\\1.6\\1.6.1", source: "sample-dossier" },
  { docCode: "04004", nodeId: "1.6.2", docTypeLabel: "legalized factory license", folderPath: "m1\\1.6\\1.6.2", source: "sample-dossier" },
  { docCode: "04005", nodeId: "1.6.3", docTypeLabel: "last GMP inspection Summary", folderPath: "m1\\1.6\\1.6.3", source: "sample-dossier" },
  { docCode: "04010", nodeId: "1.6.6", docTypeLabel: "Regulatory result of inspection", folderPath: "m1\\1.6", source: "sample-dossier" },
  { docCode: "04011", nodeId: "1.6.7", docTypeLabel: "Complains declaration", folderPath: "m1\\1.6", source: "sample-dossier" },
  { docCode: "04012", nodeId: "1.6.8", docTypeLabel: "Complains", folderPath: "m1\\1.6\\1.6.8", source: "sample-dossier" },
  { docCode: "04014", nodeId: "1.6", docTypeLabel: "inspection letter", folderPath: "m1\\1.6", source: "sample-dossier" },
  { docCode: "04016", nodeId: "1.6.11", docTypeLabel: "A diagramof the production stages", folderPath: "m1\\1.6", source: "sample-dossier" },
  { docCode: "04017", nodeId: "1.8.2.1", docTypeLabel: "Clinical trial permission", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "04018", nodeId: "1.8.2", docTypeLabel: "a list of inspections carried out for compliance with the Rules of Good Clinical", folderPath: "m1\\1.8\\1.8.2", source: "sample-dossier" },
  { docCode: "04025", nodeId: "1.8", docTypeLabel: "Table with the list of clinical trials", folderPath: "m1\\1.8", source: "sample-dossier" },
  { docCode: "05001", nodeId: "1.7.1", docTypeLabel: "Information about Quality specialist", folderPath: "m1\\1.7", source: "sample-dossier" },
  { docCode: "05002", nodeId: "1.7.2", docTypeLabel: "Information on non-clinical expert", folderPath: "m1\\1.7", source: "sample-dossier" },
  { docCode: "05003", nodeId: "1.7.3", docTypeLabel: "Information on clinical expert", folderPath: "m1\\1.7", source: "sample-dossier" },
  { docCode: "06001", nodeId: "1.9.1", docTypeLabel: "Отчеты о клинических исследованиях", folderPath: "m1\\1.9", source: "inferred", notes: "Inferred folderPath matched to confirmed sibling 06002 (same section 1.9.1) in sorbit_.xml — no subfolder, per verbatim reference m1\\1.9\\1.9.1 Genetically Modified Organisms (GMO).pdf. 06001 itself remains unconfirmed." },
  { docCode: "06002", nodeId: "1.9.1", docTypeLabel: "Genetically Modified Organisms (GMO)", folderPath: "m1\\1.9", source: "sample-dossier" },
  { docCode: "07001", nodeId: "1.10.1", docTypeLabel: "PV system", folderPath: "m1\\1.10\\1.10.1", source: "sample-dossier" },
  { docCode: "07003", nodeId: "1.10.2", docTypeLabel: "Declaration letter", folderPath: "m1\\1.10", source: "sample-dossier" },
  { docCode: "07004", nodeId: "1.10.3", docTypeLabel: "Risk Managment plan declaration", folderPath: "m1\\1.10", source: "sample-dossier" },
  { docCode: "07005", nodeId: "1.10.4", docTypeLabel: "Dully documents", folderPath: "m1\\1.10", source: "sample-dossier" },
  { docCode: "08001", nodeId: "1.11", docTypeLabel: "Tradmark letter", folderPath: "m1", source: "sample-dossier" },
  { docCode: "09001", nodeId: "2.2", docTypeLabel: "Introduction", folderPath: "m2", source: "sample-dossier" },
  { docCode: "09002", nodeId: "2.3", docTypeLabel: "Общее резюме качества (QOS)", folderPath: "m2", source: "inferred", notes: "Inferred folderPath based on module 2 root pattern. No comparable sibling found in sorbit_.xml." },
  { docCode: "09004", nodeId: "2.3.S", docTypeLabel: "Sorbitol", folderPath: "m2\\2.3\\2.3.S", source: "sample-dossier" },
  { docCode: "09012", nodeId: "2.3.P", docTypeLabel: "Description_ Composition of Drug Product (Sorbit Packets)", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09013", nodeId: "2.3.P", docTypeLabel: "Drug substance (Sorbit Packets)", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09014", nodeId: "2.3.P", docTypeLabel: "Manufacturer(s)", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09015", nodeId: "2.3.P", docTypeLabel: "Excipients", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09016", nodeId: "2.3.P", docTypeLabel: "Specification of Finished products", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09017", nodeId: "2.3.P", docTypeLabel: "reference standard or materials (Sorbit Powder)", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09018", nodeId: "2.3.P", docTypeLabel: "Container clouser system", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09019", nodeId: "2.3.P", docTypeLabel: "Stability Summary and Conclusions (Sorbit Packets)", folderPath: "m2\\2.3\\2.3.P", source: "sample-dossier" },
  { docCode: "09021", nodeId: "2.3.A", docTypeLabel: "Facilities and Equipments", folderPath: "m2\\2.3\\2.3.A", source: "sample-dossier" },
  { docCode: "09022", nodeId: "2.3.A", docTypeLabel: "Adventitious agent safty evaluation", folderPath: "m2\\2.3\\2.3.A", source: "sample-dossier" },
  { docCode: "09025", nodeId: "2.3.A.3", docTypeLabel: "Excipients", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "sample-dossier" },
  { docCode: "10001", nodeId: "2", docTypeLabel: "Non-clinical overview", folderPath: "m2", source: "sample-dossier" },
  { docCode: "10002", nodeId: "2.6.2", docTypeLabel: "Summary of pharmacological studies", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "10003", nodeId: "2.6.3", docTypeLabel: "Table of pharmacological studies", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "10004", nodeId: "2.6.4", docTypeLabel: "Text formate for summary of pharmacokinetic studies", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "10005", nodeId: "2.6.5", docTypeLabel: "Summary of pharmacokinetic study table", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "10006", nodeId: "2.6.6", docTypeLabel: "Summary of toxicological studies", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "10007", nodeId: "2.6.7", docTypeLabel: "Summary of Toxicological studies tabular form", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "10008", nodeId: "2.6.1", docTypeLabel: "Introduction", folderPath: "m2\\2.6", source: "sample-dossier" },
  { docCode: "11001", nodeId: "2", docTypeLabel: "Clinical overview", folderPath: "m2", source: "sample-dossier" },
  { docCode: "11002", nodeId: "2.7", docTypeLabel: "Clinical trial summary", folderPath: "m2\\2.7", source: "sample-dossier" },
  { docCode: "11003", nodeId: "2.7.2", docTypeLabel: "Clinical pharmacology research summary", folderPath: "m2\\2.7", source: "sample-dossier" },
  { docCode: "11004", nodeId: "2.7.3", docTypeLabel: "Clinical efficacy summary", folderPath: "m2\\2.7", source: "sample-dossier" },
  { docCode: "11005", nodeId: "2.7.4", docTypeLabel: "Clinical safty summary", folderPath: "m2\\2.7", source: "sample-dossier" },
  { docCode: "11006", nodeId: "2.7.5", docTypeLabel: "Copies of references", folderPath: "m2\\2.7", source: "sample-dossier" },
  { docCode: "11007", nodeId: "2.7.6", docTypeLabel: "A Brief overview of individual studies", folderPath: "m2\\2.7", source: "sample-dossier" },
  { docCode: "12001", nodeId: "3.2.S", docTypeLabel: "Sorbitol", folderPath: "m3\\3.2\\3.2.S\\3.2.S.1", source: "sample-dossier" },
  { docCode: "12024", nodeId: "3.2.S.7", docTypeLabel: "roduct stability report- Long term - NEOSORB PF - Batches 2018 to 2021- June 202", folderPath: "m3\\3.2\\3.2.S\\3.2.S.7", source: "sample-dossier" },
  { docCode: "13001", nodeId: "3.2.Р.1", docTypeLabel: "Description_ Composition of Drug Product (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.1", source: "sample-dossier" },
  { docCode: "13004", nodeId: "3.2.Р.2.1", docTypeLabel: "Drug substance (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2\\3.2.Р.2.1", source: "sample-dossier" },
  { docCode: "13005", nodeId: "3.2.Р.2.1", docTypeLabel: "Excepients", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2\\3.2.Р.2.1", source: "sample-dossier" },
  { docCode: "13007", nodeId: "3.2.Р.2.2", docTypeLabel: "Formulation development (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2\\3.2.Р.2.2", source: "sample-dossier" },
  { docCode: "13008", nodeId: "3.2.Р.2.2", docTypeLabel: "Overage", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2\\3.2.Р.2.2", source: "sample-dossier" },
  { docCode: "13009", nodeId: "3.2.Р.2.2", docTypeLabel: "Physicochemical_ Biological Properties (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2\\3.2.Р.2.2", source: "sample-dossier" },
  { docCode: "13010", nodeId: "3.2.Р.2", docTypeLabel: "manufacturing process development (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2", source: "sample-dossier" },
  { docCode: "13011", nodeId: "3.2.Р.2", docTypeLabel: "Container closure system (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2", source: "sample-dossier" },
  { docCode: "13012", nodeId: "3.2.Р.2", docTypeLabel: "Microbiological attributes", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2", source: "sample-dossier" },
  { docCode: "13013", nodeId: "3.2.Р.2", docTypeLabel: "Compatibility (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.2", source: "sample-dossier" },
  { docCode: "13014", nodeId: "3.2.P.3", docTypeLabel: "Manufacturer(s)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.3", source: "sample-dossier" },
  { docCode: "13015", nodeId: "3.2.P.3", docTypeLabel: "Batch Formula (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.3", source: "sample-dossier" },
  { docCode: "13016", nodeId: "3.2.P.3", docTypeLabel: "Manufacturing Process Description_ process controls (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.3", source: "sample-dossier" },
  { docCode: "13017", nodeId: "3.2.P.3", docTypeLabel: "Controls of Critical Steps and Intermediates (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.3", source: "sample-dossier" },
  { docCode: "13018", nodeId: "3.2.Р.3.5", docTypeLabel: "Validation of the manufacturing process (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.3\\3.2.Р.3.5", source: "sample-dossier" },
  { docCode: "13020", nodeId: "3.2.P.4", docTypeLabel: "Excipients", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4", source: "sample-dossier" },
  { docCode: "13026", nodeId: "3.2.P.5", docTypeLabel: "Specification of Finished products", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5", source: "sample-dossier" },
  { docCode: "13027", nodeId: "3.2.P.5", docTypeLabel: "Test Method", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5", source: "sample-dossier" },
  { docCode: "13028", nodeId: "1.5", docTypeLabel: "НД ЕАЭС для Сорбит 2024 Финальная версия", folderPath: "m1\\1.5", source: "sample-dossier" },
  { docCode: "13029", nodeId: "3.2.P.5", docTypeLabel: "Validation of analytical procedure", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5", source: "sample-dossier" },
  { docCode: "13030", nodeId: "3.2.P.5", docTypeLabel: "Batch analysis (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5", source: "sample-dossier" },
  { docCode: "13031", nodeId: "3.2.P.5", docTypeLabel: "characterization of impurities (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5", source: "sample-dossier" },
  { docCode: "13032", nodeId: "3.2.P.5", docTypeLabel: "Justification of Specifications (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5", source: "sample-dossier" },
  { docCode: "13033", nodeId: "3.2.P", docTypeLabel: "reference standard or materials (Sorbit Powder)", folderPath: "m3\\3.2\\3.2.P", source: "sample-dossier" },
  { docCode: "13034", nodeId: "3.2.P", docTypeLabel: "Container clouser system", folderPath: "m3\\3.2\\3.2.P", source: "sample-dossier" },
  { docCode: "13035", nodeId: "3.2.Р.8.1", docTypeLabel: "Stability Summary and Conclusions (Sorbit Packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.8\\3.2.Р.8.1", source: "sample-dossier" },
  { docCode: "13037", nodeId: "3.2.P.8", docTypeLabel: "Post approval and stability commitment (Sorbit packets)", folderPath: "m3\\3.2\\3.2.P\\3.2.P.8", source: "sample-dossier" },
  { docCode: "13038", nodeId: "3.2.P.8", docTypeLabel: "Stability Data (Sorbit Packets) long", folderPath: "m3\\3.2\\3.2.P\\3.2.P.8", source: "sample-dossier" },
  { docCode: "13040", nodeId: "3.2.A", docTypeLabel: "Appendices", folderPath: "m3\\3.2\\3.2.A", source: "sample-dossier" },
  { docCode: "13044", nodeId: "3.2.А.3.1", docTypeLabel: "3.2.A.3...1.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3\\3.2.А.3.1", source: "sample-dossier" },
  { docCode: "13045", nodeId: "3.2.А.3.2", docTypeLabel: "3.2.A.3.2.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3\\3.2.А.3.2", source: "sample-dossier" },
  { docCode: "13046", nodeId: "3.2.А.3", docTypeLabel: "3.2.A.3.3.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3", source: "sample-dossier" },
  { docCode: "13048", nodeId: "3.2.А.3.4", docTypeLabel: "3.2.A.3.4.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3\\3.2.А.3.4", source: "sample-dossier" },
  { docCode: "13052", nodeId: "3.2.А.3", docTypeLabel: "3.2.A.3.7.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3", source: "sample-dossier" },
  { docCode: "13058", nodeId: "3.2.А.3.6", docTypeLabel: "3.2.A.3.6.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3\\3.2.А.3.6", source: "sample-dossier" },
  { docCode: "13065", nodeId: "3.2.А.3", docTypeLabel: "3.2.A.3.8.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3", source: "sample-dossier" },
  { docCode: "13066", nodeId: "3.2.А.3", docTypeLabel: "3.2.A.3.10.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3", source: "sample-dossier" },
  { docCode: "13067", nodeId: "3.2.А.3", docTypeLabel: "3.2.A.3.5.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3", source: "sample-dossier" },
  { docCode: "13068", nodeId: "3.2.А.3.9", docTypeLabel: "3.2.A.3.9.pdf", folderPath: "m3\\3.2\\3.2.A\\3.2.А.3\\3.2.А.3.9", source: "sample-dossier" },
  { docCode: "14001", nodeId: "4.2", docTypeLabel: "Отчеты о доклинических исследованиях", folderPath: "m4", source: "inferred" },
  { docCode: "17001", nodeId: "5.2", docTypeLabel: "Отчеты о клинических исследованиях", folderPath: "m5", source: "inferred" },
  { docCode: "25001", nodeId: "1.1", docTypeLabel: "TOC module 1", folderPath: "m1", source: "sample-dossier" },
  { docCode: "25002", nodeId: "2.1", docTypeLabel: "Content of module 2-5", folderPath: "m2", source: "sample-dossier" },
  { docCode: "25003", nodeId: "3.1", docTypeLabel: "TOC module 3", folderPath: "m3", source: "sample-dossier" },
  { docCode: "25004", nodeId: "3.3", docTypeLabel: "Приложения к модулю 3", folderPath: "m3", source: "inferred" },
  { docCode: "25005", nodeId: "4.1", docTypeLabel: "Содержание модуля 4", folderPath: "m4", source: "inferred" },
  { docCode: "25006", nodeId: "5.1", docTypeLabel: "Содержание модуля 5", folderPath: "m5", source: "inferred" },

  // ─── PREVIOUSLY MISSING ENTRIES (bulk gap-fill from ctdStructure.ts) ────────

  // Module 1 — General Documentation
  { docCode: "01007", nodeId: "1.2.3", docTypeLabel: "Document confirming registration in manufacturing country and/or MAH country", folderPath: "m1\\1.2", source: "inferred" },
  { docCode: "01008", nodeId: "1.2.3", docTypeLabel: "Explanatory note justifying the absence of registration data", folderPath: "m1\\1.2", source: "inferred" },
  { docCode: "01010", nodeId: "1.2.4", docTypeLabel: "Russian translation of expert report issued upon registration", folderPath: "m1\\1.2\\1.2.4", source: "inferred" },
  { docCode: "01012", nodeId: "1.2.6", docTypeLabel: "Recommendation of Expert Committee on Medicinal Products under EEC", folderPath: "m1\\1.2", source: "inferred" },

  // Module 1 — Packaging mock-ups
  { docCode: "02006", nodeId: "1.3.2", docTypeLabel: "Mock-up of intermediate packaging of medicinal product", folderPath: "m1\\1.3\\1.3.2", source: "inferred" },
  { docCode: "02007", nodeId: "1.3.2", docTypeLabel: "Mock-up of medicinal product label", folderPath: "m1\\1.3\\1.3.2", source: "inferred" },
  { docCode: "02008", nodeId: "1.3.2", docTypeLabel: "Mock-up of medicinal product sticker", folderPath: "m1\\1.3\\1.3.2", source: "inferred" },

  // Module 1 — Quality documents

  // Module 1 — Manufacturing documents
  { docCode: "04002", nodeId: "1.6.1", docTypeLabel: "Document confirming manufacturer compliance with GMP issued by site country authority", folderPath: "m1\\1.6\\1.6.1", source: "inferred" },
  { docCode: "04006", nodeId: "1.6.3", docTypeLabel: "CAPA plan following GMP inspection", folderPath: "m1\\1.6\\1.6.3", source: "inferred" },
  { docCode: "04007", nodeId: "1.6.3", docTypeLabel: "CAPA report following GMP inspection", folderPath: "m1\\1.6\\1.6.3", source: "inferred" },
  { docCode: "04013", nodeId: "1.6.8", docTypeLabel: "Confirmation of the absence of product quality complaints", folderPath: "m1\\1.6\\1.6.8", source: "inferred" },
  { docCode: "04026", nodeId: "3.2.R.2", docTypeLabel: "Production process validation plan", folderPath: "m3\\3.2", source: "inferred" },

  // Module 1 — Pharmacovigilance
  { docCode: "07002", nodeId: "1.10.1", docTypeLabel: "Summary of applicant / MAH pharmacovigilance system", folderPath: "m1\\1.10\\1.10.1", source: "inferred" },

  // Module 2 — QOS Drug Substance sub-sections
  { docCode: "09003", nodeId: "2.3.S", docTypeLabel: "Drug Substance (Active Substance) overview", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09005", nodeId: "2.3.S.2", docTypeLabel: "Summary of manufacturing process of active substance", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09006", nodeId: "2.3.S.3", docTypeLabel: "Summary of characterization of active substance", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09007", nodeId: "2.3.S.4", docTypeLabel: "Summary of control of active substance", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09008", nodeId: "2.3.S.5", docTypeLabel: "Summary of reference standards or materials", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09009", nodeId: "2.3.S.6", docTypeLabel: "Summary of container closure system", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09010", nodeId: "2.3.S.7", docTypeLabel: "Summary of stability", folderPath: "m2\\2.3\\2.3.S", source: "inferred" },
  { docCode: "09011", nodeId: "2.3.P", docTypeLabel: "Medicinal Product overview", folderPath: "m2\\2.3\\2.3.P", source: "inferred" },
  { docCode: "09020", nodeId: "2.3.A", docTypeLabel: "Appendices overview", folderPath: "m2\\2.3\\2.3.A", source: "inferred" },
  { docCode: "09023", nodeId: "2.3.A.3", docTypeLabel: "Summary of novel excipients", folderPath: "m2\\2.3\\2.3.A", source: "inferred" },
  { docCode: "09024", nodeId: "2.3.R", docTypeLabel: "Regional information summary", folderPath: "m2\\2.3", source: "inferred" },
  { docCode: "09026", nodeId: "2.3.A.3.2", docTypeLabel: "Brief description and composition of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09027", nodeId: "2.3.A.3.3", docTypeLabel: "Brief description of pharmaceutical development of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09028", nodeId: "2.3.A.3.4", docTypeLabel: "Brief description of manufacturing process of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09029", nodeId: "2.3.A.3.6", docTypeLabel: "Brief description of quality control of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09030", nodeId: "2.3.A.3.8", docTypeLabel: "Brief description of container closure system for excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09031", nodeId: "2.3.A.3.9", docTypeLabel: "Brief description of stability of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09032", nodeId: "2.3.A.3.5", docTypeLabel: "Batch formula (production recipe) of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09033", nodeId: "2.3.A.3.7", docTypeLabel: "Microbiological characteristics of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },
  { docCode: "09034", nodeId: "2.3.A.3.10", docTypeLabel: "Compatibility information of excipient", folderPath: "m2\\2.3\\2.3.A\\2.3.A.3", source: "inferred" },

  // Module 3 — Active Substance (3.2.S) sub-sections
  { docCode: "12010", nodeId: "3.2.S.2.6", docTypeLabel: "Manufacturing process development", folderPath: "m3\\3.2\\3.2.S\\3.2.S.2", source: "inferred" },
  { docCode: "12011", nodeId: "3.2.S.3.1", docTypeLabel: "Elucidation of structure and other characteristics", folderPath: "m3\\3.2\\3.2.S\\3.2.S.3", source: "inferred" },
  { docCode: "12012", nodeId: "3.2.S.3.2", docTypeLabel: "Impurities", folderPath: "m3\\3.2\\3.2.S\\3.2.S.3", source: "inferred" },
  { docCode: "12013", nodeId: "3.2.S.4.1", docTypeLabel: "Specification", folderPath: "m3\\3.2\\3.2.S\\3.2.S.4", source: "inferred" },
  { docCode: "12014", nodeId: "3.2.S.4.2", docTypeLabel: "Analytical procedures", folderPath: "m3\\3.2\\3.2.S\\3.2.S.4", source: "inferred" },
  { docCode: "12015", nodeId: "3.2.S.4.3", docTypeLabel: "Validation of analytical procedures", folderPath: "m3\\3.2\\3.2.S\\3.2.S.4", source: "inferred" },
  { docCode: "12016", nodeId: "3.2.S.4.4", docTypeLabel: "Batch analyses", folderPath: "m3\\3.2\\3.2.S\\3.2.S.4", source: "inferred" },
  { docCode: "12017", nodeId: "3.2.S.4.5", docTypeLabel: "Justification of specification", folderPath: "m3\\3.2\\3.2.S\\3.2.S.4", source: "inferred" },
  { docCode: "12018", nodeId: "3.2.S.5", docTypeLabel: "Reference standards or materials", folderPath: "m3\\3.2\\3.2.S\\3.2.S.5", source: "inferred" },
  { docCode: "12019", nodeId: "3.2.S.6", docTypeLabel: "Container closure system", folderPath: "m3\\3.2\\3.2.S\\3.2.S.6", source: "inferred" },
  { docCode: "12020", nodeId: "3.2.S.7.1", docTypeLabel: "Stability summary and conclusions", folderPath: "m3\\3.2\\3.2.S\\3.2.S.7", source: "inferred" },
  { docCode: "12022", nodeId: "3.2.S.7.2", docTypeLabel: "Post-approval stability protocol and stability commitment", folderPath: "m3\\3.2\\3.2.S\\3.2.S.7", source: "inferred" },

  // Module 3 — Medicinal Product control of excipients gaps
  { docCode: "13021", nodeId: "3.2.P.4.2", docTypeLabel: "Analytical procedures", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4", source: "inferred" },
  { docCode: "13022", nodeId: "3.2.P.4.3", docTypeLabel: "Validation of analytical procedures", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4", source: "inferred" },
  { docCode: "13023", nodeId: "3.2.P.4.4", docTypeLabel: "Justification of specifications", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4", source: "inferred" },
  { docCode: "13024", nodeId: "3.2.P.4.5", docTypeLabel: "Excipients of human or animal origin", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4", source: "inferred" },
  { docCode: "13025", nodeId: "3.2.P.4.6", docTypeLabel: "Novel excipients", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4", source: "inferred" },
  { docCode: "13041", nodeId: "3.2.A.2", docTypeLabel: "Safety evaluation of medicinal products regarding extraneous agents", folderPath: "m3\\3.2\\3.2.A", source: "inferred" },

  // Module 4 — Non-clinical study reports
  { docCode: "14002", nodeId: "4.2.1.2", docTypeLabel: "Secondary pharmacodynamics", folderPath: "m4\\4.2\\4.2.1", source: "inferred" },
  { docCode: "14003", nodeId: "4.2.1.3", docTypeLabel: "Safety pharmacology", folderPath: "m4\\4.2\\4.2.1", source: "inferred" },
  { docCode: "14004", nodeId: "4.2.1.4", docTypeLabel: "Pharmacodynamic drug interactions", folderPath: "m4\\4.2\\4.2.1", source: "inferred" },
  { docCode: "15001", nodeId: "4.2.2.1", docTypeLabel: "Analytical procedures and validation reports", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "15003", nodeId: "4.2.2.2", docTypeLabel: "Absorption", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "15004", nodeId: "4.2.2.3", docTypeLabel: "Distribution", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "15005", nodeId: "4.2.2.4", docTypeLabel: "Metabolism", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "15006", nodeId: "4.2.2.5", docTypeLabel: "Excretion", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "15007", nodeId: "4.2.2.6", docTypeLabel: "Pharmacokinetic drug interactions", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "15008", nodeId: "4.2.2.7", docTypeLabel: "Other pharmacokinetic studies", folderPath: "m4\\4.2\\4.2.2", source: "inferred" },
  { docCode: "16001", nodeId: "4.2.3.1", docTypeLabel: "Single-dose toxicity", folderPath: "m4\\4.2\\4.2.3", source: "inferred" },
  { docCode: "16002", nodeId: "4.2.3.2", docTypeLabel: "Repeat-dose toxicity", folderPath: "m4\\4.2\\4.2.3", source: "inferred" },
  { docCode: "16003", nodeId: "4.2.3.3.1", docTypeLabel: "In vitro genotoxicity studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.3", source: "inferred" },
  { docCode: "16004", nodeId: "4.2.3.3.2", docTypeLabel: "In vivo genotoxicity studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.3", source: "inferred" },
  { docCode: "16005", nodeId: "4.2.3.5.1", docTypeLabel: "Fertility and early embryonic development", folderPath: "m4\\4.2\\4.2.3\\4.2.3.5", source: "inferred" },
  { docCode: "16006", nodeId: "4.2.3.5.2", docTypeLabel: "Embryo-fetal development", folderPath: "m4\\4.2\\4.2.3\\4.2.3.5", source: "inferred" },
  { docCode: "16007", nodeId: "4.2.3.5.3", docTypeLabel: "Prenatal and postnatal development", folderPath: "m4\\4.2\\4.2.3\\4.2.3.5", source: "inferred" },
  { docCode: "16008", nodeId: "4.2.3.5.4", docTypeLabel: "Studies in which offspring are juvenile and/or further evaluated", folderPath: "m4\\4.2\\4.2.3\\4.2.3.5", source: "inferred" },
  { docCode: "16009", nodeId: "4.2.3.6", docTypeLabel: "Local tolerance", folderPath: "m4\\4.2\\4.2.3", source: "inferred" },
  { docCode: "16010", nodeId: "4.2.3.7.7", docTypeLabel: "Other toxicological studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16011", nodeId: "4.2.3.7.1", docTypeLabel: "Antigenicity", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16012", nodeId: "4.2.3.7.2", docTypeLabel: "Immunotoxicity", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16013", nodeId: "4.2.3.7.3", docTypeLabel: "Mechanistic studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16014", nodeId: "4.2.3.7.4", docTypeLabel: "Dependence", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16015", nodeId: "4.2.3.7.5", docTypeLabel: "Metabolites", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16016", nodeId: "4.2.3.7.6", docTypeLabel: "Impurities", folderPath: "m4\\4.2\\4.2.3\\4.2.3.7", source: "inferred" },
  { docCode: "16017", nodeId: "4.2.3.4.1", docTypeLabel: "Long-term carcinogenicity studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.4", source: "inferred" },
  { docCode: "16018", nodeId: "4.2.3.4.2", docTypeLabel: "Short- or medium-term carcinogenicity studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.4", source: "inferred" },
  { docCode: "16019", nodeId: "4.2.3.4.3", docTypeLabel: "Other carcinogenicity studies", folderPath: "m4\\4.2\\4.2.3\\4.2.3.4", source: "inferred" },

  // Module 5 — Clinical study reports
  { docCode: "17002", nodeId: "5.3.1.1", docTypeLabel: "Bioavailability (BA) study reports", folderPath: "m5\\5.3\\5.3.1", source: "inferred" },
  { docCode: "17003", nodeId: "5.3.1.2", docTypeLabel: "Comparative BA and bioequivalence (BE) study reports", folderPath: "m5\\5.3\\5.3.1", source: "inferred" },
  { docCode: "17005", nodeId: "5.3.1.3", docTypeLabel: "In vitro - in vivo correlation study reports", folderPath: "m5\\5.3\\5.3.1", source: "inferred" },
  { docCode: "17006", nodeId: "5.3.1.4", docTypeLabel: "Reports of bioanalytical and analytical methods for human studies", folderPath: "m5\\5.3\\5.3.1", source: "inferred" },
  { docCode: "18001", nodeId: "5.3.2.1", docTypeLabel: "Plasma protein binding study reports", folderPath: "m5\\5.3\\5.3.2", source: "inferred" },
  { docCode: "18002", nodeId: "5.3.2.2", docTypeLabel: "Hepatic metabolism and drug interaction study reports", folderPath: "m5\\5.3\\5.3.2", source: "inferred" },
  { docCode: "18003", nodeId: "5.3.2.3", docTypeLabel: "Studies using other human biomaterials", folderPath: "m5\\5.3\\5.3.2", source: "inferred" },
  { docCode: "19001", nodeId: "5.3.3.1", docTypeLabel: "Healthy volunteer PK and initial tolerability study reports", folderPath: "m5\\5.3\\5.3.3", source: "inferred" },
  { docCode: "19002", nodeId: "5.3.3.2", docTypeLabel: "Patient PK and initial tolerability study reports", folderPath: "m5\\5.3\\5.3.3", source: "inferred" },
  { docCode: "19003", nodeId: "5.3.3.3", docTypeLabel: "Intrinsic factor PK study reports", folderPath: "m5\\5.3\\5.3.3", source: "inferred" },
  { docCode: "19004", nodeId: "5.3.3.4", docTypeLabel: "Extrinsic factor PK study reports", folderPath: "m5\\5.3\\5.3.3", source: "inferred" },
  { docCode: "19005", nodeId: "5.3.3.5", docTypeLabel: "Population pharmacokinetic study reports", folderPath: "m5\\5.3\\5.3.3", source: "inferred" },
  { docCode: "20001", nodeId: "5.3.4.1", docTypeLabel: "Healthy volunteer PD and PK/PD study reports", folderPath: "m5\\5.3\\5.3.4", source: "inferred" },
  { docCode: "20005", nodeId: "5.3.4.2", docTypeLabel: "Patient PD and PK/PD study reports", folderPath: "m5\\5.3\\5.3.4", source: "inferred" },
  { docCode: "21001", nodeId: "5.3.5.1", docTypeLabel: "Reports of controlled clinical studies pertinent to requested indication", folderPath: "m5\\5.3\\5.3.5", source: "inferred" },
  { docCode: "22001", nodeId: "5.3.5.2", docTypeLabel: "Reports of uncontrolled clinical studies", folderPath: "m5\\5.3\\5.3.5", source: "inferred" },
  { docCode: "22002", nodeId: "5.3.5.3", docTypeLabel: "Reports of analyses of data from more than one study", folderPath: "m5\\5.3\\5.3.5", source: "inferred" },
  { docCode: "22003", nodeId: "5.3.5.4", docTypeLabel: "Other clinical study reports", folderPath: "m5\\5.3\\5.3.5", source: "inferred" },
  { docCode: "23001", nodeId: "5.3.6", docTypeLabel: "Reports of post-marketing experience", folderPath: "m5\\5.3", source: "inferred" },
  { docCode: "24001", nodeId: "5.3.7", docTypeLabel: "Case report forms", folderPath: "m5\\5.3\\5.3.7", source: "inferred" },
  { docCode: "24002", nodeId: "5.3.7", docTypeLabel: "Individual patient data listings", folderPath: "m5\\5.3\\5.3.7", source: "inferred" },
  { docCode: "25007", nodeId: "5.1", docTypeLabel: "Table of contents of module 5", folderPath: "m5", source: "inferred" },
  { docCode: "25008", nodeId: "5.4", docTypeLabel: "Literature references (Module 5)", folderPath: "m5", source: "inferred" },
];

export function getCtdDocCodeEntry(docCode: string): CtdDocCodeEntry | undefined {
  if (!docCode) return undefined;
  return CTD_DOC_CODES.find((entry) => entry.docCode === docCode);
}

export function getAvailableDocTypesForNode(nodeId: string): CtdDocCodeEntry[] {
  if (!nodeId) return [];
  const cleanNode = nodeId.replace(/-\d{5}$/, "").trim();
  return CTD_DOC_CODES.filter(
    (entry) => entry.nodeId === cleanNode || cleanNode.startsWith(entry.nodeId)
  );
}

export function findCtdDocCodeEntry(nodeId: string, docCode?: string): CtdDocCodeEntry | undefined {
  if (docCode) {
    const directMatch = getCtdDocCodeEntry(docCode);
    if (directMatch) return directMatch;
  }

  if (!nodeId) return undefined;

  // Check if nodeId contains dash suffix, e.g., '1.3.1-02001'
  const dashMatch = nodeId.match(/-(\d{5})$/);
  if (dashMatch) {
    const codeFromDash = dashMatch[1];
    const match = getCtdDocCodeEntry(codeFromDash);
    if (match) return match;
  }

  const matches = getAvailableDocTypesForNode(nodeId);
  if (matches.length === 1) {
    return matches[0];
  }

  return undefined;
}

export function getCanonicalDocLabelByCode(docCode: string): string | undefined {
  const entry = getCtdDocCodeEntry(docCode);
  return entry?.docTypeLabel;
}
