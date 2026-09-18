import { compileEctdPackage } from "../services/compilation.service";
import { Project, DossierConfig, ProjectDocument } from "../db/schema";
import * as crypto from "crypto";

const mockProject: Project = {
  id: 1,
  projectCode: "PRJ-TEST",
  productName: "TestProduct",
  dosageForm: "Solution",
  productType: "Generic",
  manufacturer: "Co",
  mahHolder: "Co",
  responsibleUser: "User",
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
  applicationNumber: "123",
  dossierSequence: "0000",
  isDossierSaved: true,
  dossierDetails: null,
};

async function runTests() {
  console.log("🧪 Running Compilation Checksum Test...\n");
  const doc1: ProjectDocument = {
    id: 101,
    projectId: 1,
    nodeId: "1.1",
    docCode: "25001",
    docType: "25001",
    originalName: "test1.pdf",
    sequence: "0000",
    uploadedAt: new Date(),
    status: "active",
    operation: "new",
    issueDate: null,
    expirationDate: null,
    imageKitUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    imageKitFileId: "dummy1",
    fileSize: 1024,
    md5Checksum: crypto.createHash('md5').update("1").digest("hex"),
  };

  const doc2: ProjectDocument = {
    id: 102,
    projectId: 1,
    nodeId: "1.1",
    docCode: "25001",
    docType: "25001",
    originalName: "test2.pdf",
    sequence: "0000",
    uploadedAt: new Date(),
    status: "active",
    operation: "new",
    issueDate: null,
    expirationDate: null,
    imageKitUrl: "https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_PDF.pdf",
    imageKitFileId: "dummy2",
    fileSize: 102400,
    md5Checksum: crypto.createHash('md5').update("2").digest("hex"),
  };

  const result1 = await compileEctdPackage(mockProject, mockConfig, [doc1]);
  const result2 = await compileEctdPackage(mockProject, mockConfig, [doc2]);

  if (result1.zipChecksum === result2.zipChecksum) {
    throw new Error(`TEST FAILED: ZIP checksums match! ${result1.zipChecksum}`);
  }
  if (result1.xmlChecksum === result2.xmlChecksum) {
    throw new Error(`TEST FAILED: XML checksums match! ${result1.xmlChecksum}`);
  }

  console.log("✅ Passed: ZIP checksums are distinct.");
  console.log("✅ Passed: XML checksums are distinct.");
  console.log("\n🎉 ALL CHECKSUM VERIFICATION TESTS PASSED SUCCESSFULLY!\n");
}

if (require.main === module) {
  runTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
