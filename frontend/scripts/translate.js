const fs = require("fs");
const path = require("path");

const enJsonPath = path.join(__dirname, "../messages/en.json");
const ruJsonPath = path.join(__dirname, "../messages/ru.json");

if (!fs.existsSync(enJsonPath) || !fs.existsSync(ruJsonPath)) {
  console.error("Could not find en.json or ru.json in frontend/messages!");
  process.exit(1);
}

const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));
const ruJson = JSON.parse(fs.readFileSync(ruJsonPath, "utf-8"));

async function translateText(text) {
  if (!text || typeof text !== "string") return text;
  // Handle interpolation templates like {name}, {count}, etc. by preserving them
  const placeholders = [];
  const maskedText = text.replace(/\{([^}]+)\}/g, (match) => {
    placeholders.push(match);
    return `__PH_${placeholders.length - 1}__`;
  });

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(maskedText)}&langpair=en|ru`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.responseData && data.responseData.translatedText) {
      let translated = data.responseData.translatedText;
      // Restore placeholders
      placeholders.forEach((ph, idx) => {
        translated = translated.replace(new RegExp(`__PH_${idx}__`, "g"), ph);
        translated = translated.replace(new RegExp(`__ PH_${idx} __`, "g"), ph);
        translated = translated.replace(new RegExp(`__PH_ ${idx} __`, "g"), ph);
      });
      return translated;
    }
  } catch (err) {
    console.warn(`Failed to translate "${text}":`, err.message);
  }
  return text;
}

async function syncAndTranslateObject(enObj, ruObj, pathPrefix = "") {
  let translatedCount = 0;

  for (const key of Object.keys(enObj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const enVal = enObj[key];
    const ruVal = ruObj[key];

    if (typeof enVal === "object" && enVal !== null && !Array.isArray(enVal)) {
      if (typeof ruObj[key] !== "object" || ruObj[key] === null) {
        ruObj[key] = {};
      }
      const count = await syncAndTranslateObject(enVal, ruObj[key], currentPath);
      translatedCount += count;
    } else if (typeof enVal === "string") {
      // Check if missing in ruObj or empty string or identical untranslated fallback
      if (ruVal === undefined || ruVal === null || ruVal === "") {
        console.log(`Translating missing key [${currentPath}]: "${enVal}"...`);
        const translated = await translateText(enVal);
        ruObj[key] = translated;
        console.log(`  -> Translated: "${translated}"`);
        translatedCount++;
        // Small delay to be polite to free translation service
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
  }

  return translatedCount;
}

async function run() {
  console.log("Checking for missing or untranslated keys in ru.json...");
  const count = await syncAndTranslateObject(enJson, ruJson);

  if (count > 0) {
    fs.writeFileSync(ruJsonPath, JSON.stringify(ruJson, null, 2), "utf-8");
    console.log(`\n🎉 Success! Auto-translated ${count} new key(s) into ru.json.`);
  } else {
    console.log("\n✅ All keys in ru.json are already up to date!");
  }
}

run();
