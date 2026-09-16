export interface CtdDocCodeEntry {
  docCode: string;
  nodeId: string;
  docTypeLabel: string;
  /**
   * WARNING FOR MAINTAINERS:
   * Do NOT clean up, normalize, lowercase, or reformat these folderPath strings!
   * Every folderPath value MUST remain a verbatim hardcoded string sourced directly
   * from validated portal dossiers. For example, docCode '13001' uses a Cyrillic 'Р' (\u0420)
   * in 'm3\3.2\3.2.P\3.2.Р.1', whereas '12001' uses Latin 'S' in 'm3\3.2\3.2.S\3.2.S.1'.
   * Top-level module root documents (e.g., 01001, 25001, 08001, 25002, 09001, 10001, 11001, etc.)
   * reside directly in module roots (e.g., 'm1', 'm2', 'm3', 'm4', 'm5') without subfolders.
   * All folderPath strings MUST be stored WITHOUT a trailing backslash.
   */
  folderPath: string;
}

export const CTD_DOC_CODES: CtdDocCodeEntry[] = [
  // Module 1 Root Documents
  { docCode: "01001", nodeId: "1.0", docTypeLabel: "Сопроводительное письмо", folderPath: "m1" },
  { docCode: "25001", nodeId: "1.1", docTypeLabel: "Содержание регистрационного досье", folderPath: "m1" },
  { docCode: "08001", nodeId: "1.11", docTypeLabel: "План педиатрических исследований (PIP)", folderPath: "m1" },

  // Module 1 Section Documents
  { docCode: "01002", nodeId: "1.2.1", docTypeLabel: "Заявление о регистрации лекарственного препарата", folderPath: "m1\\1.2" },
  { docCode: "01003", nodeId: "1.2.1", docTypeLabel: "Заявление о приведении в соответствие с требованиями ЕАЭС", folderPath: "m1\\1.2" },
  { docCode: "01004", nodeId: "1.2.1", docTypeLabel: "Заявление о внесении изменений в регистрационное досье", folderPath: "m1\\1.2" },
  { docCode: "01005", nodeId: "1.2.2", docTypeLabel: "Документ, подтверждающий уплату пошлины", folderPath: "m1\\1.2" },
  { docCode: "01006", nodeId: "1.2.3", docTypeLabel: "Копия лицензии на производство", folderPath: "m1\\1.2" },
  { docCode: "01009", nodeId: "1.2.4", docTypeLabel: "Отчет о результатах инспектирования производства", folderPath: "m1\\1.2" },
  { docCode: "01016", nodeId: "1.2.5", docTypeLabel: "Заключительное письмо", folderPath: "m1\\1.2" },
  { docCode: "01011", nodeId: "1.2.6", docTypeLabel: "Рекомендательное письмо", folderPath: "m1\\1.2" },
  { docCode: "02001", nodeId: "1.3.1", docTypeLabel: "Общая характеристика лекарственного препарата (ОХЛП)", folderPath: "m1\\1.3\\1.3.1" },
  { docCode: "02002", nodeId: "1.3.1", docTypeLabel: "Листок-вкладыш (ЛВ)", folderPath: "m1\\1.3\\1.3.1" },
  { docCode: "02003", nodeId: "1.3.2", docTypeLabel: "Макет первичной упаковки", folderPath: "m1\\1.3\\1.3.2" },
  { docCode: "02004", nodeId: "1.3.2", docTypeLabel: "Макет вторичной (потребительской) упаковки", folderPath: "m1\\1.3\\1.3.2" },
  { docCode: "02005", nodeId: "1.3.2", docTypeLabel: "Текст маркировки первичной и вторичной упаковки", folderPath: "m1\\1.3\\1.3.2" },
  { docCode: "02009", nodeId: "1.3.3", docTypeLabel: "Паспорт качества / Сертификат анализа", folderPath: "m1\\1.3\\1.3.3" },
  { docCode: "02010", nodeId: "1.3.4", docTypeLabel: "Нормативный документ по качеству (НД)", folderPath: "m1\\1.3\\1.3.4" },
  { docCode: "02011", nodeId: "1.3.4", docTypeLabel: "Инструкция по медицинскому применению", folderPath: "m1\\1.3\\1.3.4" },
  { docCode: "01013", nodeId: "1.4.1", docTypeLabel: "Копия документа о государственной регистрации", folderPath: "m1\\1.4" },
  { docCode: "03001", nodeId: "1.5.1", docTypeLabel: "Резюме документации общего характера", folderPath: "m1\\1.5" },
  { docCode: "03004", nodeId: "1.5.2", docTypeLabel: "Экспертное заключение по качеству", folderPath: "m1\\1.5" },
  { docCode: "03005", nodeId: "1.5.3", docTypeLabel: "Экспертное заключение по доклиническим данным", folderPath: "m1\\1.5" },
  { docCode: "03006", nodeId: "1.5.4", docTypeLabel: "Экспертное заключение по клиническим данным", folderPath: "m1\\1.5" },
  { docCode: "03007", nodeId: "1.5.5", docTypeLabel: "Сведения о квалификации экспертов (CV)", folderPath: "m1\\1.5" },
  { docCode: "03008", nodeId: "1.5.6", docTypeLabel: "Заявление эксперта о независимости", folderPath: "m1\\1.5" },
  { docCode: "13028", nodeId: "1.5.7", docTypeLabel: "Оценка экологического риска", folderPath: "m1\\1.5" },

  // Node 1.6
  { docCode: "04001", nodeId: "1.6", docTypeLabel: "Документация по качеству", folderPath: "m1\\1.6\\1.6.1" },
  { docCode: "04003", nodeId: "1.6.2", docTypeLabel: "Сведения о производственном участке", folderPath: "m1\\1.6\\1.6.2" },
  { docCode: "04004", nodeId: "1.6", docTypeLabel: "Сертификат GMP уполномоченного органа", folderPath: "m1\\1.6\\1.6.3" },
  { docCode: "04005", nodeId: "1.6", docTypeLabel: "Мастер-файл производственной площадки (SMF)", folderPath: "m1\\1.6\\1.6.3" },
  { docCode: "04010", nodeId: "1.6", docTypeLabel: "Валидационный мастер-план", folderPath: "m1\\1.6\\1.6.6" },
  { docCode: "04011", nodeId: "1.6", docTypeLabel: "Разрешение на выпуск серии", folderPath: "m1\\1.6\\1.6.7" },
  { docCode: "04012", nodeId: "1.6", docTypeLabel: "Сертификат пригодности монографии ЕФ (CEP)", folderPath: "m1\\1.6\\1.6.8" },
  { docCode: "04014", nodeId: "1.6", docTypeLabel: "Сертификат безопасности в отношении ТСЭ/БСЭ", folderPath: "m1\\1.6\\1.6.9" },
  { docCode: "04016", nodeId: "1.6", docTypeLabel: "Решение о проведении инспектирования GMP", folderPath: "m1\\1.6\\1.6.11" },

  // Node 1.7
  { docCode: "05001", nodeId: "1.7.1", docTypeLabel: "Отчеты о доклинических исследованиях", folderPath: "m1\\1.7\\1.7.1" },
  { docCode: "05002", nodeId: "1.7.2", docTypeLabel: "Сертификат соответствия GLP", folderPath: "m1\\1.7\\1.7.2" },
  { docCode: "05003", nodeId: "1.7.3", docTypeLabel: "Сводный отчет по токсикологии", folderPath: "m1\\1.7\\1.7.3" },

  // Node 1.8 & 1.8.2
  { docCode: "01015", nodeId: "1.8.1", docTypeLabel: "Мастер-файл системы фармаконадзора (PSMF)", folderPath: "m1\\1.8\\1.8.1" },
  { docCode: "01017", nodeId: "1.8.2", docTypeLabel: "План управления рисками (RMP)", folderPath: "m1\\1.8\\1.8.2" },
  { docCode: "01018", nodeId: "1.8.2", docTypeLabel: "Периодический обновляемый отчет по безопасности (PSUR)", folderPath: "m1\\1.8\\1.8.2" },
  { docCode: "01019", nodeId: "1.8.2", docTypeLabel: "Сведения об уполномоченном лице по фармаконадзору (QPPV)", folderPath: "m1\\1.8\\1.8.2" },
  { docCode: "01020", nodeId: "1.8.2", docTypeLabel: "Договор на осуществление фармаконадзора", folderPath: "m1\\1.8\\1.8.2" },
  { docCode: "01021", nodeId: "1.8.2", docTypeLabel: "Описание электронной базы данных по фармаконадзору", folderPath: "m1\\1.8\\1.8.2" },
  { docCode: "04017", nodeId: "1.8.2", docTypeLabel: "Иностранный сертификат GMP", folderPath: "m1\\1.8\\1.8.2" },
  { docCode: "04025", nodeId: "1.8.3", docTypeLabel: "Мастер-файл плазмы крови (PMF)", folderPath: "m1\\1.8\\1.8.3" },

  // Node 1.9 & 1.10
  { docCode: "06001", nodeId: "1.9.1", docTypeLabel: "Отчеты о клинических исследованиях", folderPath: "m1\\1.9\\1.9.1" },
  { docCode: "07001", nodeId: "1.10.1", docTypeLabel: "Копия свидетельства на товарный знак", folderPath: "m1\\1.10\\1.10.1" },
  { docCode: "07003", nodeId: "1.10.2", docTypeLabel: "Копия патента", folderPath: "m1\\1.10\\1.10.2" },
  { docCode: "07004", nodeId: "1.10.3", docTypeLabel: "Декларация о патентной чистоте", folderPath: "m1\\1.10\\1.10.3" },
  { docCode: "07005", nodeId: "1.10.4", docTypeLabel: "Лицензионное соглашение", folderPath: "m1\\1.10\\1.10.4" },

  // Module 2 Root Documents (All sit directly in m2)
  { docCode: "25002", nodeId: "2.1", docTypeLabel: "Содержание модулей 2-5", folderPath: "m2" },
  { docCode: "09001", nodeId: "2.2", docTypeLabel: "Введение в CTD", folderPath: "m2" },
  { docCode: "09002", nodeId: "2.3", docTypeLabel: "Общее резюме качества (QOS)", folderPath: "m2" },
  { docCode: "10001", nodeId: "2.4", docTypeLabel: "Доклинический обзор", folderPath: "m2" },
  { docCode: "11001", nodeId: "2.5", docTypeLabel: "Клинический обзор", folderPath: "m2" },
  { docCode: "10008", nodeId: "2.6", docTypeLabel: "Доклиническое резюме", folderPath: "m2" },
  { docCode: "11002", nodeId: "2.7", docTypeLabel: "Клиническое резюме", folderPath: "m2" },

  // Module 3
  { docCode: "25003", nodeId: "3.1", docTypeLabel: "Содержание модуля 3", folderPath: "m3" },
  { docCode: "12001", nodeId: "3.2.P", docTypeLabel: "Описание и состав готового лекарственного препарата", folderPath: "m3\\3.2\\3.2.S\\3.2.S.1" },
  { docCode: "13001", nodeId: "3.2.P", docTypeLabel: "Документация качества готового препарата (раздел 3.2.P.1)", folderPath: "m3\\3.2\\3.2.P\\3.2.Р.1" },
  { docCode: "12002", nodeId: "3.2.P", docTypeLabel: "Фармацевтическая разработка", folderPath: "m3\\3.2\\3.2.P\\3.2.P.2" },
  { docCode: "12003", nodeId: "3.2.P", docTypeLabel: "Технология производства готового препарата", folderPath: "m3\\3.2\\3.2.P\\3.2.P.3" },
  { docCode: "12004", nodeId: "3.2.P", docTypeLabel: "Контроль вспомогательных веществ", folderPath: "m3\\3.2\\3.2.P\\3.2.P.4" },
  { docCode: "12005", nodeId: "3.2.P", docTypeLabel: "Контроль качества готового продукта", folderPath: "m3\\3.2\\3.2.P\\3.2.P.5" },
  { docCode: "12006", nodeId: "3.2.P", docTypeLabel: "Стандартные образцы готового препарата", folderPath: "m3\\3.2\\3.2.P\\3.2.P.6" },
  { docCode: "12007", nodeId: "3.2.P", docTypeLabel: "Система упаковки и укупорки готового препарата", folderPath: "m3\\3.2\\3.2.P\\3.2.P.7" },
  { docCode: "12008", nodeId: "3.2.P", docTypeLabel: "Отчет о стабильности готового препарата", folderPath: "m3\\3.2\\3.2.P\\3.2.P.8" },
  { docCode: "25004", nodeId: "3.3", docTypeLabel: "Приложения к модулю 3", folderPath: "m3" },

  // Module 4 & 5 Root Documents
  { docCode: "25005", nodeId: "4.1", docTypeLabel: "Содержание модуля 4", folderPath: "m4" },
  { docCode: "14001", nodeId: "4.2", docTypeLabel: "Отчеты о доклинических исследованиях", folderPath: "m4" },
  { docCode: "25006", nodeId: "5.1", docTypeLabel: "Содержание модуля 5", folderPath: "m5" },
  { docCode: "17001", nodeId: "5.2", docTypeLabel: "Отчеты о клинических исследованиях", folderPath: "m5" },
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
