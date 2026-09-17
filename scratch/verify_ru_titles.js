const fs = require("fs");
const path = require("path");

const ruJsonPath = path.join(__dirname, "../frontend/messages/ru.json");
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));
const ruTitles = ruJson.documentTitles || {};

const englishWordsRegex = /\b(Introduction|Pharmacology|Pharmacokinetics|Toxicology|written|tabulated|summary|overview|report|reports|study|studies|draft|mock-up|mock-ups|product|quality|control|manufacturing|active|substance|excipients|safety|efficacy|stability|clinical|non-clinical|data|information|documents|certificate|license|letter)\b/i;

const flagged = [];

for (const [key, val] of Object.entries(ruTitles)) {
  if (englishWordsRegex.test(val)) {
    flagged.push({ key, val });
  }
}

console.log(`Total keys in documentTitles: ${Object.keys(ruTitles).length}`);
console.log(`Keys still containing English words: ${flagged.length}`);

if (flagged.length > 0) {
  console.log("Flagged examples:", flagged.slice(0, 20));
}
