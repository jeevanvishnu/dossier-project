const fs = require("fs");
const path = require("path");

const ctdPath = path.join(__dirname, "../frontend/app/constants/ctdStructure.ts");
const enJsonPath = path.join(__dirname, "../frontend/messages/en.json");
const ruJsonPath = path.join(__dirname, "../frontend/messages/ru.json");

const ctdContent = fs.readFileSync(ctdPath, "utf-8");
const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));

const enOldTitles = enJson.documentTitles || {};
const ruOldTitles = ruJson.documentTitles || {};

const titleToRu = new Map();
for (const key of Object.keys(enOldTitles)) {
  const enTitle = enOldTitles[key];
  const ruTitle = ruOldTitles[key];
  if (enTitle && ruTitle) {
    titleToRu.set(enTitle.trim(), ruTitle);
  }
}

const newEnTitles = {};
const newRuTitles = {};

const regex = /id:\s*"([^"]+)",(?:[\s\S]*?)title:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(ctdContent)) !== null) {
  const rawId = match[1];
  const title = match[2];
  
  const safeKey = rawId.replace(/[\.\-]/g, "_");
  newEnTitles[safeKey] = title;
  
  const ruTitle = titleToRu.get(title) || title;
  newRuTitles[safeKey] = ruTitle;
}

// Add the m1, m2, etc manually since they might have different formats
newEnTitles["m1"] = "Administrative Information & Prescribing Information";
newRuTitles["m1"] = titleToRu.get(newEnTitles["m1"]) || newEnTitles["m1"];

newEnTitles["m2"] = "CTD Summaries";
newRuTitles["m2"] = titleToRu.get(newEnTitles["m2"]) || newEnTitles["m2"];

newEnTitles["m3"] = "Quality (Chemical, Pharmaceutical and Biological Information)";
newRuTitles["m3"] = titleToRu.get(newEnTitles["m3"]) || newEnTitles["m3"];

newEnTitles["m4"] = "Non-Clinical Study Reports";
newRuTitles["m4"] = titleToRu.get(newEnTitles["m4"]) || newEnTitles["m4"];

newEnTitles["m5"] = "Clinical Study Reports";
newRuTitles["m5"] = titleToRu.get(newEnTitles["m5"]) || newEnTitles["m5"];

enJson.documentTitles = newEnTitles;
ruJson.documentTitles = newRuTitles;

fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2), "utf-8");
fs.writeFileSync(ruJsonPath, JSON.stringify(ruJson, null, 2), "utf-8");

console.log("Updated en.json and ru.json with new documentTitles!");
