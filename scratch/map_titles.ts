import * as fs from "fs";
import { ECTD_FULL_TREE } from "../frontend/app/constants/ctdStructure";

const enJsonPath = "../frontend/messages/en.json";
const ruJsonPath = "../frontend/messages/ru.json";

const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));

const enOldTitles = enJson.documentTitles || {};
const ruOldTitles = ruJson.documentTitles || {};

// Map old English title -> old Russian title
const titleToRu = new Map<string, string>();
for (const key of Object.keys(enOldTitles)) {
  const enTitle = enOldTitles[key];
  const ruTitle = ruOldTitles[key];
  if (enTitle && ruTitle) {
    titleToRu.set(enTitle.trim(), ruTitle);
  }
}

const newEnTitles: Record<string, string> = {};
const newRuTitles: Record<string, string> = {};

function processNode(node: any) {
  const safeKey = "node_" + node.id.replace(/[\.\-]/g, "_");
  const enTitle = node.title.trim();
  newEnTitles[safeKey] = enTitle;
  
  const ruTitle = titleToRu.get(enTitle);
  if (ruTitle) {
    newRuTitles[safeKey] = ruTitle;
  } else {
    // If exact match fails, just leave it blank or english
    newRuTitles[safeKey] = enTitle; // Fallback
  }

  if (node.children) {
    node.children.forEach(processNode);
  }
}

ECTD_FULL_TREE.forEach(processNode);

enJson.documentTitles = newEnTitles;
ruJson.documentTitles = newRuTitles;

fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2), "utf-8");
fs.writeFileSync(ruJsonPath, JSON.stringify(ruJson, null, 2), "utf-8");

console.log("Updated en.json and ru.json with new documentTitles!");
