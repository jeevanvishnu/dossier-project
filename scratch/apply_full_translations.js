const fs = require("fs");
const path = require("path");

const ctdPath = path.join(__dirname, "../frontend/app/constants/ctdStructure.ts");
const enJsonPath = path.join(__dirname, "../frontend/messages/en.json");
const ruJsonPath = path.join(__dirname, "../frontend/messages/ru.json");

const ctdContent = fs.readFileSync(ctdPath, "utf-8");
const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));

// Exact title translation dictionary
const titleTranslations = {
  // Module 1
  "Administrative Information & Prescribing Information": "Административная информация и информация о назначении",
  "Cover letter": "Сопроводительное письмо",
  "Table of contents": "Содержание",
  "General Documentation": "Общая документация",
  "Application for registration of a medicinal product": "Заявление о регистрации лекарственного препарата",
  "Application for registration of a medicinal product for medical use (bringing registration dossier into compliance with EAEU requirements)": "Заявление о регистрации лекарственного препарата (приведение в соответствие с требованиями ЕАЭС)",
  "Application for amendments to the registration dossier of a medicinal product": "Заявление о внесении изменений в регистрационное досье лекарственного препарата",
  "Application for re-registration of a medicinal product": "Заявление о перерегистрации лекарственного препарата",
  "Document confirming payment of expert work fees and/or registration fees (duties) in accordance with EAEU member state legislation": "Документ, подтверждающий уплату пошлины (сбора) за проведение экспертизы и/или регистрационных действий",
  "Copy of certificate for medicinal product in accordance with WHO recommended format": "Копия сертификата на лекарственный препарат по форме ВОЗ",
  "Copy of the certificate for the medicinal product (properly certified) according to WHO-recommended format": "Копия сертификата на лекарственный препарат (заверенная) по форме ВОЗ",
  "Document confirming registration in manufacturing country and/or marketing authorization holder country": "Документ, подтверждающий регистрацию в стране-производителе и/или стране держателя РУ",
  "Explanatory note justifying the absence of registration data for the medicinal product": "Пояснительная записка с обоснованием отсутствия данных о регистрации лекарственного препарата",
  "Translation into Russian and copy of expert report issued upon registration": "Перевод на русский язык и копия экспертного отчета, выданного при регистрации",
  "Expert report issued upon registration of medicinal product in manufacturing or MAH country": "Экспертный отчет, выданный при регистрации лекарственного препарата в стране производства или держателя РУ",
  "Russian translation of expert report issued upon registration in manufacturing or MAH country": "Перевод на русский язык экспертного отчета, выданного при регистрации в стране производства или держателя РУ",
  "Scientific advice conclusions": "Заключения по научным консультациям",
  "Conclusion (recommendation) of authorized body on scientific advice": "Заключение (рекомендация) уполномоченного органа по научным консультациям",
  "Recommendation of Expert Committee on Medicinal Products under EEC": "Рекомендация Экспертного комитета по лекарственным средствам при ЕЭК",
  "Conclusion of Expert Committee on Medicinal Products under EEC following preliminary scientific advice": "Заключение Экспертного комитета по лекарственным средствам при ЕЭК по результатам научных консультаций",
  "Summary of product characteristics (SmPC), package leaflet, and packaging mock-ups": "Общая характеристика лекарственного препарата (ОХЛП), листок-вкладыш, макеты упаковки",
  "Draft SmPC and package leaflet in Russian": "Проекты ОХЛП и листка-вкладыша на русском языке",
  "Draft Summary of Product Characteristics (SmPC) in Russian and Kazakh": "Проект общей характеристики лекарственного препарата (ОХЛП) на русском и казахском языках",
  "Draft package leaflet (patient information leaflet)": "Проект листка-вкладыша (инструкции по медицинскому применению)",
  "Outer, inner, and intermediate packaging mock-ups": "Макеты первичной, вторичной и промежуточной упаковки",
  "Draft medicinal product labeling": "Проект маркировки лекарственного препарата",
  "Secondary (outer) packaging mock-up": "Макет вторичной (потребительской) упаковки",
  "Primary (inner) packaging mock-up": "Макет первичной (внутренней) упаковки",
  "Intermediate packaging mock-up": "Макет промежуточной упаковки",
  "Medicinal product label mock-up": "Макет этикетки лекарственного препарата",
  "Medicinal product sticker mock-up": "Макет стикера лекарственного препарата",
  "Package leaflet user testing results": "Результаты пользовательского тестирования листка-вкладыша",
  "Package leaflet readability testing report or justification for omitting testing": "Отчет о тестировании удобочитаемости листка-вкладыша или обоснование отсутствия тестирования",
  "Copies of approved SmPC and package leaflet of manufacturing country": "Копии утвержденных ОХЛП и листка-вкладыша страны-производителя",
  "Summary of product characteristics approved by authorized body of manufacturing or MAH country": "Общая характеристика лекарственного препарата, утвержденная уполномоченным органом страны производства или держателя РУ",
  "Package leaflet of medicinal product approved by authorized body of manufacturing country": "Листок-вкладыш лекарственного препарата, утвержденный уполномоченным органом страны производства",
  "Information on regulatory status of medicinal product in other countries": "Информация о регуляторном статусе лекарственного препарата в других странах",
  "List of countries where medicinal product has been submitted, registered, refused, or suspended": "Перечень стран, в которых препарат заявлен, зарегистрирован, отклонен или отозван",
  "Quality Documents": "Документы качества",
  "Certificates of suitability to EAEU or European Pharmacopoeia monographs regarding TSE": "Сертификаты соответствия монографиям Фармакопеи ЕАЭС или Европейской фармакопеи в отношении ТСЭ",
  "Certificate of suitability to EAEU Pharmacopoeia monograph": "Сертификат соответствия монографии Фармакопеи ЕАЭС",
  "Certificate of suitability to European Pharmacopoeia monograph regarding TSE": "Сертификат соответствия монографии Европейской фармакопеи в отношении ТСЭ",
  "Document issued by authorized veterinary supervision bodies of country of origin of raw materials": "Документ, выданный уполномоченными органами ветеринарного надзора страны происхождения сырья",
  "Letter from Active Substance Master File (ASMF) holder undertaking to report all changes": "Письмо от владельца мастер-файла активной субстанции (ASMF) об обязательстве сообщать обо всех изменениях",
  "Letter confirming ASMF holder's consent to submit restricted part of ASMF dossier upon request": "Письмо с подтверждением согласия владельца ASMF предоставить закрытую часть мастер-файла по запросу",
  "Copy of certificate of suitability of active substance to European Pharmacopoeia requirements": "Копия сертификата соответствия активной субстанции требованиям Европейской фармакопеи",
  "Copy of plasma master file certificate issued by authorized body of manufacturing country": "Копия сертификата на мастер-файл плазмы, выданного уполномоченным органом страны производства",
  "Copy of vaccine antigen master file certificate issued by authorized body of manufacturing country": "Копия сертификата на мастер-файл вакцинального антигена, выданного уполномоченным органом страны производства",
  "Draft quality standard document prepared in accordance with EAEU Guidelines (EEC Decision No. 151)": "Проект нормативного документа по качеству, подготовленный в соответствии с Руководством ЕАЭС (Решение Коллегии ЕЭК № 151)",
  "Manufacturing Documents": "Производственная документация",
  "GMP compliance documents": "Документы о соответствии правилам надлежащей производственной практики (GMP)",
  "Document confirming compliance of manufacturer with EAEU GMP rules": "Документ, подтверждающий соответствие производителя правилам GMP ЕАЭС",
  "Document confirming manufacturer compliance with GMP issued by site country authority": "Документ, подтверждающий соответствие производителя требованиям GMP, выданный уполномоченным органом страны производства",
  "Manufacturing license / authorization copies": "Копии лицензий / разрешений на производство",
  "Manufacturing authorization for medicinal products issued by site country authority": "Разрешение на производство лекарственных средств, выданное уполномоченным органом страны производства",
  "Manufacturing license for medicinal products issued by site country authority": "Лицензия на производство лекарственных средств, выданная уполномоченным органом страны производства",
  "Manufacturing site inspection reports and CAPA": "Отчеты об инспектировании производственной площадки и план CAPA",
  "Inspection report of manufacturing site for compliance with GMP rules": "Отчет об инспектировании производственного участка на соответствие правилам GMP",
  "Corrective and Preventive Action (CAPA) plan following GMP inspection": "План корректирующих и предупреждающих действий (CAPA) по результатам инспекции GMP",
  "Corrective and Preventive Action (CAPA) report following GMP inspection": "Отчет о выполнении плана корректирующих и предупреждающих действий (CAPA) по результатам инспекции GMP",
  "Information on regulatory measures taken by authorized body based on inspections": "Информация о регуляторных мерах, принятых уполномоченным органом по результатам инспекций",
  "Letter from Qualified Person (QP) regarding compliance of manufacturing conditions with GMP": "Письмо от Уполномоченного лица (QP) о соответствии условий производства правилам GMP",
  "Product quality complaints information": "Информация о рекламациях на качество продукции",
  "Information on product quality complaints": "Информация о претензиях (рекламациях) к качеству продукции",
  "Confirmation of the absence of product quality complaints": "Подтверждение отсутствия претензий (рекламаций) к качеству продукции",
  "Consent to conduct pharmaceutical inspection for compliance with international treaties and EAEU law": "Согласие на проведение фармацевтической инспекции на соответствие международным договорам и праву ЕАЭС",
  "Manufacturing process flow chart indicating all sites involved in drug substance and drug product manufacturing": "Схема производственного процесса с указанием всех площадок, задействованных в производстве субстанции и препарата",
  "Information on Experts": "Информация об экспертах",
  "Information on expert who prepared Quality Overall Summary (QOS)": "Информация об эксперте, подготовившем Общее резюме качества (QOS)",
  "Information on expert who prepared Non-Clinical Overview/Summaries": "Информация об эксперте, подготовившем Доклинический обзор / резюме",
  "Information on expert who prepared Clinical Overview/Summaries": "Информация об эксперте, подготовившем Клинический обзор / резюме",
  "Specific Requirements for Different Types of Applications": "Специфические требования к различным типам заявлений",
  "Marketing authorization holder's letter containing details on additional trade name": "Письмо держателя регистрационного удостоверения с информацией о дополнительном торговом наименовании",
  "Clinical trial documents": "Документы по клиническим исследованиям",
  "Authorization of authorized body for conducting clinical trial in EAEU member states": "Разрешение уполномоченного органа на проведение клинического исследования в государствах-членах ЕАЭС",
  "List of inspections conducted for compliance with EAEU Good Clinical Practice (GCP) rules": "Перечень инспекций, проведенных на соответствие правилам GCP ЕАЭС",
  "Overview for registration applications with bibliographical sources and data": "Обзор для заявлений о регистрации на основе библиографических данных",
  "Overview for registration applications of generic, hybrid, or biosimilar medicinal products": "Обзор для заявлений о регистрации воспроизведенных, гибридных или биоаналоговых препаратов",
  "Overview for registration applications when patents exist in member state regarding registered product": "Обзор для заявлений о регистрации при наличии патентов в государстве-члене",
  "Overview for registration applications in exceptional circumstances": "Обзор для заявлений о регистрации при исключительных обстоятельствах",
  "Overview for registration applications with post-authorization measures (conditional registration)": "Обзор для заявлений о регистрации с условием проведения пострегистрационных мер",
  "Table listing clinical trials": "Сводная таблица клинических исследований",
  "Applicant's documents on environmental risk assessment": "Документы заявителя по оценке экологического риска",
  "Applicant's document on environmental risk assessment": "Документ заявителя по оценке риска для окружающей среды",
  "Applicant's letter stating whether medicinal products contain or are derived from GMOs": "Письмо заявителя о наличии или отсутствии в составе препарата генно-модифицированных организмов (ГМО)",
  "Information Concerning Pharmacovigilance in EAEU Member State": "Информация о фармаконадзоре в государстве-члене ЕАЭС",
  "Pharmacovigilance system master file (PSMF) or summary": "Мастер-файл системы фармаконадзора (МФСФ) или его резюме",
  "PSMF in accordance with EAEU GVP rules (EEC Decision No. 87)": "Мастер-файл системы фармаконадзора в соответствии с правилами GVP ЕАЭС (Решение Коллегии ЕЭК № 87)",
  "Summary of applicant / MAH pharmacovigilance system": "Резюме системы фармаконадзора заявителя / держателя РУ",
  "Written confirmation of QPPV residing/operating in EAEU member state": "Письменное подтверждение наличия Уполномоченного лица по фармаконадзору (УЛФ) в ЕАЭС",
  "Risk Management Plan (RMP) in accordance with EAEU GVP rules": "План управления рисками (ПУР) в соответствии с правилами GVP ЕАЭС",
  "Documents confirming interactions ensuring multi-entity fulfillment of MAH obligations": "Документы, подтверждающие взаимодействие для обеспечения выполнения обязанностей держателя РУ",
  "Copies of documents confirming trademark registration": "Копии документов, подтверждающих регистрацию товарного знака",

  // Module 2
  "CTD Summaries": "Резюме CTD",
  "Table of contents of modules 2 – 5": "Содержание Модулей 2–5",
  "Introduction to the Common Technical Document (CTD)": "Введение в Общий технический документ (ОТД)",
  "Quality Overall Summary (QOS)": "Общее резюме качества (QOS)",
  "Drug Substance (Active Substance)": "Активная фармацевтическая субстанция (Фармацевтическая субстанция)",
  "Summary of general information regarding starting materials and raw materials": "Резюме общей информации об исходных материалах и сырье",
  "Summary of manufacturing process of active substance": "Резюме процесса производства активной субстанции",
  "Summary of characterization of active substance": "Резюме свойств и характеристик активной субстанции",
  "Summary of control of active substance": "Резюме контроля качества активной субстанции",
  "Summary of reference standards or materials": "Резюме стандартных образцов или материалов",
  "Summary of container closure system": "Резюме упаковочной системы / контейнера",
  "Summary of stability": "Резюме стабильности",
  "Medicinal Product": "Лекарственный препарат",
  "Summary of description and composition of medicinal product": "Резюме описания и состава лекарственного препарата",
  "Summary of pharmaceutical development": "Резюме фармацевтической разработки",
  "Summary of manufacturing process of medicinal product": "Резюме процесса производства лекарственного препарата",
  "Summary of control of excipients": "Резюме контроля вспомогательных веществ",
  "Summary of control of finished product": "Резюме контроля готового лекарственного препарата",
  "Summary of reference standards and materials": "Резюме стандартных образцов и материалов",
  "Summary of container closure system": "Резюме упаковочной системы / контейнера",
  "Summary of stability of medicinal product": "Резюме стабильности лекарственного препарата",
  "Appendices": "Приложения",
  "Summary of facilities and equipment": "Резюме производственных помещений и оборудования",
  "Summary of safety evaluation for extraneous agents": "Резюме оценки безопасности в отношении посторонних агентов",
  "Summary of novel excipients": "Резюме новых вспомогательных веществ",
  "Brief information on excipients (reducing agents, solvents, diluents, carriers)": "Краткая информация о вспомогательных веществах (восстановители, растворители, разбавители, носители)",
  "Brief description and composition of excipient": "Краткое описание и состав вспомогательного вещества",
  "Brief description of pharmaceutical development of excipient": "Краткое описание фармацевтической разработки вспомогательного вещества",
  "Brief description of manufacturing process of excipient": "Краткое описание процесса производства вспомогательного вещества",
  "Batch formula (production recipe) of excipient": "Состав на серию (производственный рецепт) вспомогательного вещества",
  "Brief description of quality control of excipient": "Краткое описание контроля качества вспомогательного вещества",
  "Microbiological characteristics of excipient": "Микробиологические характеристики вспомогательного вещества",
  "Brief description of container closure system for excipient": "Краткое описание упаковочной системы для вспомогательного вещества",
  "Brief description of stability of excipient": "Краткое описание стабильности вспомогательного вещества",
  "Compatibility information of excipient": "Информация о совместимости вспомогательного вещества",
  "Regional information summary": "Резюме региональной информации",
  "Non-clinical overview": "Обзор доклинических данных (Доклинический обзор)",
  "Clinical overview": "Обзор клинических данных (Клинический обзор)",
  "Non-clinical Written and Tabulated Summaries": "Доклинические письменные и табулированные резюме",
  "Introduction": "Введение",
  "Pharmacology written summary": "Письменное резюме по фармакологии",
  "Pharmacology tabulated summary": "Табулированное резюме по фармакологии",
  "Pharmacokinetics written summary": "Письменное резюме по фармакокинетике",
  "Pharmacokinetics tabulated summary": "Табулированное резюме по фармакокинетике",
  "Toxicology written summary": "Письменное резюме по токсикологии",
  "Toxicology tabulated summary": "Табулированное резюме по токсикологии",
  "Clinical Summary": "Клиническое резюме",
  "Summary of biopharmaceutics and associated analytical methods": "Резюме биофармацевтических и связанных с ними аналитических методов",
  "Summary of clinical pharmacology studies": "Резюме исследований клинической фармакологии",
  "Summary of clinical efficacy": "Резюме клинической эффективности",
  "Summary of clinical safety": "Резюме клинической безопасности",
  "References / literature copies used": "Ссылки / копии использованной литературы",
  "Synopses of individual studies": "Синопсисы индивидуальных исследований",

  // Module 3
  "Quality (Chemical, Pharmaceutical and Biological Information)": "Качество (Химическая, фармацевтическая и биологическая информация)",
  "Table of contents of module 3": "Содержание Модуля 3",
  "Body of data": "Основные данные по качеству",
  "Drug Substance (Active Substance)": "Активная фармацевтическая субстанция (Фармацевтическая субстанция)",
  "General Information": "Общая информация",
  "Nomenclature": "Номенклатура",
  "Structure": "Структура",
  "General Properties": "Общие свойства",
  "Manufacture": "Производство",
  "Manufacturer(s)": "Производитель(и)",
  "Description of Manufacturing Process and Process Controls": "Описание производственного процесса и контроля процесса",
  "Control of Materials": "Контроль материалов",
  "Controls of Critical Steps and Intermediates": "Контроль критических стадий и промежуточных продуктов",
  "Process Validation and/or Evaluation": "Валидация и/или оценка процесса",
  "Manufacturing Process Development": "Разработка производственного процесса",
  "Characterisation": "Характеристика",
  "Elucidation of Structure and other Characteristics": "Установление структуры и других характеристик",
  "Impurities": "Примеси",
  "Control of Drug Substance": "Контроль фармацевтической субстанции",
  "Specification": "Спецификация",
  "Analytical Procedures": "Аналитические методики",
  "Validation of Analytical Procedures": "Валидация аналитических методик",
  "Batch Analyses": "Анализы серий",
  "Justification of Specification": "Обоснование спецификации",
  "Reference Standards or Materials": "Стандартные образцы или материалы",
  "Container Closure System": "Упаковочная система / контейнер",
  "Stability": "Стабильность",
  "Stability Summary and Conclusions": "Резюме стабильности и выводы",
  "Post-approval Stability Protocol and Stability Commitment": "Протокол стабильности после регистрации и обязательства по стабильности",
  "Stability Data": "Данные по стабильности",
  "Medicinal Product (Drug Product)": "Готовый лекарственный препарат",
  "Description and Composition of the Medicinal Product": "Описание и состав лекарственного препарата",
  "Pharmaceutical Development": "Фармацевтическая разработка",
  "Components of the Medicinal Product": "Компоненты лекарственного препарата",
  "Active Substance": "Активное вещество (Субстанция)",
  "Excipients": "Вспомогательные вещества",
  "Medicinal Product": "Лекарственный препарат",
  "Formulation Development": "Разработка состава",
  "Overages": "Избытки (передозировки при производстве)",
  "Physicochemical and Biological Properties": "Физико-химические и биологические свойства",
  "Microbiological Attributes": "Микробиологические свойства",
  "Compatibility": "Совместимость",
  "Manufacture": "Производство",
  "Batch Formula": "Состав на серию (рецептура)",
  "Control of Excipients": "Контроль вспомогательных веществ",
  "Specifications": "Спецификации",
  "Excipients of Human or Animal Origin": "Вспомогательные вещества человеческого или животного происхождения",
  "Novel Excipients": "Новые вспомогательные вещества",
  "Control of Finished Product": "Контроль готового лекарственного препарата",
  "Characterisation of Impurities": "Характеристика примесей",
  "Reference Standards and Materials": "Стандартные образцы и материалы",
  "Facilities and Equipment": "Производственные мощности и оборудование",
  "Adventitious Agents Safety Evaluation": "Оценка безопасности в отношении посторонних агентов",
  "Regional Information": "Региональная информация",
  "Literature References": "Литературные источники",

  // Module 4
  "Non-Clinical Study Reports": "Отчеты о доклинических исследованиях",
  "Table of contents of module 4": "Содержание Модуля 4",
  "Study Reports": "Отчеты об исследованиях",
  "Pharmacology": "Фармакология",
  "Primary Pharmacodynamics": "Первичная фармакодинамика",
  "Secondary Pharmacodynamics": "Вторичная фармакодинамика",
  "Safety Pharmacology": "Фармакология безопасности",
  "Pharmacodynamic Drug Interactions": "Фармакодинамические лекарственные взаимодействия",
  "Pharmacokinetics": "Фармакокинетика",
  "Analytical Methods and Validation Reports": "Аналитические методы и отчеты по валидации",
  "Absorption": "Всасывание (абсорбция)",
  "Distribution": "Распределение",
  "Metabolism": "Метаболизм",
  "Excretion": "Выведение (экскреция)",
  "Pharmacokinetic Drug Interactions": "Фармакокинетические лекарственные взаимодействия",
  "Other Pharmacokinetic Studies": "Другие фармакокинетические исследования",
  "Toxicology": "Токсикология",
  "Single-Dose Toxicity": "Токсичность при однократном введении",
  "Repeat-Dose Toxicity": "Токсичность при повторном введении",
  "Genotoxicity": "Генотоксичность",
  "In vitro": "В условиях in vitro",
  "In vivo": "В условиях in vivo",
  "Carcinogenicity": "Канцерогенность",
  "Long-term studies": "Долгосрочные исследования",
  "Short- or medium-term studies": "Краткосрочные или среднесрочные исследования",
  "Other studies": "Другие исследования",
  "Reproductive and Developmental Toxicity": "Репродуктивная и онтогенетическая токсичность",
  "Fertility and early embryonic development": "Фертильность и раннее эмбриональное развитие",
  "Embryo-fetal development": "Эмбрионально-фетальное развитие",
  "Prenatal and postnatal development": "Пренатальное и постнатальное развитие",
  "Studies in which the offspring (juvenile animals) are dosed": "Исследования с введением препарата молодым животным",
  "Local Tolerance": "Местная переносимость",
  "Other Toxicity Studies": "Другие исследования токсичности",
  "Antigenicity": "Антигенность",
  "Immunotoxicity": "Иммунотоксичность",
  "Mechanistic studies": "Исследования механизма действия",
  "Dependence": "Зависимость",
  "Metabolites": "Метаболиты",
  "Other": "Другое",

  // Module 5
  "Clinical Study Reports": "Отчеты о клинических исследованиях",
  "Table of contents of module 5": "Содержание Модуля 5",
  "Tabular Listing of All Clinical Studies": "Перечень всех клинических исследований в виде таблицы",
  "Reports of Biopharmaceutic Studies": "Отчеты о биофармацевтических исследованиях",
  "Bioavailability (BA) Study Reports": "Отчеты об исследованиях биодоступности (БД)",
  "Comparative BA and Bioequivalence (BE) Study Reports": "Отчеты о сравнительных исследованиях БД и биоэквивалентности (БЭ)",
  "In vitro-In vivo Correlation Study Reports": "Отчеты об исследованиях корреляции in vitro – in vivo",
  "Reports of Bioanalytical and Analytical Methods": "Отчеты о биоаналитических и аналитических методах",
  "Reports of Studies Pertinent to Pharmacokinetics using Human Biomaterials": "Отчеты об исследованиях фармакокинетики с использованием биологических материалов человека",
  "Plasma Protein Binding Study Reports": "Отчеты об исследованиях связывания с белками плазмы",
  "Reports of Hepatic Metabolism and Drug Interaction Studies": "Отчеты об исследованиях печеночного метаболизма и лекарственного взаимодействия",
  "Reports of Studies Using Other Human Biomaterials": "Отчеты об исследованиях с использованием других биоматериалов человека",
  "Reports of Human Pharmacokinetic (PK) Studies": "Отчеты об исследованиях фармакокинетики (ФК) у человека",
  "Healthy Subject PK and Initial Tolerability Study Reports": "Отчеты об исследованиях ФК и начальной переносимости у здоровых добровольцев",
  "Patient PK and Initial Tolerability Study Reports": "Отчеты об исследованиях ФК и начальной переносимости у пациентов",
  "Intrinsic Factor PK Study Reports": "Отчеты об исследованиях ФК с учетом внутренних факторов",
  "Extrinsic Factor PK Study Reports": "Отчеты об исследованиях ФК с учетом внешних факторов",
  "Population PK Study Reports": "Отчеты о популяционных исследованиях ФК",
  "Reports of Human Pharmacodynamic (PD) Studies": "Отчеты об исследованиях фармакодинамики (ФД) у человека",
  "Healthy Subject PD and PK/PD Study Reports": "Отчеты об исследованиях ФД и ФК/ФД у здоровых добровольцев",
  "Patient PD and PK/PD Study Reports": "Отчеты об исследованиях ФД и ФК/ФД у пациентов",
  "Reports of Efficacy and Safety Studies": "Отчеты об исследованиях эффективности и безопасности",
  "Controlled Clinical Studies Pertinent to the Claimed Indication": "Контролируемые клинические исследования по заявленному показанию",
  "Uncontrolled Clinical Studies": "Неконтролируемые клинические исследования",
  "Reports of Analyses of Data from More than One Study": "Отчеты об анализе данных более чем одного исследования",
  "Other Clinical Study Reports": "Другие отчеты о клинических исследованиях",
  "Reports of Post-Marketing Experience": "Отчеты о пострегистрационном опыте применения",
  "Case Report Forms and Individual Patient Listings": "Формы регистрационных карт (CRF) и индивидуальные списки пациентов"
};

// Fallback pattern translator for any compound titles
function autoTranslateTitle(title) {
  if (titleTranslations[title]) return titleTranslations[title];

  let res = title;

  // Common replacements
  res = res.replace(/Summary of /g, "Резюме ");
  res = res.replace(/Brief description of /g, "Краткое описание ");
  res = res.replace(/Reports of /g, "Отчеты об ");
  res = res.replace(/Study Reports/g, "Отчеты об исследованиях");
  res = res.replace(/Drug Substance/g, "Фармацевтическая субстанция");
  res = res.replace(/Active Substance/g, "Активная субстанция");
  res = res.replace(/Medicinal Product/g, "Лекарственный препарат");
  res = res.replace(/Drug Product/g, "Лекарственный препарат");
  res = res.replace(/Manufacturing Process/g, "Производственный процесс");
  res = res.replace(/Quality Control/g, "Контроль качества");
  res = res.replace(/Container Closure System/g, "Упаковочная система / контейнер");
  res = res.replace(/Analytical Procedures/g, "Аналитические методики");
  res = res.replace(/Reference Standards/g, "Стандартные образцы");
  res = res.replace(/Excipients/g, "Вспомогательные вещества");
  res = res.replace(/Excipient/g, "Вспомогательное вещество");
  res = res.replace(/Literature References/g, "Литературные источники");
  res = res.replace(/Clinical Studies/g, "Клинические исследования");
  res = res.replace(/Pharmacokinetics/g, "Фармакокинетика");
  res = res.replace(/Pharmacology/g, "Фармакология");
  res = res.replace(/Toxicology/g, "Токсикология");
  res = res.replace(/Safety/g, "Безопасность");
  res = res.replace(/Efficacy/g, "Эффективность");
  res = res.replace(/Stability/g, "Стабильность");

  return res;
}

const regex = /id:\s*"([^"]+)",(?:[\s\S]*?)title:\s*"([^"]+)"/g;
let match;
const newEnTitles = {};
const newRuTitles = {};

while ((match = regex.exec(ctdContent)) !== null) {
  const rawId = match[1];
  const title = match[2];
  const safeKey = rawId.replace(/[\.\-]/g, "_");

  newEnTitles[safeKey] = title;
  newRuTitles[safeKey] = autoTranslateTitle(title);
}

// Add root module keys
newEnTitles["m1"] = "Administrative Information & Prescribing Information";
newRuTitles["m1"] = "Административная информация и информация о назначении";

newEnTitles["m2"] = "CTD Summaries";
newRuTitles["m2"] = "Резюме CTD";

newEnTitles["m3"] = "Quality (Chemical, Pharmaceutical and Biological Information)";
newRuTitles["m3"] = "Качество (Химическая, фармацевтическая и биологическая информация)";

newEnTitles["m4"] = "Non-Clinical Study Reports";
newRuTitles["m4"] = "Отчеты о доклинических исследованиях";

newEnTitles["m5"] = "Clinical Study Reports";
newRuTitles["m5"] = "Отчеты о клинических исследованиях";

enJson.documentTitles = newEnTitles;
ruJson.documentTitles = newRuTitles;

fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2), "utf-8");
fs.writeFileSync(ruJsonPath, JSON.stringify(ruJson, null, 2), "utf-8");

console.log("Successfully updated en.json and ru.json documentTitles with full Russian translations!");
