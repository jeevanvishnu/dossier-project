import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesDir = path.resolve(__dirname, "../messages");
const enPath = path.join(messagesDir, "en.json");
const ruPath = path.join(messagesDir, "ru.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
const ru = JSON.parse(fs.readFileSync(ruPath, "utf-8"));

function getKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const ruKeys = new Set(getKeys(ru));

let missing = false;

for (const key of enKeys) {
  if (!ruKeys.has(key)) {
    console.error(`❌ Key missing in ru.json: ${key}`);
    missing = true;
  }
}

for (const key of ruKeys) {
  if (!enKeys.has(key)) {
    console.error(`❌ Key missing in en.json: ${key}`);
    missing = true;
  }
}

if (missing) {
  console.error("\n❌ i18n Key validation failed! Some keys are missing across locales.");
  process.exit(1);
} else {
  console.log(`\n✅ i18n Key Validation Passed! (${enKeys.size} keys synchronized across en.json and ru.json)`);
}
