const fs = require("fs");
const path = require("path");

const ctdPath = path.join(__dirname, "../frontend/app/constants/ctdStructure.ts");
const ruJsonPath = path.join(__dirname, "../frontend/messages/ru.json");

const ctdContent = fs.readFileSync(ctdPath, "utf-8");
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));
const ruTitles = ruJson.documentTitles || {};

const regex = /id:\s*"([^"]+)",(?:[\s\S]*?)title:\s*"([^"]+)"/g;
let match;
const total = [];
const missingOrEnglish = [];

while ((match = regex.exec(ctdContent)) !== null) {
  const rawId = match[1];
  const title = match[2];
  const safeKey = rawId.replace(/[\.\-]/g, "_");
  const currentRu = ruTitles[safeKey];
  
  total.push({ rawId, safeKey, title, currentRu });
  
  // Check if currentRu contains latin characters [a-zA-Z] or missing
  if (!currentRu || /[a-zA-Z]/.test(currentRu)) {
    missingOrEnglish.push({ rawId, safeKey, title, currentRu });
  }
}

console.log(`Total CTD nodes: ${total.length}`);
console.log(`Missing or English in ru.json: ${missingOrEnglish.length}`);

fs.writeFileSync(
  path.join(__dirname, "english_nodes.json"),
  JSON.stringify(missingOrEnglish, null, 2),
  "utf-8"
);
