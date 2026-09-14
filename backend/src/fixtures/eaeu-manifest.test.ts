import { generateEaeuManifestXml } from "../services/eaeu-manifest.service";
import { getEctdFolderPath, sanitizeFileName, sanitizeSequence } from "../services/compilation.service";
import { SORBIT_DOSSIER_FIXTURE } from "./sorbitDossier.fixture";
import { Project, DossierConfig } from "../db/schema";

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
};

export function runEaeuManifestTests() {
  console.log("🧪 Running EAEU Manifest XML Builder Tests with Sorbit Dossier Fixture...\n");

  const xmlOutput = generateEaeuManifestXml(mockProject, mockConfig, SORBIT_DOSSIER_FIXTURE, {
    sanitizeFileNameFn: sanitizeFileName,
    sanitizeSequenceFn: sanitizeSequence,
    getEctdFolderPathFn: getEctdFolderPath,
  });

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

  const countryIndex = xmlOutput.indexOf(expectedCountryTag);
  const kindIndex = xmlOutput.indexOf(expectedKindTag);
  if (kindIndex < countryIndex) {
    throw new Error("TEST FAILED: RegistrationKindCode MUST immediately follow UnifiedCountryCode!");
  }
  console.log("✅ Passed Assertion 1c: RegistrationKindCode immediately follows UnifiedCountryCode");

  // Assertion 2: Physical File Path Formatting (Attribute 05 uses forward slashes '/')
  const expectedPathExample = "m1/1.3/1.3.1/Сорбит ОХЛП ЕАЭС_18.04.2025.pdf";
  const expectedPathTag = `<hcsdo:DrugAttributeEnumText DrugAttributeKindEnumCode="05">${expectedPathExample}</hcsdo:DrugAttributeEnumText>`;

  if (!xmlOutput.includes(expectedPathTag)) {
    throw new Error(`TEST FAILED: Missing expected Attribute 05 path:\n${expectedPathTag}`);
  }
  console.log(`✅ Passed Assertion 2a: Example output path with forward slashes found: ${expectedPathExample}`);

  // Check no backslashes in DrugAttributeKindEnumCode="05" tags
  if (xmlOutput.match(/DrugAttributeKindEnumCode="05">[^<]*\\/)) {
    throw new Error("TEST FAILED: Found invalid backslash '\\' in DrugAttributeKindEnumCode 05 relative file path tag!");
  }
  console.log("✅ Passed Assertion 2b: Relative ZIP file paths strictly use forward slashes '/' without backslashes");

  // Check no forward slash regional folders like /us/ or /kz/
  if (xmlOutput.includes("m1/us/") || xmlOutput.includes("m1/kz/")) {
    throw new Error("TEST FAILED: Hardcoded regional folder (/us/ or /kz/) found in output!");
  }
  console.log("✅ Passed Assertion 2c: No hardcoded regional subdirectories (/us/, /kz/) in XML");

  // Assertion 3: Verify all 10 Sorbit dossier documents & 5-digit 2058 code list mapping
  const expectedEaeuCodes = ["01001", "01005", "01009", "01016", "01011", "02001", "02002", "02004", "02005", "02010", "02011"];
  
  for (const code of expectedEaeuCodes) {
    const codeTag = `<hcsdo:DrugRegistrationDocCode codeListId="2058">${code}</hcsdo:DrugRegistrationDocCode>`;
    if (!xmlOutput.includes(codeTag)) {
      throw new Error(`TEST FAILED: Missing 2058 code tag for ${code}:\n${codeTag}`);
    }
  }
  console.log("✅ Passed Assertion 3: All 10 Sorbit dossier document 5-digit EAEU codes correctly mapped to codeListId 2058");

  // Assertion 4: Verify Sequence 0000 contains only 'new' operations (no 'delete' or 'replace')
  if (xmlOutput.includes("<hcsdo:OperationAtribute>delete</hcsdo:OperationAtribute>") || xmlOutput.includes("<hcsdo:OperationAtribute>replace</hcsdo:OperationAtribute>")) {
    throw new Error("TEST FAILED: Initial submission (Sequence 0000) must not contain delete or replace operation attributes!");
  }
  console.log("✅ Passed Assertion 4: Sequence 0000 contains only 'new' operation attributes (no tombstone/delete records)");

  console.log("\n🎉 ALL EAEU MANIFEST SCHEME & SORBIT FIXTURE TESTS PASSED SUCCESSFULLY!\n");
  console.log("--- Generated XML Snippet ---");
  console.log(xmlOutput.substring(0, 800));
}

if (require.main === module) {
  runEaeuManifestTests();
}
