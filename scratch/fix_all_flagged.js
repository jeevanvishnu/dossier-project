const fs = require("fs");
const path = require("path");

const enJsonPath = path.join(__dirname, "../frontend/messages/en.json");
const ruJsonPath = path.join(__dirname, "../frontend/messages/ru.json");
const ctdPath = path.join(__dirname, "../frontend/app/constants/ctdStructure.ts");

const ctdContent = fs.readFileSync(ctdPath, "utf-8");
const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));

const ruDict = {
  // Common / Repeated phrase translations
  "Nomenclature of active substance": "Номенклатура активного вещества",
  "Structure of active substance": "Структура активного вещества",
  "General properties of active substance": "Общие свойства активного вещества",
  "Description of manufacturing process and process controls": "Описание производственного процесса и контроля процесса",
  "Control of materials": "Контроль материалов",
  "Process validation and/or evaluation of active substance": "Валидация и/или оценка процесса производства активного вещества",
  "Manufacturing process development": "Разработка производственного процесса",
  "Elucidation of structure and other characteristics": "Установление структуры и других характеристик",
  "Impurities": "Примеси",
  "Specification": "Спецификация",
  "Specifications": "Спецификации",
  "Analytical procedures": "Аналитические методики",
  "Validation of analytical procedures": "Валидация аналитических методик",
  "Batch analyses": "Анализы серий",
  "Justification of specification": "Обоснование спецификации",
  "Justification of specifications": "Обоснование спецификаций",
  "Reference standards or materials": "Стандартные образцы или материалы",
  "Reference standards and materials": "Стандартные образцы и материалы",
  "Container closure system": "Упаковочная система / контейнер",
  "Stability summary and conclusions": "Резюме стабильности и выводы",
  "Post-approval stability protocol and stability commitment": "Протокол стабильности после регистрации и обязательства по стабильности",
  "Stability data": "Данные по стабильности",
  "Description and composition of medicinal product": "Описание и состав лекарственного препарата",
  "Active substance": "Активное вещество",
  "Development of dosage form": "Разработка лекарственной формы",
  "Overages": "Избытки (передозировки при производстве)",
  "Physicochemical and biological properties": "Физико-химические и биологические свойства",
  "Microbiological attributes": "Микробиологические свойства",
  "Compatibility": "Совместимость",
  "Batch formula (production recipe)": "Состав на серию (производственный рецепт)",
  "Process validation and/or evaluation": "Валидация и/или оценка процесса",
  "Excipients of human or animal origin": "Вспомогательные вещества человеческого или животного происхождения",
  "Novel excipients": "Новые вспомогательные вещества",
  "Characterization of impurities": "Характеристика примесей",
  "Facilities and equipment": "Производственные мощности и оборудование",
  "Safety evaluation of medicinal products regarding extraneous agents": "Оценка безопасности лекарственных препаратов в отношении посторонних агентов",
  "Information on excipients (reducing agents, solvents, diluents, carriers)": "Информация о вспомогательных веществах (восстановители, растворители, разбавители, носители)",
  "Description and composition of excipient": "Описание и состав вспомогательного вещества",
  "Pharmaceutical development of excipient": "Фармацевтическая разработка вспомогательного вещества",
  "Manufacturing process of excipient": "Производственный процесс вспомогательного вещества",
  "Batch formula of excipient": "Состав на серию вспомогательного вещества",
  "Quality control of excipient": "Контроль качества вспомогательного вещества",
  "Container closure system for excipient": "Упаковочная система для вспомогательного вещества",
  "Compatibility information of excipient": "Информация о совместимости вспомогательного вещества",
  "Production process validation plan": "План валидации производственного процесса",
  "Literature references": "Литературные источники",
  "Safety pharmacology": "Фармакология безопасности",
  "Pharmacodynamic drug interactions": "Фармакодинамические лекарственные взаимодействия",
  "Analytical procedures and validation reports": "Аналитические методики и отчеты по валидации",
  "Metabolism": "Метаболизм",
  "Other pharmacokinetic studies": "Другие фармакокинетические исследования",
  "In vitro genotoxicity studies": "Исследования генотоксичности in vitro",
  "In vivo genotoxicity studies": "Исследования генотоксичности in vivo",
  "Long-term studies": "Долгосрочные исследования",
  "Short- or medium-term studies": "Краткосрочные или среднесрочные исследования",
  "Other carcinogenicity studies": "Другие исследования канцерогенности",
  "Fertility and early embryonic development": "Фертильность и раннее эмбриональное развитие",
  "Embryo-fetal development": "Эмбрионально-фетальное развитие",
  "Prenatal and postnatal development": "Пренатальное и постнатальное развитие",
  "Studies in which offspring are juvenile and/or further evaluated": "Исследования с введением препарата молодым животным",
  "Mechanistic studies": "Исследования механизма действия",
  "Other toxicological studies": "Другие токсикологические исследования",
  "Tabular listing of all clinical studies": "Перечень всех клинических исследований в виде таблицы",
  "Bioavailability (BA) study reports": "Отчеты об исследованиях биодоступности (БД)",
  "Comparative BA and bioequivalence (BE) study reports": "Отчеты о сравнительных исследованиях БД и биоэквивалентности (БЭ)",
  "In vitro – in vivo correlation study reports": "Отчеты об исследованиях корреляции in vitro – in vivo",
  "Reports of bioanalytical and analytical methods for human studies": "Отчеты о биоаналитических и аналитических методах исследований у человека",
  "Plasma protein binding study reports": "Отчеты об исследованиях связывания с белками плазмы",
  "Hepatic metabolism and drug interaction study reports": "Отчеты об исследованиях печеночного метаболизма и лекарственного взаимодействия",
  "Studies using other human biomaterials": "Исследования с использованием других биоматериалов человека",
  "Healthy volunteer PK and initial tolerability study reports": "Отчеты об исследованиях ФК и начальной переносимости у здоровых добровольцев",
  "Patient PK and initial tolerability study reports": "Отчеты об исследованиях ФК и начальной переносимости у пациентов",
  "Intrinsic factor PK study reports": "Отчеты об исследованиях ФК с учетом внутренних факторов",
  "Extrinsic factor PK study reports": "Отчеты об исследованиях ФК с учетом внешних факторов",
  "Population pharmacokinetic study reports": "Отчеты о популяционных исследованиях фармакокинетики",
  "Healthy volunteer PD and PK/PD study reports": "Отчеты об исследованиях ФД и ФК/ФД у здоровых добровольцев",
  "Patient PD and PK/PD study reports": "Отчеты об исследованиях ФД и ФК/ФД у пациентов",
  "Reports of controlled clinical studies pertinent to requested indication": "Отчеты о контролируемых клинических исследованиях по заявленному показанию",
  "Reports of uncontrolled clinical studies": "Отчеты о неконтролируемых клинических исследованиях",
  "Reports of analyses of data from more than one study": "Отчеты об анализе данных более чем одного исследования",
  "Other clinical study reports": "Другие отчеты о клинических исследованиях",
  "Reports of post-marketing experience": "Отчеты о пострегистрационном опыте применения",
  "Case report forms": "Формы регистрационных карт (CRF)",
  "Individual patient data listings": "Индивидуальные списки данных пациентов"
};

const regex = /id:\s*"([^"]+)",(?:[\s\S]*?)title:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(ctdContent)) !== null) {
  const rawId = match[1];
  const title = match[2];
  const safeKey = rawId.replace(/[\.\-]/g, "_");

  if (ruDict[title]) {
    ruJson.documentTitles[safeKey] = ruDict[title];
  }
}

fs.writeFileSync(ruJsonPath, JSON.stringify(ruJson, null, 2), "utf-8");
console.log("Successfully applied all exact Russian translations!");
