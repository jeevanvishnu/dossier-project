import { getRussianDocName } from "../services/eaeu-manifest.service";

async function runTests() {
  console.log("Running eaeu-manifest formatting regression tests...");

  // Test 1: Cyrillic canonical label -> ". " separator
  // For docCode 01001, getCanonicalDocLabelByCode("01001") returns "Сопроводительное письмо Сорбит" (Cyrillic)
  const cyrillicTest = getRussianDocName("test_original.pdf", "01001", "1.0");
  if (cyrillicTest !== "1.0. Сопроводительное письмо Сорбит.pdf") {
    console.error(`❌ FAILED: Expected '1.0. Сопроводительное письмо Сорбит.pdf', got '${cyrillicTest}'`);
    process.exit(1);
  }
  console.log("✅ PASS: Cyrillic canonical label correctly uses '. ' separator.");

  // Test 2: Latin/English canonical label -> " " separator
  // For docCode 01013, getCanonicalDocLabelByCode("01013") returns "Information on registration in other countries" (Latin)
  const latinTest = getRussianDocName("test_original.pdf", "01013", "1.4.1");
  if (latinTest !== "1.4.1 Information on registration in other countries.pdf") {
    console.error(`❌ FAILED: Expected '1.4.1 Information on registration in other countries.pdf', got '${latinTest}'`);
    process.exit(1);
  }
  console.log("✅ PASS: Latin canonical label correctly uses ' ' separator.");

  // Test 3: Bypass logic (Cyrillic originalName) -> unmodified
  // If the user already uploaded it with Cyrillic, it shouldn't apply standard suffix rules
  const bypassTest = getRussianDocName("1.0. Сопроводительное письмо Сорбит.pdf", "01001", "1.0");
  if (bypassTest !== "1.0. Сопроводительное письмо Сорбит.pdf") {
    console.error(`❌ FAILED: Expected '1.0. Сопроводительное письмо Сорбит.pdf' (bypass), got '${bypassTest}'`);
    process.exit(1);
  }
  console.log("✅ PASS: Cyrillic originalName bypasses formatting correctly.");

  console.log("\nAll regression tests passed successfully.");
  process.exit(0);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
