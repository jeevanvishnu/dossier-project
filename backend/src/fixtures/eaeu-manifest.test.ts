import { generateEaeuManifestXml, mapNodeIdToEaeuCode } from "../services/eaeu-manifest.service";
import { getEctdFolderPath, sanitizeFileName, sanitizeSequence } from "../services/compilation.service";
import { SORBIT_DOSSIER_FIXTURE } from "./sorbitDossier.fixture";
import { Project, DossierConfig, ProjectDocument } from "../db/schema";
import { CTD_DOC_CODES, getCtdDocCodeEntry } from "../constants/ctdDocCodes";

const mockProject: Project = {
  id: 1,
  projectCode: "PRJ-SORBIT-001",
  productName: "Сорбит ЕАЭС",
  dosageForm: "Solution",
  productType: "Generic",
  manufacturer: "Pharma Co",
  mahHolder: "MAH Co",
  responsibleUser: "Engineer",
  tariff: "Standard",
  additionalFeature: null,
  status: "Active",
  isProjectSaved: true,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockConfig: DossierConfig = {
  id: 1,
  projectId: 1,
  submissionCountry: "KZ",
  role: "Applicant",
  procedureType: "National",
  typeOfProcedure: "Registration",
  applicationNumber: "KZ-2025-001",
  dossierSequence: "Sequence 0000",
  isDossierSaved: true,
  dossierDetails: null,
};

export function runEaeuManifestTests() {
  console.log("🧪 Running EAEU Manifest XML Builder Tests with Sorbit Dossier Fixture...\n");

  const xmlOutput = generateEaeuManifestXml(mockProject, mockConfig, SORBIT_DOSSIER_FIXTURE, {
    sanitizeFileNameFn: sanitizeFileName,
    sanitizeSequenceFn: sanitizeSequence,
    getEctdFolderPathFn: getEctdFolderPath,
  });

  // Assertion 0: BOM and Namespaces
  if (!xmlOutput.startsWith("\uFEFF")) {
    throw new Error("TEST FAILED: XML output must start with UTF-8 BOM \\uFEFF");
  }
  console.log("✅ Passed Assertion 0a: XML starts with BOM \\uFEFF");

  const requiredAttributes = [
    'xmlns:doc="urn:EEC:R:DrugRegistrationDocDossierContentDetails:v1.1.0"',
    'xmlns:bdt="urn:EEC:M:BaseDataTypes:v0.4.11"',
    'xmlns:ccdo="urn:EEC:M:ComplexDataObjects:v0.4.11"',
    'xmlns:csdo="urn:EEC:M:SimpleDataObjects:v0.4.11"',
    'xmlns:hcsdo="urn:EEC:M:HC:SimpleDataObjects:v1.0.17"',
    'xmlns:hccdo="urn:EEC:M:HC:ComplexDataObjects:v1.0.17"',
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    'xsi:schemaLocation="urn:EEC:R:DrugRegistrationDocDossierContentDetails:v1.1.0 EEC_R_DrugRegistrationDocDossierContentDetails_v1.1.0.xsd"'
  ];

  for (const attr of requiredAttributes) {
    if (!xmlOutput.includes(attr)) {
      throw new Error(`TEST FAILED: Missing required root attribute: ${attr}`);
    }
  }
  console.log("✅ Passed Assertion 0b: All 7 required namespaces + schemaLocation present on root element");

  // Assertion 1: Root Metadata Nodes
  const expectedCountryTag = '<csdo:UnifiedCountryCode codeListId="P.CLS.019">KZ</csdo:UnifiedCountryCode>';
  const expectedKindTag = '<hcsdo:RegistrationKindCode>01</hcsdo:RegistrationKindCode>';
  
  if (!xmlOutput.includes(expectedCountryTag)) {
    throw new Error(`TEST FAILED: Missing exact UnifiedCountryCode tag:\n${expectedCountryTag}`);
  }
  console.log("✅ Passed Assertion 1a: UnifiedCountryCode strictly mapped to KZ with codeListId P.CLS.019");

  if (!xmlOutput.includes(expectedKindTag)) {
    throw new Error(`TEST FAILED: Missing mandatory RegistrationKindCode tag:\n${expectedKindTag}`);
  }
  console.log("✅ Passed Assertion 1b: RegistrationKindCode element present with value 01");

  // Assertion 2: Physical File Path Formatting (Attribute 05 uses backslashes '\', NO '/' characters, NO double '\\')
  const attr05Regex = /<hcsdo:DrugAttributeEnumText DrugAttributeKindEnumCode="05">([^<]+)<\/hcsdo:DrugAttributeEnumText>/g;
  let match: RegExpExecArray | null;
  let attr05Count = 0;

  while ((match = attr05Regex.exec(xmlOutput)) !== null) {
    attr05Count++;
    const pathValue = match[1];

    if (pathValue.includes("/")) {
      throw new Error(`TEST FAILED: Attribute 05 path contains invalid forward slash '/': "${pathValue}"`);
    }

    // Check for doubled backslash separator '\\' (matching two consecutive backslashes)
    if (/\\\\/.test(pathValue)) {
      throw new Error(`TEST FAILED: Attribute 05 path contains doubled backslash '\\\\': "${pathValue}"`);
    }

    // Extract directory folder portion before filename
    const lastSlashIndex = pathValue.lastIndexOf("\\");
    if (lastSlashIndex === -1) {
      throw new Error(`TEST FAILED: Attribute 05 path lacks folder hierarchy: "${pathValue}"`);
    }
    const folderPortion = pathValue.substring(0, lastSlashIndex);

    // Validate folder path depth regex: ^m\d(\\[^\\]+)*$
    if (!/^m\d(\\[^\\]+)*$/.test(folderPortion)) {
      throw new Error(`TEST FAILED: Folder path "${folderPortion}" does not match pattern ^m\\d(\\\\[^\\\\]+)*$`);
    }
  }

  if (attr05Count === 0) {
    throw new Error("TEST FAILED: No Attribute 05 paths found in XML output!");
  }
  console.log(`✅ Passed Assertion 2: All ${attr05Count} Attribute 05 paths use backslashes '\\', contain NO '/', NO doubled '\\\\', and match ^m\\d(\\\\[^\\\\]+)+$`);

  // Assertion 3: Verify mapNodeIdToEaeuCode and ctdDocCodes lookup
  const code16 = mapNodeIdToEaeuCode("1.6", "04001");
  if (code16 !== "04001") throw new Error(`TEST FAILED: Node 1.6 + docCode 04001 mapped to ${code16}`);

  const code182 = mapNodeIdToEaeuCode("1.8.2", "01017");
  if (code182 !== "01017") throw new Error(`TEST FAILED: Node 1.8.2 + docCode 01017 mapped to ${code182}`);

  const code32p = mapNodeIdToEaeuCode("3.2.P", "13001");
  if (code32p !== "13001") throw new Error(`TEST FAILED: Node 3.2.P + docCode 13001 mapped to ${code32p}`);

  let threwErrorOnUnresolvable = false;
  try {
    mapNodeIdToEaeuCode("invalid.node.id", "99999");
  } catch (err) {
    threwErrorOnUnresolvable = true;
  }
  if (!threwErrorOnUnresolvable) {
    throw new Error("TEST FAILED: mapNodeIdToEaeuCode did not throw error on unresolvable mapping!");
  }
  console.log("✅ Passed Assertion 3: mapNodeIdToEaeuCode maps docCodes (1.6, 1.8.2, 3.2.P) and throws error on unresolvable mappings");

  // Assertion 4: Verification of Doc Code 13001 with Cyrillic 'Р' in folder path
  const testDoc13001: ProjectDocument = {
    id: 99,
    projectId: 1,
    nodeId: "3.2.P",
    docCode: "13001",
    docType: "13001",
    originalName: "3.2.P.1 Quality Document.pdf",
    sequence: "0000",
    uploadedAt: new Date(),
    status: "active",
    operation: "new",
    issueDate: null,
    expirationDate: null,
    imageKitUrl: "https://ik.imagekit.io/ectd/test/doc13001.pdf",
    imageKitFileId: "file_13001",
    fileSize: 2048,
    md5Checksum: "13001md5checksum13001md5checksum13",
  };

  const xml13001 = generateEaeuManifestXml(mockProject, mockConfig, [testDoc13001], {
    sanitizeFileNameFn: sanitizeFileName,
    sanitizeSequenceFn: sanitizeSequence,
    getEctdFolderPathFn: getEctdFolderPath,
  });

  const expected13001Path = "m3\\3.2\\3.2.P\\3.2.Р.1\\3.2.P. Документация качества готового препарата (раздел 3.2.P.1).pdf";
  const containsCyrillicR = xml13001.includes("3.2.Р.1");

  if (!containsCyrillicR) {
    throw new Error(`TEST FAILED: Generated XML for 13001 missing Cyrillic 'Р' in path segment!\n${xml13001}`);
  }
  // Assertion 5: Regression test for docCode 25001 (Module 1 TOC sits directly in m1 without subfolder)
  const testDoc25001: ProjectDocument = {
    id: 100,
    projectId: 1,
    nodeId: "1.1",
    docCode: "25001",
    docType: "25001",
    originalName: "1.1 TOC module 1.pdf",
    sequence: "0000",
    uploadedAt: new Date(),
    status: "active",
    operation: "new",
    issueDate: null,
    expirationDate: null,
    imageKitUrl: "https://ik.imagekit.io/ectd/test/doc25001.pdf",
    imageKitFileId: "file_25001",
    fileSize: 1024,
    md5Checksum: "25001md5checksum25001md5checksum25",
  };

  const xml25001 = generateEaeuManifestXml(mockProject, mockConfig, [testDoc25001], {
    sanitizeFileNameFn: sanitizeFileName,
    sanitizeSequenceFn: sanitizeSequence,
    getEctdFolderPathFn: getEctdFolderPath,
  });

  const expected25001PathTag = `<hcsdo:DrugAttributeEnumText DrugAttributeKindEnumCode="05">m1\\1.1. Содержание регистрационного досье.pdf</hcsdo:DrugAttributeEnumText>`;
  if (xml25001.includes("m1\\1.1\\")) {
    throw new Error(`TEST FAILED: docCode 25001 must sit directly in m1 root without subfolder \\1.1\\!\n${xml25001}`);
  }
  if (!xml25001.includes("m1\\")) {
    throw new Error(`TEST FAILED: docCode 25001 missing m1\\ prefix!\n${xml25001}`);
  }
  console.log("✅ Passed Assertion 5: Doc Code 25001 sits directly in m1 root (m1\\<filename>) with NO \\1.1\\ subfolder");

  console.log("\n🎉 ALL EAEU MANIFEST SCHEME & VERIFICATION TESTS PASSED SUCCESSFULLY!\n");

  // Display required outputs for user inspection
  console.log("==========================================================================");
  console.log("📌 FINAL ctdDocCodes.ts ENTRIES FOR 12001, 13001, AND 01017 (Node 1.8.2)");
  console.log("==========================================================================");
  console.log("Doc Code 12001:", JSON.stringify(getCtdDocCodeEntry("12001"), null, 2));
  console.log("Doc Code 13001:", JSON.stringify(getCtdDocCodeEntry("13001"), null, 2));
  console.log("Doc Code 01017 (Node 1.8.2):", JSON.stringify(getCtdDocCodeEntry("01017"), null, 2));

  console.log("\n==========================================================================");
  console.log("📄 SAMPLE GENERATED XML BLOCK FOR DOC CODE 13001 (Node 3.2.P)");
  console.log("==========================================================================");
  const docDetailsStart = xml13001.indexOf("<hccdo:RegistrationDossierDocDetails>");
  const docDetailsEnd = xml13001.indexOf("</hccdo:RegistrationDossierDocDetails>") + "</hccdo:RegistrationDossierDocDetails>".length;
  console.log(xml13001.substring(docDetailsStart, docDetailsEnd));
  console.log("==========================================================================\n");
}

if (require.main === module) {
  runEaeuManifestTests();
}
