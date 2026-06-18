/**
 * Unit tests for parseFrontmatterBooks().
 *
 * Run:  node scripts/validate-repo.test.mjs
 *
 * Uses Node.js built-in assert — no test framework required.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { assembleSystemPrompt, VALID_MODES } from "./assemble-prompt.mjs";
import { readHistory, appendHistory, getTrend, normalizeMode, sparkline, renderHistory } from "./history.mjs";
import {
  parseFrontmatterBooks,
  countBookSections,
  countProductionRisks,
  countTestRisks,
  extractChangelogVersion,
  extractGuideStepLabels,
} from "./frontmatter.mjs";
import { extractRiskCodes, classify } from "./eval-utils.mjs";
import { parseFindings, countFindings, extractLocation } from "./report-parse.mjs";
import { reportToSarif } from "./sarif.mjs";
import { severityBreached, isRegression } from "./ci-gate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ── parseFrontmatterBooks ──────────────────────────────────────────────────

console.log("\nparseFrontmatterBooks");

test("returns book titles from valid frontmatter", () => {
  const text = [
    "---",
    "books:",
    "  - The Mythical Man-Month",
    "  - Code Complete",
    "---",
    "",
    "# Content",
  ].join("\n");
  assert.deepEqual(parseFrontmatterBooks(text), ["The Mythical Man-Month", "Code Complete"]);
});

test("returns null when file has no frontmatter", () => {
  const text = "# Source Coverage Matrix\n\nSome content here.";
  assert.equal(parseFrontmatterBooks(text), null);
});

test("returns null when frontmatter has no books key", () => {
  const text = "---\nversion: 1\nauthor: hyhmrright\n---\n\n# Content";
  assert.equal(parseFrontmatterBooks(text), null);
});

test("returns null when books list is empty", () => {
  const text = "---\nbooks:\n---\n\n# Content";
  assert.equal(parseFrontmatterBooks(text), null);
});

test("handles 4-space indentation", () => {
  const text = "---\nbooks:\n    - The Mythical Man-Month\n    - Code Complete\n---\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["The Mythical Man-Month", "Code Complete"]);
});

test("handles CRLF line endings", () => {
  const text = "---\r\nbooks:\r\n  - The Mythical Man-Month\r\n  - Code Complete\r\n---\r\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["The Mythical Man-Month", "Code Complete"]);
});

test("handles titles containing colons", () => {
  const text = "---\nbooks:\n  - Domain-Driven Design: Tackling Complexity\n---\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["Domain-Driven Design: Tackling Complexity"]);
});

test("strips surrounding whitespace from titles", () => {
  const text = "---\nbooks:\n  -   Padded Title   \n---\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["Padded Title"]);
});

test("handles single-book list", () => {
  const text = "---\nbooks:\n  - The Pragmatic Programmer\n---\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["The Pragmatic Programmer"]);
});

test("ignores non-books frontmatter keys before books:", () => {
  const text = "---\nname: brooks-lint\nbooks:\n  - Refactoring\n---\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["Refactoring"]);
});

test("ignores non-books frontmatter keys after books:", () => {
  const text = "---\nbooks:\n  - Refactoring\nversion: 1\n---\n";
  assert.deepEqual(parseFrontmatterBooks(text), ["Refactoring"]);
});

// ── countBookSections ──────────────────────────────────────────────────────

console.log("\ncountBookSections");

test("counts sections matching '## Author — *Title*'", () => {
  const text = [
    "## Frederick Brooks — *The Mythical Man-Month*",
    "some content",
    "## Steve McConnell — *Code Complete*",
    "more content",
  ].join("\n");
  assert.equal(countBookSections(text), 2);
});

test("returns 0 when no book sections exist", () => {
  assert.equal(countBookSections("## No Em Dash Here\n## Also No Match\n"), 0);
});

test("does not count lines without the em-dash separator", () => {
  const text = "## Author Name *Book Title*\n## Author — *Real Book*\n";
  assert.equal(countBookSections(text), 1);
});

// ── countProductionRisks ───────────────────────────────────────────────────

console.log("\ncountProductionRisks");

test("counts '## Risk N:' headers", () => {
  const text = "## Risk 1: Cognitive Overload\n## Risk 2: Change Propagation\n## Risk 3: Knowledge Duplication\n";
  assert.equal(countProductionRisks(text), 3);
});

test("returns 0 when no production risk headers present", () => {
  assert.equal(countProductionRisks("## Risk T1: Test Obscurity\n"), 0);
});

test("does not count test risk headers (Risk T…)", () => {
  const text = "## Risk T1: Test Obscurity\n## Risk 1: Real Risk\n";
  assert.equal(countProductionRisks(text), 1);
});

// ── countTestRisks ─────────────────────────────────────────────────────────

console.log("\ncountTestRisks");

test("counts '## Risk TN:' headers", () => {
  const text = "## Risk T1: Test Obscurity\n## Risk T2: Test Brittleness\n";
  assert.equal(countTestRisks(text), 2);
});

test("returns 0 when no test risk headers present", () => {
  assert.equal(countTestRisks("## Risk 1: Cognitive Overload\n"), 0);
});

test("does not count production risk headers", () => {
  const text = "## Risk 1: Real Risk\n## Risk T1: Test Risk\n## Risk T2: Another\n";
  assert.equal(countTestRisks(text), 2);
});

// ── extractChangelogVersion ────────────────────────────────────────────────

console.log("\nextractChangelogVersion");

test("extracts version from standard changelog header", () => {
  const text = "# Changelog\n\n## [1.2.3] - 2026-04-12\n\nSome changes.";
  assert.equal(extractChangelogVersion(text), "1.2.3");
});

test("returns the first (latest) version when multiple entries exist", () => {
  const text = "## [2.0.0] - 2026-04-12\n\n## [1.9.0] - 2026-03-01\n";
  assert.equal(extractChangelogVersion(text), "2.0.0");
});

test("returns null when no version header found", () => {
  assert.equal(extractChangelogVersion("# Changelog\n\nNo versions yet."), null);
});

// ── extractGuideStepLabels ───────────────────────────────────────────────

console.log("\nextractGuideStepLabels");

test("extracts step labels from standard headings", () => {
  const text = "### Step 1: Understand scope\n### Step 2: Scan\n### Step 3: Output\n";
  assert.deepEqual(extractGuideStepLabels(text), ["1", "2", "3"]);
});

test("extracts sub-step labels (a/b suffixes)", () => {
  const text = "### Step 2a: Scan for Brittleness\n### Step 2b: Scan for Mock Abuse\n";
  assert.deepEqual(extractGuideStepLabels(text), ["2a", "2b"]);
});

test("handles 0-indexed steps", () => {
  const text = "### Step 0: Gather Context\n### Step 1: Draw Graph\n### Step 2: Scan\n";
  assert.deepEqual(extractGuideStepLabels(text), ["0", "1", "2"]);
});

test("returns empty array when no step headings exist", () => {
  assert.deepEqual(extractGuideStepLabels("## Process\n\nSome text.\n"), []);
});

test("ignores non-step headings", () => {
  const text = "### Before You Start\n### Step 1: Real Step\n### Output\n";
  assert.deepEqual(extractGuideStepLabels(text), ["1"]);
});

test("handles mixed main and sub-steps", () => {
  const text = [
    "### Step 1: First",
    "### Step 2: Second",
    "### Step 2b: Sub of second",
    "### Step 3: Third",
  ].join("\n");
  assert.deepEqual(extractGuideStepLabels(text), ["1", "2", "2b", "3"]);
});

test("handles full pr-review-guide pattern", () => {
  const text = [
    "### Step 1: Understand the scope",
    "### Step 2: Scan for Change Propagation",
    "### Step 3: Scan for Cognitive Overload",
    "### Step 4: Scan for Knowledge Duplication",
    "### Step 5: Scan for Accidental Complexity",
    "### Step 6a: Scan for Dependency Disorder",
    "### Step 6b: Scan for Domain Model Distortion",
    "### Step 7: Quick Test Check",
  ].join("\n");
  assert.deepEqual(
    extractGuideStepLabels(text),
    ["1", "2", "3", "4", "5", "6a", "6b", "7"],
  );
});

// —— assembleSystemPrompt / VALID_MODES ————————————————————————————————

console.log("\nassembleSystemPrompt");

test("includes sweep in VALID_MODES", () => {
  assert.ok(VALID_MODES.includes("sweep"));
});

test("assembles sweep prompt with both risk catalogs and sweep guide", () => {
  const prompt = assembleSystemPrompt("sweep", path.join(__dirname, "..", "skills"));
  assert.match(prompt, /## Risk 1: Cognitive Overload/);
  assert.match(prompt, /## Risk T1: Test Obscurity/);
  assert.match(prompt, /# Brooks-Lint .* Full Sweep Guide/);
});

// ── readHistory ────────────────────────────────────────────────────────────

console.log("\nreadHistory");

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "brooks-lint-test-"));
  try { fn(dir); } finally { rmSync(dir, { recursive: true }); }
}

test("returns empty array when history file does not exist", () => {
  withTempDir(dir => assert.deepEqual(readHistory(dir), []));
});

test("returns parsed array when history file exists", () => {
  withTempDir(dir => {
    const record = {
      date: "2026-04-16T00:00:00Z",
      mode: "PR Review",
      score: 85,
      findings: { critical: 0, warning: 1, suggestion: 2 },
      scope: "staged changes",
    };
    writeFileSync(path.join(dir, ".brooks-lint-history.json"), JSON.stringify([record]));
    assert.deepEqual(readHistory(dir), [record]);
  });
});

test("returns empty array when history file contains invalid JSON", () => {
  withTempDir(dir => {
    writeFileSync(path.join(dir, ".brooks-lint-history.json"), "not valid json");
    assert.deepEqual(readHistory(dir), []);
  });
});

// ── appendHistory ─────────────────────────────────────────────────────────

console.log("\nappendHistory");

test("creates history file with first record", () => {
  withTempDir(dir => {
    const record = {
      date: "2026-04-16T00:00:00Z",
      mode: "PR Review",
      score: 82,
      findings: { critical: 1, warning: 2, suggestion: 3 },
      scope: "staged changes (3 files)",
    };
    appendHistory(dir, record);
    assert.deepEqual(readHistory(dir), [record]);
  });
});

test("appends to existing history without overwriting", () => {
  withTempDir(dir => {
    const record1 = {
      date: "2026-04-15T00:00:00Z",
      mode: "PR Review",
      score: 85,
      findings: { critical: 0, warning: 1, suggestion: 2 },
      scope: "staged changes",
    };
    const record2 = {
      date: "2026-04-16T00:00:00Z",
      mode: "PR Review",
      score: 82,
      findings: { critical: 1, warning: 2, suggestion: 3 },
      scope: "staged changes (3 files)",
    };
    appendHistory(dir, record1);
    appendHistory(dir, record2);
    assert.deepEqual(readHistory(dir), [record1, record2]);
  });
});

// ── getTrend ───────────────────────────────────────────────────────────────

console.log("\ngetTrend");

test("returns null when history is empty", () => {
  assert.equal(getTrend([], "PR Review"), null);
});

test("returns null when no records for the requested mode", () => {
  const history = [{ mode: "Architecture Audit", score: 90 }];
  assert.equal(getTrend(history, "PR Review"), null);
});

test("returns lastScore and runCount for one prior record", () => {
  const history = [{ mode: "PR Review", score: 85 }];
  const trend = getTrend(history, "PR Review");
  assert.equal(trend.lastScore, 85);
  assert.equal(trend.runCount, 1);
});

test("returns most recent score when multiple records exist", () => {
  const history = [
    { mode: "PR Review", score: 90 },
    { mode: "PR Review", score: 85 },
    { mode: "PR Review", score: 82 },
  ];
  const trend = getTrend(history, "PR Review");
  assert.equal(trend.lastScore, 82);
  assert.equal(trend.runCount, 3);
});

test("ignores records for other modes", () => {
  const history = [
    { mode: "Architecture Audit", score: 90 },
    { mode: "PR Review", score: 85 },
    { mode: "PR Review", score: 82 },
  ];
  const trend = getTrend(history, "PR Review");
  assert.equal(trend.lastScore, 82);
  assert.equal(trend.runCount, 2);
});

test("matches a canonical query against display-name records", () => {
  // Regression: ci-review.mjs queries with the canonical mode ("review") while
  // records written by the model are stored as display names ("PR Review").
  const history = [{ mode: "PR Review", score: 88 }];
  const trend = getTrend(history, "review");
  assert.equal(trend.lastScore, 88);
  assert.equal(trend.runCount, 1);
});

// ── normalizeMode ────────────────────────────────────────────────────────────

console.log("\nnormalizeMode");

test("maps display names to canonical modes", () => {
  assert.equal(normalizeMode("PR Review"), "review");
  assert.equal(normalizeMode("Architecture Audit"), "audit");
  assert.equal(normalizeMode("Tech Debt Assessment"), "debt");
  assert.equal(normalizeMode("Full Sweep"), "sweep");
});

test("passes canonical names through unchanged", () => {
  assert.equal(normalizeMode("review"), "review");
  assert.equal(normalizeMode("health"), "health");
});

test("is case- and whitespace-insensitive", () => {
  assert.equal(normalizeMode("  pr review  "), "review");
});

test("passes non-string input through unchanged", () => {
  assert.equal(normalizeMode(undefined), undefined);
});

// ── sparkline ────────────────────────────────────────────────────────────────

console.log("\nsparkline");

test("maps score extremes to the lowest and highest bars", () => {
  assert.equal(sparkline([0]), "▁");
  assert.equal(sparkline([100]), "█");
});

test("renders one bar per score and clamps out-of-range values", () => {
  assert.equal(sparkline([0, 50, 100]).length, 3);
  assert.equal(sparkline([150]), "█");
  assert.equal(sparkline([-10]), "▁");
});

// ── renderHistory ────────────────────────────────────────────────────────────

console.log("\nrenderHistory");

test("reports no history for an empty array", () => {
  assert.equal(renderHistory([]), "No history found.");
});

test("summarizes a single record as one run", () => {
  const out = renderHistory([{ mode: "PR Review", score: 88 }]);
  assert.match(out, /review/);
  assert.match(out, /1 run/);
});

test("collapses display-name and canonical records into one mode line", () => {
  const out = renderHistory([
    { mode: "PR Review", score: 70 },
    { mode: "review", score: 90 },
  ]);
  assert.match(out, /\+20 over 2 runs/);
});

// ── extractRiskCodes ───────────────────────────────────────────────────────

console.log("\nextractRiskCodes");

test("extracts R-codes from text", () => {
  assert.deepEqual([...extractRiskCodes("R1 and R2 are present")], ["R1", "R2"]);
});

test("extracts T-codes from text", () => {
  assert.deepEqual([...extractRiskCodes("T3 and T6 detected")], ["T3", "T6"]);
});

test("returns empty set when no risk codes present", () => {
  assert.equal(extractRiskCodes("no codes here").size, 0);
});

// ── classify ───────────────────────────────────────────────────────────────

console.log("\nclassify");

test("returns 'pass' when all expected codes found with Iron Law and Health Score", () => {
  const scenario = { expected_output: "R1" };
  const aiText = "R1 Symptom: x Source: y Consequence: z Remedy: w Health Score: 85/100";
  assert.equal(classify(scenario, aiText), "pass");
});

test("returns 'partial' when some codes found with Iron Law but Health Score absent", () => {
  const scenario = { expected_output: "R1 R2" };
  const aiText = "R1 Symptom: x Source: y Consequence: z Remedy: w";
  assert.equal(classify(scenario, aiText), "partial");
});

test("returns 'fail' when no expected codes found in output", () => {
  const scenario = { expected_output: "R1 R2" };
  const aiText = "Symptom: x Source: y Consequence: z Remedy: w Health Score: 85/100";
  assert.equal(classify(scenario, aiText), "fail");
});

test("returns 'false-positive-pass' for no_health_score when output has no score", () => {
  const scenario = { expected_output: "", no_health_score: true };
  assert.equal(classify(scenario, "output without a health score"), "false-positive-pass");
});

test("returns 'fail' for no_health_score when Health Score IS present in output", () => {
  const scenario = { expected_output: "", no_health_score: true };
  assert.equal(classify(scenario, "Health Score: 90/100"), "fail");
});

test("returns 'false-positive-pass' for no_risk_codes when expected code is absent", () => {
  const scenario = { expected_output: "R1", no_risk_codes: true };
  assert.equal(classify(scenario, "no risk codes here"), "false-positive-pass");
});

test("returns 'fail' for no_risk_codes when expected code IS present in output", () => {
  const scenario = { expected_output: "R1", no_risk_codes: true };
  assert.equal(classify(scenario, "output mentioning R1"), "fail");
});

test("returns 'false-positive-pass' for no_risk_codes when only an unrelated code appears", () => {
  const scenario = { expected_output: "R1", no_risk_codes: true };
  // AI may flag other risks; only the specific tested code failing is a false-positive
  assert.equal(classify(scenario, "R2 mentioned here"), "false-positive-pass");
});

test("returns 'fail' when codes found but Iron Law terms absent", () => {
  const scenario = { expected_output: "R1 R2" };
  const aiText = "R1 R2 Health Score: 85/100";
  assert.equal(classify(scenario, aiText), "fail");
});

// ── report-parse: parseFindings / countFindings / extractLocation ──────────

const SAMPLE_REPORT = [
  "# Brooks-Lint Review",
  "",
  "**Health Score:** 62/100",
  "",
  "## Findings",
  "",
  "### 🔴 Critical",
  "",
  "**Change Propagation — Divergent change**",
  "Symptom: src/services/UserService.ts:42 handles auth, email, and billing.",
  "Source: Refactoring — Divergent Change",
  "Consequence: Every feature touches the same class.",
  "Remedy: Split into focused collaborators.",
  "",
  "### 🟡 Warning",
  "",
  "**Cognitive Overload (R1) — God method**",
  "Symptom: generate() in report_gen.py takes nine positional parameters.",
  "Source: A Philosophy of Software Design — shallow modules",
  "Consequence: Callers must understand the whole signature.",
  "Remedy: Introduce a ReportOptions object.",
  "",
  "### 🟢 Suggestion",
  "",
  "**Knowledge Duplication — Shipping rule copied**",
  "Symptom: the free-shipping threshold appears in cart.js and checkout.js.",
  "Source: The Pragmatic Programmer — DRY",
  "Consequence: A policy change must be made in two places.",
  "Remedy: Extract a single shippingPolicy module.",
  "",
  "## Summary",
  "",
  "**Bold prose, not a finding** — should be ignored.",
].join("\n");

console.log("\nparseFindings");

test("parses one finding per severity group", () => {
  assert.equal(parseFindings(SAMPLE_REPORT).length, 3);
});

test("maps risk name to code and keeps severity", () => {
  const [crit, warn, sug] = parseFindings(SAMPLE_REPORT);
  assert.deepEqual([crit.riskCode, crit.severity], ["R2", "critical"]);
  assert.deepEqual([warn.riskCode, warn.severity], ["R1", "warning"]);
  assert.deepEqual([sug.riskCode, sug.severity], ["R3", "suggestion"]);
});

test("resolves an explicit (R1) code in the title", () => {
  const warn = parseFindings(SAMPLE_REPORT)[1];
  assert.equal(warn.riskName, "Cognitive Overload");
  assert.equal(warn.title, "God method");
});

test("extracts file and line from the Symptom", () => {
  const crit = parseFindings(SAMPLE_REPORT)[0];
  assert.equal(crit.file, "src/services/UserService.ts");
  assert.equal(crit.line, 42);
});

test("ignores bold text outside any severity group", () => {
  // The Summary's bold line must not be counted as a finding.
  assert.ok(parseFindings(SAMPLE_REPORT).every((f) => f.title !== ""));
  assert.equal(parseFindings(SAMPLE_REPORT).length, 3);
});

test("empty report yields no findings", () => {
  assert.deepEqual(parseFindings(""), []);
  assert.deepEqual(parseFindings(null), []);
});

const VARIANT_REPORT = [
  "## Findings",
  "",
  "### 🔴 Critical Issues",
  "",
  "**Dependency Disorder: models import services**",
  "Symptom: a cyclic import exists.",
  "Source: Clean Architecture — the Dependency Rule",
  "Consequence: the build in app/core/wiring.ts breaks.",
  "Remedy: invert the dependency toward an interface.",
  "",
  "### 🟡 Warnings",
  "",
  "**Coverage Illusion — green but hollow**",
  "Symptom: the suite asserts nothing meaningful.",
  "Source: How Google Tests Software — coverage signal",
  "Consequence: regressions slip through unnoticed.",
  "Remedy: assert on observable outcomes.",
].join("\n");

test("tolerates plural / qualified severity headers", () => {
  // `### 🔴 Critical Issues` and `### 🟡 Warnings` must still register as groups.
  const f = parseFindings(VARIANT_REPORT);
  assert.equal(f.length, 2);
  assert.deepEqual([f[0].severity, f[1].severity], ["critical", "warning"]);
});

test("splits a colon-separated title and resolves its code", () => {
  const first = parseFindings(VARIANT_REPORT)[0];
  assert.equal(first.riskCode, "R5");
  assert.equal(first.riskName, "Dependency Disorder");
  assert.equal(first.title, "models import services");
});

test("falls back to Consequence for the location when Symptom has none", () => {
  const first = parseFindings(VARIANT_REPORT)[0];
  assert.equal(first.file, "app/core/wiring.ts");
});

console.log("\ncountFindings");

test("counts findings by severity", () => {
  assert.deepEqual(countFindings(SAMPLE_REPORT), { critical: 1, warning: 1, suggestion: 1 });
});

test("empty report counts all zero", () => {
  assert.deepEqual(countFindings(""), { critical: 0, warning: 0, suggestion: 0 });
});

console.log("\nextractLocation");

test("captures path with line number", () => {
  assert.deepEqual(extractLocation("see app/models/order.rb:128 only"), {
    file: "app/models/order.rb",
    line: 128,
  });
});

test("captures bare filename without a line", () => {
  assert.deepEqual(extractLocation("generate() in report_gen.py"), {
    file: "report_gen.py",
    line: null,
  });
});

test("does not mistake prose for a file reference", () => {
  assert.deepEqual(extractLocation("nothing here, e.g. no path"), { file: null, line: null });
  assert.deepEqual(extractLocation("see line 3 (i.e. nowhere)"), { file: null, line: null });
});

// ── sarif: reportToSarif ───────────────────────────────────────────────────

console.log("\nreportToSarif");

test("emits a SARIF 2.1.0 envelope", () => {
  const log = reportToSarif(SAMPLE_REPORT, { mode: "review", toolVersion: "1.3.0" });
  assert.equal(log.version, "2.1.0");
  assert.ok(log.$schema.includes("sarif-2.1.0"));
  assert.equal(log.runs[0].tool.driver.name, "brooks-lint");
  assert.equal(log.runs[0].tool.driver.version, "1.3.0");
});

test("declares a deduped, PascalCased rule per risk code", () => {
  const rules = reportToSarif(SAMPLE_REPORT).runs[0].tool.driver.rules;
  assert.deepEqual(rules.map((r) => r.id), ["R2", "R1", "R3"]);
  assert.equal(rules[0].name, "ChangePropagation");
});

test("maps severities to SARIF levels", () => {
  const results = reportToSarif(SAMPLE_REPORT).runs[0].results;
  assert.deepEqual(results.map((r) => r.level), ["error", "warning", "note"]);
});

test("attaches a physical location when a file is known", () => {
  const first = reportToSarif(SAMPLE_REPORT).runs[0].results[0];
  const loc = first.locations[0].physicalLocation;
  assert.equal(loc.artifactLocation.uri, "src/services/UserService.ts");
  assert.equal(loc.region.startLine, 42);
  assert.ok(first.message.text.includes("Remedy:"));
});

test("fingerprints are stable across runs", () => {
  const a = reportToSarif(SAMPLE_REPORT).runs[0].results[0].partialFingerprints.brooksLint;
  const b = reportToSarif(SAMPLE_REPORT).runs[0].results[0].partialFingerprints.brooksLint;
  assert.equal(a, b);
});

test("empty report yields no rules or results", () => {
  const log = reportToSarif("");
  assert.deepEqual(log.runs[0].tool.driver.rules, []);
  assert.deepEqual(log.runs[0].results, []);
});

test("routes T-code helpUri off the guide (no #t anchor) and R-code onto it", () => {
  const rules = reportToSarif(VARIANT_REPORT).runs[0].tool.driver.rules;
  const r5 = rules.find((r) => r.id === "R5");
  const t5 = rules.find((r) => r.id === "T5");
  assert.ok(r5.helpUri.endsWith("guide.html#r5"));
  assert.ok(t5.helpUri.includes("test-decay-risks.md"));
  assert.ok(!t5.helpUri.includes("#t5"));
});

test("declares a BL000 rule when a finding is unmapped", () => {
  const unmapped = [
    "## Findings",
    "",
    "### 🔴 Critical",
    "",
    "**Some Unknown Smell — mystery**",
    "Symptom: something odd in foo.ts.",
    "Consequence: unclear impact.",
    "Remedy: investigate.",
  ].join("\n");
  const run = reportToSarif(unmapped).runs[0];
  assert.equal(run.results[0].ruleId, "BL000");
  assert.ok(run.tool.driver.rules.some((r) => r.id === "BL000"));
});

// ── ci-gate: severityBreached / isRegression ───────────────────────────────

console.log("\nseverityBreached");

test("fail-on critical trips only on a critical finding", () => {
  assert.equal(severityBreached({ critical: 1, warning: 0, suggestion: 0 }, "critical"), true);
  assert.equal(severityBreached({ critical: 0, warning: 5, suggestion: 9 }, "critical"), false);
});

test("fail-on warning trips on critical or warning", () => {
  assert.equal(severityBreached({ critical: 0, warning: 1, suggestion: 0 }, "warning"), true);
  assert.equal(severityBreached({ critical: 2, warning: 0, suggestion: 0 }, "warning"), true);
  assert.equal(severityBreached({ critical: 0, warning: 0, suggestion: 3 }, "warning"), false);
});

test("fail-on none never trips", () => {
  assert.equal(severityBreached({ critical: 9, warning: 9, suggestion: 9 }, "none"), false);
});

test("missing or partial findings are treated as zero", () => {
  assert.equal(severityBreached(undefined, "critical"), false);
  assert.equal(severityBreached({}, "warning"), false);
});

console.log("\nisRegression");

test("only a negative numeric delta is a regression", () => {
  assert.equal(isRegression(-1), true);
  assert.equal(isRegression(0), false);
  assert.equal(isRegression(5), false);
  assert.equal(isRegression(null), false);
  assert.equal(isRegression(undefined), false);
});

// ── Integration: validate-repo.mjs passes against current repo ─────────────

console.log("\nvalidate-repo integration");

test("validate-repo.mjs exits 0 against the current repository", () => {
  execFileSync("node", [path.join(__dirname, "validate-repo.mjs")], { encoding: "utf8" });
  // execFileSync throws on non-zero exit — reaching here means exit 0
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
