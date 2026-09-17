const fs = require("fs");
const path = require("path");

const ruJsonPath = path.join(__dirname, "../frontend/messages/ru.json");
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));
const ruTitles = ruJson.documentTitles || {};

const ctdPath = path.join(__dirname, "../frontend/app/constants/ctdStructure.ts");
const ctdContent = fs.readFileSync(ctdPath, "utf-8");

const regex = /id:\s*"([^"]+)",(?:[\s\S]*?)title:\s*"([^"]+)"/g;
let match;
const keyToRawId = {};
const keyToEnTitle = {};
while ((match = regex.exec(ctdContent)) !== null) {
  const rawId = match[1];
  const title = match[2];
  const safeKey = rawId.replace(/[\.\-]/g, "_");
  keyToRawId[safeKey] = rawId;
  keyToEnTitle[safeKey] = title;
}

const englishWordsRegex = /\b(Introduction|Pharmacology|Pharmacokinetics|Toxicology|written|tabulated|summary|overview|report|reports|study|studies|draft|mock-up|mock-ups|product|quality|control|manufacturing|active|substance|excipients|safety|efficacy|stability|clinical|non-clinical|data|information|documents|certificate|license|letter|nomenclature|structure|properties|description|materials|process|validation|evaluation|development|impurities|specification|specifications|procedures|batch|analyses|justification|reference|standards|container|closure|system|protocol|commitment|formulation|overages|physicochemical|biological|attributes|compatibility|formula|origin|novel|characterisation|facilities|equipment|adventitious|agents|regional|literature|references|tabular|listing|biopharmaceutic|bioavailability|bioequivalence|correlation|bioanalytical|methods|pertinent|biomaterials|plasma|protein|binding|hepatic|metabolism|interaction|human|subject|tolerability|intrinsic|extrinsic|factor|population|pharmacodynamic|controlled|claimed|indication|uncontrolled|analyses|post-marketing|experience|case|individual|patient|listings)\b/i;

const flagged = [];

for (const [key, val] of Object.entries(ruTitles)) {
  if (englishWordsRegex.test(val)) {
    flagged.push({ key, rawId: keyToRawId[key], enTitle: keyToEnTitle[key], currentRu: val });
  }
}

console.log(`Total flagged: ${flagged.length}`);
fs.writeFileSync(path.join(__dirname, "flagged_54.json"), JSON.stringify(flagged, null, 2), "utf-8");
