/**
 * Parser-fidelity benchmark for brooks-lint.
 *
 * Reads evals/benchmark-corpus.json — a FROZEN corpus of real, model-generated
 * brooks-lint reports, each paired with an independently graded ground-truth
 * finding inventory. Runs the shipped report-parse.mjs / sarif.mjs against every
 * report and measures how faithfully the parser reproduces what the report says.
 *
 * Because the parser is deterministic and the corpus is frozen, the numbers are
 * exactly reproducible: anyone can re-run `npm run benchmark` and get the same
 * result. This benchmarks the PARSER (the SARIF/CI-gate plumbing), not the model
 * — model quality is measured separately by evals/evals.json (npm run evals:live).
 *
 * Exit code: 0 if every report is parsed faithfully and emits valid SARIF; 1 otherwise.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFindings, countFindings, RISK_CATALOG } from "./report-parse.mjs";
import { reportToSarif } from "./sarif.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const VALID_LEVELS = new Set(["error", "warning", "note"]);
const KNOWN_CODES = new Set(Object.keys(RISK_CATALOG));

/** Keep only catalogued risk codes (duplicates preserved), uppercased. */
function validCodes(codes) {
  return (codes ?? [])
    .map((c) => String(c).toUpperCase().trim())
    .filter((c) => KNOWN_CODES.has(c));
}

/** Count occurrences of each code → { code: n }. */
function multiset(codes) {
  const m = {};
  for (const c of codes) m[c] = (m[c] ?? 0) + 1;
  return m;
}

/**
 * Score one corpus sample: compare the parser's output against the graded truth.
 * Returns severity-count match, SARIF validity, and risk-code tp/fp/fn.
 */
export function scoreReport(sample) {
  const pf = parseFindings(sample.report);
  const pc = countFindings(sample.report);
  const t = sample.truth;
  const countMatch = pc.critical === t.critical && pc.warning === t.warning && pc.suggestion === t.suggestion;

  // Compare codes per-finding (multiset), so a dropped duplicate-code finding
  // is caught, not masked by set-level de-duplication.
  const pCodes = validCodes(pf.map((f) => f.riskCode));
  const tCodes = validCodes(t.codes);
  const pm = multiset(pCodes), tm = multiset(tCodes);
  let tp = 0, fp = 0, fn = 0;
  for (const code of new Set([...Object.keys(pm), ...Object.keys(tm)])) {
    const p = pm[code] ?? 0, q = tm[code] ?? 0;
    tp += Math.min(p, q);
    fp += Math.max(0, p - q);
    fn += Math.max(0, q - p);
  }

  const sarif = reportToSarif(sample.report, { mode: sample.mode, toolVersion: "bench" });
  const ruleIds = new Set(sarif.runs[0].tool.driver.rules.map((r) => r.id));
  const results = sarif.runs[0].results;
  const sarifValid = sarif.version === "2.1.0"
    && results.length === pf.length
    && results.every((r) => VALID_LEVELS.has(r.level))
    && results.every((r) => ruleIds.has(r.ruleId));

  return { id: sample.id, mode: sample.mode, isFP: sample.isFP, countMatch, sarifValid, tp, fp, fn,
    truth: `${t.critical}/${t.warning}/${t.suggestion}`, parser: `${pc.critical}/${pc.warning}/${pc.suggestion}`,
    truthCodes: [...new Set(tCodes)].sort(), parserCodes: [...new Set(pCodes)].sort() };
}

/**
 * Score every sample in a corpus and aggregate corpus-wide totals:
 * exact severity-count matches, SARIF validity, and code precision/recall.
 */
export function summarize(corpus) {
  const rows = corpus.samples.map(scoreReport);
  const n = rows.length;
  const exact = rows.filter((r) => r.countMatch).length;
  const sarifOk = rows.filter((r) => r.sarifValid).length;
  const tp = rows.reduce((s, r) => s + r.tp, 0);
  const fp = rows.reduce((s, r) => s + r.fp, 0);
  const fn = rows.reduce((s, r) => s + r.fn, 0);
  return {
    rows, n, exact, sarifOk, tp, fp, fn,
    precision: tp / (tp + fp || 1),
    recall: tp / (tp + fn || 1),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const corpus = JSON.parse(readFileSync(path.join(root, "evals/benchmark-corpus.json"), "utf8"));
  const s = summarize(corpus);

  console.log("\nBrooks-Lint Parser-Fidelity Benchmark");
  console.log("=====================================");
  console.log(`Corpus: ${s.n} real model-generated reports (frozen) across ${new Set(s.rows.map((r) => r.mode)).size} modes`);
  console.table(s.rows.map((r) => ({
    id: r.id, mode: r.mode, FP: r.isFP ? "Y" : "",
    truth: r.truth, parser: r.parser, countMatch: r.countMatch,
    codes: r.parserCodes.join(",") || "-", sarif: r.sarifValid ? "ok" : "BAD",
  })));
  console.log(`Exact severity-count match : ${s.exact}/${s.n} (${(100 * s.exact / s.n).toFixed(1)}%)`);
  console.log(`Risk-code precision        : ${(100 * s.precision).toFixed(1)}%   recall: ${(100 * s.recall).toFixed(1)}%   (tp=${s.tp} fp=${s.fp} fn=${s.fn})`);
  console.log(`SARIF 2.1.0 validity       : ${s.sarifOk}/${s.n}`);

  if (corpus.strictness?.length) {
    console.log("\nStrictness preset scoring (recorded single-run, fixed 2C/3W/1S findings):");
    console.table(corpus.strictness.map((x) => ({ preset: x.preset, expected: x.expected, modelScore: x.score, match: x.score === x.expected, leadsWithTopFixes: x.leadsWithTopFixes })));
  }

  const ok = s.exact === s.n && s.sarifOk === s.n;
  console.log(`\n${ok ? "PASS" : "FAIL"} — parser fidelity ${ok ? "100%" : "below threshold"} on the frozen corpus.`);
  if (!ok) process.exit(1);
}
