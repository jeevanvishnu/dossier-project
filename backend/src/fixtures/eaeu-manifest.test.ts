import { getRussianDocName } from "../services/eaeu-manifest.service";
import { CTD_DOC_CODES } from "../constants/ctdDocCodes";

async function runTests() {
  console.log("Running eaeu-manifest filename-formatting regression tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(label: string, actual: string, expected: string) {
    if (actual === expected) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      console.error(`         Expected : '${expected}'`);
      console.error(`         Got      : '${actual}'`);
      failed++;
    }
  }

  // ─── GROUP 1: Separator logic ─────────────────────────────────────────────
  // Cyrillic canonical labels → ". " separator (period + space)
  // Latin/English canonical labels → " " separator (space only, no period)
  //
  // Reference: sorbit_.xml DocName entries confirmed by the filer.
  // ─────────────────────────────────────────────────────────────────────────

  console.log("GROUP 1 — Separator: Cyrillic '. ' vs. Latin ' '");

  // 01001 — Cyrillic label "Сопроводительное письмо Сорбит" → ". "
  assert(
    "01001 (Cyrillic) uses '. ' separator",
    getRussianDocName("test_original.pdf", "01001", "1.0"),
    "1.0. Сопроводительное письмо Сорбит.pdf"
  );

  // 06001 — Cyrillic label "Отчеты о клинических исследованиях" → ". "
  assert(
    "06001 (Cyrillic) uses '. ' separator",
    getRussianDocName("test_original.pdf", "06001", "1.9.1"),
    "1.9.1. Отчеты о клинических исследованиях.pdf"
  );

  // 01013 — English label "Information on registration in other countries" → " " (NO period)
  assert(
    "01013 (English) uses ' ' separator — NO period",
    getRussianDocName("test_original.pdf", "01013", "1.4.1"),
    "1.4.1 Information on registration in other countries.pdf"
  );

  // 01015 — English label "Addetional trade name" → " " (NO period)
  // This is the REGRESSED case: was incorrectly producing "1.8.1. Addetional trade name.pdf"
  assert(
    "01015 (English) uses ' ' separator — NO period [regression]",
    getRussianDocName("test_original.pdf", "01015", "1.8.1"),
    "1.8.1 Addetional trade name.pdf"
  );

  // ─── GROUP 2: Bypass — node-prefix already present ───────────────────────
  // If the user uploaded a file already named "1.0. Custom.pdf", preserve it verbatim.
  // ─────────────────────────────────────────────────────────────────────────

  console.log("\nGROUP 2 — Bypass: node-prefix already in filename");

  assert(
    "01001 with correct node prefix → preserved verbatim",
    getRussianDocName("1.0. Сопроводительное письмо Сорбит.pdf", "01001", "1.0"),
    "1.0. Сопроводительное письмо Сорбит.pdf"
  );

  assert(
    "01013 with correct node prefix → preserved verbatim",
    getRussianDocName("1.4.1 Information on registration in other countries.pdf", "01013", "1.4.1"),
    "1.4.1 Information on registration in other countries.pdf"
  );

  // ─── GROUP 3: Bypass — exact canonical-label filename ────────────────────
  // 13028 — Cyrillic label AND user's originalName stem matches canonical label exactly.
  // Reference: sorbit_.xml shows "НД ЕАЭС для Сорбит 2024 Финальная версия.pdf" — NO prefix.
  // This is the new bug: was producing "1.5. НД ЕАЭС для Сорбит 2024 Финальная версия.pdf"
  // ─────────────────────────────────────────────────────────────────────────

  console.log("\nGROUP 3 — Bypass: exact-label filename preserved without prefix [regression]");

  assert(
    "13028 — exact canonical label as filename → no prefix at all",
    getRussianDocName("НД ЕАЭС для Сорбит 2024 Финальная версия.pdf", "13028", "1.5"),
    "НД ЕАЭС для Сорбит 2024 Финальная версия.pdf"
  );

  // Verify the exact-label bypass doesn't over-fire on docs where the user
  // uploaded under a different name (should still get normal prefix treatment).
  assert(
    "01001 with generic filename still gets node prefix",
    getRussianDocName("cover_letter.pdf", "01001", "1.0"),
    "1.0. Сопроводительное письмо Сорбит.pdf"
  );

  // ─── GROUP 4: Fabricated doc code guard ──────────────────────────────────

  console.log("\nGROUP 4 — Fabricated doc codes absent from CTD_DOC_CODES");

  const fabricatedCodes = ["03004", "03005", "04003", "12002", "12003", "12004", "12005", "12006", "12007", "12008"];
  const badCodesFound = CTD_DOC_CODES.filter(entry => fabricatedCodes.includes(entry.docCode));
  if (badCodesFound.length > 0) {
    console.error(`  ❌ FAIL: Fabricated doc codes found in CTD_DOC_CODES: ${badCodesFound.map(e => e.docCode).join(", ")}`);
    failed++;
  } else {
    console.log("  ✅ PASS: Fabricated doc codes correctly absent from CTD_DOC_CODES.");
    passed++;
  }

  // ─── Summary ─────────────────────────────────────────────────────────────

  const bar = "─".repeat(60);
  console.log(`\n${bar}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error("\n❌ Regression test suite FAILED.\n");
    process.exit(1);
  } else {
    console.log("\n✅ All regression tests passed.\n");
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
