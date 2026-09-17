async function translateText(text) {
  if (!text || typeof text !== "string") return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const data = await res.json();
  if (data && data[0]) {
    return data[0].map((item) => item[0]).join("");
  }
  return text;
}

async function main() {
  const result = await translateText("Welcome to our pharmaceutical dossier platform!");
  console.log("Translation test:", result);
}

main();
