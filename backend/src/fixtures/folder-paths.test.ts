import fs from 'fs';
import path from 'path';
import { CTD_DOC_CODES } from '../constants/ctdDocCodes';

export function runFolderPathsTest() {
  console.log('Running folder paths verification test...');

  const xmlFilePath = path.join(__dirname, 'sorbit_extracted.xml');
  if (!fs.existsSync(xmlFilePath)) {
    console.error('ERROR: sorbit_extracted.xml fixture not found.');
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(xmlFilePath, 'utf8');

  let fails = 0;
  let total = 0;

  for (const entry of CTD_DOC_CODES) {
    const regex = new RegExp('<hcsdo:DrugRegistrationDocCode codeListId="2058">' + entry.docCode + '</hcsdo:DrugRegistrationDocCode>[\\s\\S]*?<hcsdo:DrugAttributeEnumText DrugAttributeKindEnumCode="05">([^<]+)</hcsdo:DrugAttributeEnumText>');
    const match = xmlContent.match(regex);
    if (match) {
      total++;
      const fullPath = match[1];
      const lastSlash = fullPath.lastIndexOf('\\');
      const realFolderPath = lastSlash !== -1 ? fullPath.substring(0, lastSlash) : '';

      if (realFolderPath !== entry.folderPath) {
        console.error(`FAIL: ${entry.docCode} (node ${entry.nodeId})`);
        console.error(`  Expected (from XML): ${realFolderPath}`);
        console.error(`  Actual (in table)  : ${entry.folderPath}`);
        fails++;
      } else {
        console.log(`PASS: ${entry.docCode} == ${entry.folderPath}`);
      }
    }
  }

  console.log(`\nTotal verified: ${total}`);
  console.log(`Total fails: ${fails}`);

  if (fails > 0) {
    console.error(`\nTest Failed: ${fails} mismatches found between CTD_DOC_CODES and the reference XML.`);
    process.exit(1);
  } else {
    console.log(`\nTest Passed: All ${total} entries match the reference XML exactly.`);
  }
}

if (require.main === module) {
  runFolderPathsTest();
}
