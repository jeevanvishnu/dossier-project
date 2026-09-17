async function translateText(text) {
  if (!text || typeof text !== "string") return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.responseData && data.responseData.translatedText) {
    return data.responseData.translatedText;
  }
  return text;
}

async function main() {
  const result = await translateText("Welcome to our pharmaceutical dossier platform!");
  console.log("MyMemory translation test:", result);
}

main();
