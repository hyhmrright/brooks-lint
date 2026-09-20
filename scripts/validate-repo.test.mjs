/**
 * Unit tests for the scripts/ helpers: frontmatter parsing, prompt assembly,
 * history, eval classification, report parsing, SARIF export, CI gates, and the
 * parser-fidelity summarizer — plus an integration check that validate-repo.mjs
 * exits 0 against this repository.
 *
 * Run:  node scripts/validate-repo.test.mjs
 *
 * Uses Node.js built-in assert — no test framework required.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
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
  extractChangelogSection,
  extractChangelogVersion,
  extractGuideStepLabels,
  hasOpencodeSlashFlag,
} from "./frontmatter.mjs";
import {
  auditRange,
  changelogTrailer,
  exemption,
  commitsSince,
  coverageVerdict,
  isTagged,
  lastTag,
  parseCommitLog,
  plural,
  pullRequestOf,
  report,
} from "./changelog-audit.mjs";
import { extractRiskCodes, classify } from "./eval-utils.mjs";
import { parseFindings, countFindings, extractLocation, SOURCE_EXTENSIONS } from "./report-parse.mjs";
import { reportToSarif } from "./sarif.mjs";
import { severityBreached, isRegression } from "./ci-gate.mjs";
import { summarize } from "./benchmark.mjs";
import { versionRefs } from "./version-refs.mjs";
import {
  linkedSetupGuides,
  parseInstallerPlatforms,
  platformEnumeration,
  namesPlatform,
} from "./platforms.mjs";

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

// ── hasOpencodeSlashFlag ───────────────────────────────────────────────────

console.log("\nhasOpencodeSlashFlag");

const SLASH_FRONTMATTER = [
  "---",
  "name: brooks-review",
  "description: >",
  "  PR code review. Do NOT trigger for: architecture audits.",
  "metadata:",
  '  opencode/slash: "true"',
  "---",
  "",
  "# Brooks-Lint — PR Review",
  "",
].join("\n");

test("accepts frontmatter carrying the opt-in flag", () => {
  assert.equal(hasOpencodeSlashFlag(SLASH_FRONTMATTER), true);
});

test("rejects frontmatter with no metadata block", () => {
  const text = SLASH_FRONTMATTER.replace('metadata:\n  opencode/slash: "true"\n', "");
  assert.equal(hasOpencodeSlashFlag(text), false);
});

test("rejects a metadata block that omits opencode/slash", () => {
  const text = SLASH_FRONTMATTER.replace('  opencode/slash: "true"', "  audience: maintainers");
  assert.equal(hasOpencodeSlashFlag(text), false);
});

test("rejects the flag set to false", () => {
  assert.equal(hasOpencodeSlashFlag(SLASH_FRONTMATTER.replace('"true"', '"false"')), false);
});

test("accepts YAML's bare true, which parses to the same boolean", () => {
  assert.equal(hasOpencodeSlashFlag(SLASH_FRONTMATTER.replace('"true"', "true")), true);
});

test("ignores an opencode/slash line outside the frontmatter", () => {
  const text = ["---", "name: brooks-review", "---", "", "metadata:", '  opencode/slash: "true"', ""].join("\n");
  assert.equal(hasOpencodeSlashFlag(text), false);
});

test("every shipped skill carries the flag", () => {
  for (const mode of VALID_MODES) {
    const skillMd = readFileSync(path.join(__dirname, "..", "skills", `brooks-${mode}`, "SKILL.md"), "utf8");
    assert.ok(hasOpencodeSlashFlag(skillMd), `brooks-${mode}/SKILL.md should opt into OpenCode's / menu`);
  }
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

// Bare filenames (no `/`) exercise the extension allowlist; a path with a
// slash would match the first branch's generic `.\w+` regardless of the list.
test("captures newer-language extensions from bare filenames", () => {
  assert.deepEqual(extractLocation("bug in user.ex:42"), { file: "user.ex", line: 42 });
  assert.deepEqual(extractLocation("see main.dart"), { file: "main.dart", line: null });
  assert.deepEqual(extractLocation("main.tf drifts"), { file: "main.tf", line: null });
});

test("prefers the longer of two prefix-sharing extensions", () => {
  // Regression: the alternation is first-match, so a short extension listed
  // before its longer sibling truncated the filename — `.tsx` parsed as `.ts`,
  // which also swallowed the `:line` and pointed SARIF at a nonexistent file.
  const pairs = [
    ["runtime.exs boots the app", "runtime.exs"],
    ["core.cljs mounts", "core.cljs"],
    ["parser.mli exports", "parser.mli"],
    ["App.tsx renders twice", "App.tsx"],
    ["Button.jsx re-renders", "Button.jsx"],
    ["Foo.hpp declares it", "Foo.hpp"],
    ["build.gradle.kts configures it", "build.gradle.kts"],
    ["Bridge.mm wraps the ObjC side", "Bridge.mm"],
  ];
  for (const [text, expected] of pairs) {
    assert.equal(extractLocation(text).file, expected, text);
  }
});

test("keeps the line number on a bare filename with a long extension", () => {
  assert.deepEqual(extractLocation("App.tsx:12 mounts twice"), { file: "App.tsx", line: 12 });
});

test("no extension shadows a longer one that starts with it", () => {
  // Mechanical guard over the real allowlist: every `name.<ext>` must round-trip.
  // An extension added in the wrong position fails here, not in production SARIF.
  for (const ext of SOURCE_EXTENSIONS) {
    assert.equal(extractLocation(`sample.${ext}`).file, `sample.${ext}`, `.${ext} was truncated`);
  }
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

// ── Parser-fidelity benchmark on the FROZEN real-report corpus ─────────────
// Deterministic regression guard: the shipped parser must reproduce the
// independently-graded finding inventory of 30 real model-generated reports.
// This is the non-circular counterpart to the synthetic SAMPLE_REPORT tests
// above — the reports here are real model output, the truth was graded by a
// separate pass and spot-checked by hand. See scripts/benchmark.mjs.

console.log("\nparser-fidelity benchmark (frozen real-report corpus)");

const CORPUS = JSON.parse(readFileSync(path.join(__dirname, "..", "evals", "benchmark-corpus.json"), "utf8"));
const BENCH = summarize(CORPUS);

test("corpus has >= 30 real reports spanning all six modes", () => {
  assert.ok(CORPUS.samples.length >= 30, `expected >=30 samples, got ${CORPUS.samples.length}`);
  const modes = new Set(CORPUS.samples.map((s) => s.mode));
  for (const m of VALID_MODES) assert.ok(modes.has(m), `corpus is missing mode ${m}`);
});

test("corpus composition matches the documented numbers (30 total, 9 false-positive)", () => {
  // These exact counts are published in the README "Reproducible benchmarks"
  // section — fail loudly if a corpus regen changes them without a docs update.
  assert.equal(CORPUS.samples.length, 30);
  assert.equal(CORPUS.samples.filter((s) => s.isFP).length, 9);
});

test("parser reproduces the graded severity counts on every report", () => {
  const bad = BENCH.rows.filter((r) => !r.countMatch).map((r) => `${r.id}: truth ${r.truth} vs parser ${r.parser}`);
  assert.equal(bad.length, 0, `count mismatches: ${bad.join("; ")}`);
});

test("every report emits valid SARIF 2.1.0", () => {
  const bad = BENCH.rows.filter((r) => !r.sarifValid).map((r) => r.id);
  assert.equal(bad.length, 0, `invalid SARIF for: ${bad.join(", ")}`);
});

test("risk-code extraction has zero false positives / negatives on the corpus", () => {
  assert.equal(BENCH.fp, 0, `${BENCH.fp} false-positive code(s)`);
  assert.equal(BENCH.fn, 0, `${BENCH.fn} false-negative code(s)`);
  assert.equal(BENCH.precision, 1);
  assert.equal(BENCH.recall, 1);
});

// ── versionRefs ────────────────────────────────────────────────────────────

console.log("\nversionRefs");

/** Build a fake repo root with the given `relative path -> contents` map. */
function withFakeRepo(files, fn) {
  withTempDir((dir) => {
    mkdirSync(path.join(dir, "docs"));
    for (const [rel, body] of Object.entries(files)) {
      writeFileSync(path.join(dir, rel), body, "utf8");
    }
    fn(dir);
  });
}

test("discovers every README translation, not a fixed list", () => {
  withFakeRepo({ "README.md": "", "README.es.md": "", "README.zh-TW.md": "" }, (dir) => {
    const found = versionRefs(dir, "9.9.9").map((r) => r.rel);
    assert.deepEqual(found, ["README.es.md", "README.md", "README.zh-TW.md"]);
  });
});

test("renders the badge and JSON-LD text expected at the given version", () => {
  withFakeRepo({ "README.md": "", "docs/index.html": "" }, (dir) => {
    const byRel = Object.fromEntries(versionRefs(dir, "9.9.9").map((r) => [r.rel, r]));
    assert.equal(byRel["README.md"].expected, "version-9.9.9-blue.svg");
    assert.equal(byRel[path.join("docs", "index.html")].expected, '"softwareVersion": "9.9.9"');
  });
});

test("marks README badges required and docs pages optional", () => {
  // Only the landing page carries JSON-LD; gallery.html and guide.html must not
  // be reported as missing a version they were never meant to have.
  withFakeRepo({ "README.md": "", "docs/gallery.html": "" }, (dir) => {
    const byRel = Object.fromEntries(versionRefs(dir, "9.9.9").map((r) => [r.rel, r]));
    assert.equal(byRel["README.md"].required, true);
    assert.equal(byRel[path.join("docs", "gallery.html")].required, false);
  });
});

test("ignores non-README markdown at the repo root", () => {
  withFakeRepo({ "README.md": "", "CHANGELOG.md": "", "CONTRIBUTING.md": "" }, (dir) => {
    assert.deepEqual(versionRefs(dir, "9.9.9").map((r) => r.rel), ["README.md"]);
  });
});

test("patterns match the real badge and JSON-LD shapes", () => {
  withFakeRepo({
    "README.md": '<img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">',
    "docs/index.html": '  "softwareVersion": "1.0.0",',
  }, (dir) => {
    for (const { rel, pattern, expected } of versionRefs(dir, "9.9.9")) {
      const text = readFileSync(path.join(dir, rel), "utf8");
      assert.equal(text.match(pattern).length, 1, `${rel} should contain exactly one version reference`);
      assert.match(text.replace(pattern, expected), /9\.9\.9/);
    }
  });
});

console.log("\nlinkedSetupGuides");

test("collects guides from README-style and sibling-style links alike", () => {
  const text = "| Kiro | [setup](docs/kiro-setup.md) |\n| pi | [pi-setup.md](pi-setup.md) |";
  assert.deepEqual(linkedSetupGuides(text), ["kiro-setup.md", "pi-setup.md"]);
});

test("de-duplicates a guide linked more than once", () => {
  const text = "[a](docs/dsh-setup.md) … [b](dsh-setup.md)";
  assert.deepEqual(linkedSetupGuides(text), ["dsh-setup.md"]);
});

test("returns an empty array when no guide is linked", () => {
  assert.deepEqual(linkedSetupGuides("no links here"), []);
});

console.log("\nplatformEnumeration");

test("picks the enumeration line, not the earlier <platform> placeholder", () => {
  const text = "bash -s -- <platform>\n#   <platform> = opencode · kiro\n```";
  assert.equal(platformEnumeration(text), "#   <platform> = opencode · kiro\n```");
});

test("keeps the continuation line, since getting-started wraps mid-list", () => {
  const text = "`<platform>` ∈ `opencode · dsh ·\ngemini · agents`. Add `--project` to …";
  assert.ok(platformEnumeration(text).includes("agents"));
});

test("matches the localized <平台> form", () => {
  assert.ok(platformEnumeration("#   <平台> = opencode · kiro").includes("kiro"));
});

test("returns an empty string when the document has no enumeration", () => {
  assert.equal(platformEnumeration("bash -s -- <platform>\n"), "");
});

console.log("\nnamesPlatform");

test("matches a platform delimited by list separators", () => {
  assert.ok(namesPlatform("opencode · bob · agents", "bob"));
});

test("does not match a platform buried in a hyphenated filename", () => {
  assert.equal(namesPlatform("[setup](docs/bob-setup.md)", "bob"), false);
});

test("does not match a platform that is only a substring", () => {
  assert.equal(namesPlatform("opencode · piper", "pi"), false);
});

console.log("\nparseInstallerPlatforms");

const INSTALLER_FIXTURE = [
  'PLATFORMS="kiro dsh"',
  "",
  "global_dir() {",
  "  case $1 in",
  "    kiro)        printf '%s' \"$HOME/.kiro/skills\" ;;",
  "    # DeepSeek Harness resolves its config root from $DSH_HOME.",
  "    dsh)         printf '%s' \"${DSH_HOME:-$HOME/.dsh}/skills\" ;;",
  "    *)           return 1 ;;",
  "  esac",
  "}",
  "",
  "project_dir() {",
  "  case $1 in",
  "    kiro)        printf '%s' \"$PWD/.kiro/skills\" ;;",
  "    *)           return 1 ;;",
  "  esac",
  "}",
].join("\n");

test("reads the declared list and both directory mappings", () => {
  const parsed = parseInstallerPlatforms(INSTALLER_FIXTURE);
  assert.deepEqual(parsed.declared, ["kiro", "dsh"]);
  assert.deepEqual(parsed.global, ["kiro", "dsh"]);
});

test("omits a platform whose case arm is missing, so the validator can catch it", () => {
  // project_dir() in the fixture handles kiro but not dsh — running
  // `install.sh dsh --project` would die with "unknown platform".
  assert.deepEqual(parseInstallerPlatforms(INSTALLER_FIXTURE).project, ["kiro"]);
});

test("skips comments and the catch-all arm", () => {
  const { global: arms } = parseInstallerPlatforms(INSTALLER_FIXTURE);
  assert.ok(!arms.includes("*"));
  assert.equal(arms.length, 2);
});

test("parses the real installer, proving the patterns still match", () => {
  const installer = readFileSync(path.join(__dirname, "install.sh"), "utf8");
  const { declared, global: globalArms, project } = parseInstallerPlatforms(installer);
  assert.ok(declared.length >= 12, `expected the full platform list, got ${declared.length}`);
  assert.deepEqual(new Set(globalArms), new Set(declared));
  assert.deepEqual(new Set(project), new Set(declared));
});

// ── Integration: validate-repo.mjs passes against current repo ─────────────

console.log("\nvalidate-repo integration");

test("validate-repo.mjs exits 0 against the current repository", () => {
  execFileSync("node", [path.join(__dirname, "validate-repo.mjs")], { encoding: "utf8" });
  // execFileSync throws on non-zero exit — reaching here means exit 0
});

test("validate-repo.mjs runs the changelog coverage check and says what it did", () => {
  // Deleting checkChangelogCoverage() from the registration list, or inverting
  // its release-in-progress guard, both silence this line — and a gate whose
  // off-state is invisible is the silence this whole check exists to remove.
  const stdout = execFileSync("node", [path.join(__dirname, "validate-repo.mjs")], { encoding: "utf8" });
  assert.match(stdout, /Changelog coverage: (not audited — |audited)/);
});

test("validate-repo.mjs ignores an inherited CLAUDE_PLUGIN_ROOT", () => {
  // Running `npm run validate` from inside Claude Code exports CLAUDE_PLUGIN_ROOT.
  // The hook branches on that variable, so leaking it into the default-output
  // check turned every such run into a spurious failure.
  execFileSync("node", [path.join(__dirname, "validate-repo.mjs")], {
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, "..") },
  });
});


// ── changelog audit ────────────────────────────────────────────────────────

console.log("\nchangelog audit");

const FIELD = "\x1f";
const RECORD = "\x1e";

/**
 * Build a `git log --name-only` record the way changelog-audit.mjs formats it:
 * RECORD leads, and the file list follows a trailing FIELD.
 */
function logRecord({ hash = "0".repeat(40), author = "hyh", parents = "abc123", subject, body = "", files = [] }) {
  const fileBlock = files.length > 0 ? `\n\n${files.join("\n")}\n` : "";
  return RECORD + [hash, author, parents, subject, body, fileBlock].join(FIELD);
}

test("parseCommitLog keeps multi-line bodies intact", () => {
  const stdout =
    logRecord({ hash: "a".repeat(40), subject: "first", body: "line one\n\nline two\n", files: ["a.md"] }) +
    "\n" +
    logRecord({ hash: "b".repeat(40), subject: "second" });
  const commits = parseCommitLog(stdout);
  assert.equal(commits.length, 2);
  assert.equal(commits[0].body, "line one\n\nline two\n");
  assert.deepEqual(commits[0].files, ["a.md"]);
  assert.equal(commits[1].subject, "second");
  assert.equal(commits[1].hash, "b".repeat(40));
});

test("parseCommitLog reads a merge commit's two parents", () => {
  const [commit] = parseCommitLog(logRecord({ parents: "abc123 def456", subject: "Merge pull request #34 from x/y" }));
  assert.deepEqual(commit.parents, ["abc123", "def456"]);
});

test("parseCommitLog returns nothing for an empty range", () => {
  assert.deepEqual(parseCommitLog(""), []);
});

test("exemption covers merges, release bumps and the star history refresh", () => {
  assert.match(
    exemption({ parents: ["a", "b"], author: "hyh", subject: "Merge pull request #34 from x/y", files: [] }),
    /merge/,
  );
  assert.match(
    exemption({ parents: ["a"], author: "hyh", subject: "chore(release): bump version to 1.6.0", files: ["package.json"] }),
    /release bump/,
  );
  assert.match(
    exemption({
      parents: ["a"],
      author: "github-actions[bot]",
      subject: "chore: refresh the star history chart",
      files: ["assets/star-history.svg"],
    }),
    /star history refresh/,
  );
});

test("exemption covers nothing else — internal hardening still needs an entry", () => {
  // d4b5c40 changed no user-visible behavior and was still a 1.6.0 omission.
  assert.equal(
    exemption({
      parents: ["a"],
      author: "hyh",
      subject: "test: fail validation when a platform is documented unevenly",
      files: ["scripts/validate-repo.mjs"],
    }),
    null,
  );
  assert.equal(exemption({ parents: ["a"], author: "hyh", subject: "chore: tidy up", files: ["a.md"] }), null);
});

test("exemption judges a bot commit by what it changed, not by its subject", () => {
  // `[bot]` + `chore:` was wide enough to swallow a dependency bump, which is a
  // change this repo's changelog records.
  assert.equal(
    exemption({
      parents: ["a"],
      author: "dependabot[bot]",
      subject: "chore(deps): bump @anthropic-ai/sdk from 1.0.0 to 1.1.0",
      files: ["package.json", "package-lock.json"],
    }),
    null,
  );
  // Nor does the refresh's own subject exempt a commit that touched more.
  assert.equal(
    exemption({
      parents: ["a"],
      author: "github-actions[bot]",
      subject: "chore: refresh the star history chart",
      files: ["assets/star-history.svg", "README.md"],
    }),
    null,
  );
});

test("pullRequestOf reads both GitHub merge subject conventions", () => {
  assert.equal(pullRequestOf("docs: finish the singular-badge cleanup (#25)"), 25);
  assert.equal(pullRequestOf("Merge pull request #34 from rapcal/feat/opencode-command-wrappers"), 34);
});

test("pullRequestOf ignores a number that is only a reference", () => {
  // "#21" here points at an issue the commit mentions, not the PR it is.
  assert.equal(pullRequestOf("fix: stop the wrapper looping (#21 upstream)"), null);
  assert.equal(pullRequestOf("feat: add a generic api-base-url input"), null);
});

test("changelogTrailer reads the trailer and ignores prose about one", () => {
  assert.equal(changelogTrailer("Body text.\n\nChangelog: added — platform docs are cross-checked\n"), "added — platform docs are cross-checked");
  // a1036cc quotes d4b5c40's wording; a phrase regex flagged it, a trailer does not.
  assert.equal(changelogTrailer("its own commit message asked to be carried into the next release's changelog.\n"), null);
});

test("changelogTrailer takes the commit's own trailer, not one it quotes", () => {
  const body = [
    "Reverting d4b5c40, whose message ended:",
    "",
    "Changelog: added — platform docs are cross-checked",
    "",
    "That entry is withdrawn.",
    "",
    "Changelog: removed — the platform doc cross-check",
  ].join("\n");
  assert.equal(changelogTrailer(body), "removed — the platform doc cross-check");
});

test("changelogTrailer tolerates a commit with no body", () => {
  assert.equal(changelogTrailer(undefined), null);
  assert.equal(changelogTrailer(""), null);
});

test("auditRange flags a merged pull request the section never cites", () => {
  const commits = parseCommitLog(
    logRecord({ hash: "c".repeat(40), author: "2233admin", subject: "docs: finish the singular-badge cleanup (#25)" }),
  );
  const [entry] = auditRange(commits, "## [1.6.0] - 2026-09-20\n\n- **IBM Bob support** (#32, #33)\n");
  assert.equal(entry.pr, 25);
  assert.equal(entry.gap, true);
  assert.equal(entry.exempt, null);
});

test("auditRange clears a pull request the section cites", () => {
  const commits = parseCommitLog(logRecord({ subject: "feat(install): add IBM Bob platform support (#33)" }));
  const [entry] = auditRange(commits, "## [1.6.0] - 2026-09-20\n\n- **IBM Bob support** (#32, #33)\n");
  assert.equal(entry.gap, false);
});

test("auditRange audits a merge commit's pull request despite the exemption", () => {
  // The merge itself needs no entry, but the PR it lands does — and the branch
  // commit under it carries no number, so this is the only place to catch it.
  const commits = parseCommitLog(
    logRecord({ parents: "abc123 def456", subject: "Merge pull request #34 from rapcal/feat/opencode-command-wrappers" }),
  );
  const [entry] = auditRange(commits, "## [1.6.0] - 2026-09-20\n\n- nothing relevant\n");
  assert.match(entry.exempt, /merge/);
  assert.equal(entry.gap, true);
});

/** A throwaway repository, so the git layer is covered without mocking git. */
function withTempRepo(build) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "brooks-audit-"));
  const git = (...args) =>
    execFileSync(
      "git",
      ["-C", dir, "-c", "user.email=test@example.invalid", "-c", "user.name=test", ...args],
      { encoding: "utf8" },
    );
  const commit = (subject) => {
    writeFileSync(path.join(dir, "file.txt"), subject);
    git("add", "file.txt");
    git("commit", "-q", "-m", subject);
  };
  try {
    git("init", "-q", "-b", "main");
    build({ dir, git, commit });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("lastTag, isTagged and commitsSince read a real repository", () => {
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    commit("feat: something (#7)");
    assert.equal(lastTag(dir), "v0.1.0");
    assert.equal(isTagged("0.1.0", dir), true);
    assert.equal(isTagged("9.9.9", dir), false, "an unreleased version reads as a release in progress");
    const commits = commitsSince("v0.1.0", dir);
    assert.equal(commits.length, 1);
    assert.equal(commits[0].subject, "feat: something (#7)");
    assert.equal(commits[0].parents.length, 1);
  });
});

test("lastTag ignores a tag that is not a release", () => {
  // Any tag wins `git describe` by default, which would collapse the range to
  // nothing and make the whole coverage gate a vacuous pass.
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    commit("feat: something (#7)");
    git("tag", "nightly-2026-09-20");
    assert.equal(lastTag(dir), "v0.1.0");
    assert.equal(commitsSince(lastTag(dir), dir).length, 1);
  });
});

test("lastTag returns null when no release tag is reachable", () => {
  withTempRepo(({ dir, commit }) => {
    commit("first");
    assert.equal(lastTag(dir), null);
  });
});

test("commitsSince reads the author and a real merge's two parents", () => {
  // Swapping %an and %P in LOG_FORMAT leaves subject-only assertions green
  // while quietly killing both exemptions, so both fields come from real git.
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    git("checkout", "-q", "-b", "feature");
    commit("feat: on a branch");
    git("checkout", "-q", "main");
    git("merge", "-q", "--no-ff", "feature", "-m", "Merge pull request #34 from x/y");
    const commits = commitsSince("v0.1.0", dir);
    const merge = commits.find((c) => c.subject.startsWith("Merge pull request"));
    assert.equal(commits[0].author, "test", "%an must land in author, not a parent hash");
    assert.equal(merge.parents.length, 2, "%P must land in parents");
    assert.match(exemption(merge), /merge/);
    assert.deepEqual(commits[0].files, ["file.txt"], "--name-only must reach the files field");
  });
});

test("coverageVerdict reports an uncited pull request while a release is in progress", () => {
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    commit("docs: a contributor fix (#25)");
    const verdict = coverageVerdict({
      version: "0.2.0",
      cwd: dir,
      changelog: "## [0.2.0] - 2026-09-20\n\n- something unrelated\n",
    });
    assert.equal(verdict.skipped, null);
    assert.equal(verdict.errors.length, 1);
    assert.match(verdict.errors[0], /never cites #25/);
  });
});

test("coverageVerdict reports what it audited, so a clean pass is not silent", () => {
  // The gate proves only that each merged pull request's number appears in the
  // section. Without these fields validate-repo prints nothing on the one path
  // that actually audits, and an unwalked checklist reads as a complete one.
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    commit("docs: a contributor fix (#25)");
    commit("chore: unrelated");
    // Exempt, and still counted: report() heads its checklist with the whole
    // range, so counting only what needs an entry would make the two commands
    // disagree about how long the checklist is.
    commit("chore(release): bump version to 0.2.0");
    const verdict = coverageVerdict({
      version: "0.2.0",
      cwd: dir,
      changelog: "## [0.2.0] - 2026-09-20\n\n- credits #25\n",
    });
    assert.deepEqual(verdict.errors, []);
    assert.equal(verdict.range, "v0.1.0..HEAD");
    assert.equal(verdict.commitCount, 3);
  });
});

test("coverageVerdict stands down once the version is tagged", () => {
  // Wiring this guard backwards would audit between releases and never during
  // one — the precise failure the check exists to prevent.
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    commit("docs: a contributor fix (#25)");
    git("tag", "v0.2.0");
    const verdict = coverageVerdict({
      version: "0.2.0",
      cwd: dir,
      changelog: "## [0.2.0] - 2026-09-20\n\n- something unrelated\n",
    });
    assert.match(verdict.skipped, /already tagged/);
    assert.deepEqual(verdict.errors, []);
  });
});

test("coverageVerdict stands down before the new section is written", () => {
  // checkChangelog() already reports the mismatch; auditing here would tell the
  // maintainer to add an entry to a section that does not exist yet.
  withTempRepo(({ dir, git, commit }) => {
    commit("first");
    git("tag", "v0.1.0");
    commit("docs: a contributor fix (#25)");
    const verdict = coverageVerdict({
      version: "0.2.0",
      cwd: dir,
      changelog: "## [0.1.0] - 2026-08-14\n\n- the previous release\n",
    });
    assert.match(verdict.skipped, /no \[0\.2\.0\] section yet/);
    assert.deepEqual(verdict.errors, []);
  });
});

test("coverageVerdict stands down outside a git work tree root", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "brooks-audit-"));
  try {
    const verdict = coverageVerdict({ version: "0.2.0", cwd: dir, changelog: "## [0.2.0] - 2026-09-20\n" });
    assert.match(verdict.skipped, /not a git work tree root/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("extractChangelogSection returns only the newest release", () => {
  const changelog = [
    "# Changelog",
    "",
    "## [1.6.0] - 2026-09-20",
    "",
    "- newest",
    "",
    "[#25]: https://example.invalid/25",
    "",
    "## [1.5.0] - 2026-08-14",
    "",
    "- older",
    "",
  ].join("\n");
  const section = extractChangelogSection(changelog);
  assert.match(section, /1\.6\.0/);
  assert.match(section, /\[#25\]/, "a section's own link definitions belong to it");
  assert.equal(section.includes("1.5.0"), false);
  assert.equal(section.includes("older"), false);
});

test("report names every uncited pull request in its FAIL line", () => {
  const commits = parseCommitLog(
    logRecord({ hash: "c".repeat(40), author: "2233admin", subject: "docs: finish the cleanup (#25)" }) +
      "\n" +
      logRecord({
        hash: "d".repeat(40),
        author: "github-actions[bot]",
        subject: "chore: refresh the star history chart",
        files: ["assets/star-history.svg"],
      }),
  );
  const lines = report("v1.5.0..HEAD", auditRange(commits, "## [1.6.0] - 2026-09-20\n\n- nothing\n"), "[1.6.0]").join("\n");
  assert.match(lines, /Changelog audit — 2 commits in/, "the plural branch is read, not just the singular one");
  assert.match(lines, /FAIL: § \[1\.6\.0\] never cites 1 pull request merged/);
  assert.doesNotMatch(lines, /1 pull requests|2 commit /, "neither branch may pluralize the other's way");
  assert.match(lines, /#25/);
  assert.match(lines, /no entry needed \(1\)/, "the bot chore is reported as exempt, not as a line to walk");
});

test("report says so when nothing is provably missing", () => {
  const commits = parseCommitLog(logRecord({ subject: "feat: add IBM Bob support (#33)" }));
  const lines = report("v1.5.0..HEAD", auditRange(commits, "## [1.6.0]\n\n- Bob (#33)\n"), "[1.6.0]").join("\n");
  assert.match(lines, /Every pull request in the range is cited\. The checklist above still needs your eyes\./);
  assert.equal(lines.includes("FAIL"), false);
  // One commit, so a count in this sentence could only ever read "1 lines".
  assert.match(lines, /Changelog audit — 1 commit in v1\.5\.0\.\.HEAD/);
  assert.doesNotMatch(lines, /1 commits|1 lines/);
});

test("plural reads as English at zero, one and many", () => {
  // The helper exists only to get both branches right; a test that reads one
  // branch would ship the mirror image of the bug it was added to fix.
  assert.equal(plural(0, "commit"), "0 commits");
  assert.equal(plural(1, "commit"), "1 commit");
  assert.equal(plural(2, "commit"), "2 commits");
  assert.equal(plural(1, "pull request"), "1 pull request");
  assert.equal(plural(3, "pull request"), "3 pull requests");
});

test("report says there is nothing to audit when the range is empty", () => {
  // The state right after a release, and the most common moment to run this.
  assert.deepEqual(report("v1.7.0..HEAD", [], "[1.7.0]"), [
    "Nothing to audit — v1.7.0..HEAD is empty.",
  ]);
});

test("report says so when a range holds nothing but exempt commits", () => {
  const commits = parseCommitLog(
    logRecord({
      author: "github-actions[bot]",
      subject: "chore: refresh the star history chart",
      files: ["assets/star-history.svg", "assets/star-history.json"],
    }),
  );
  const lines = report("v1.6.0..HEAD", auditRange(commits, "## [1.7.0]\n\n- nothing\n"), "[1.7.0]").join("\n");
  assert.match(lines, /Every commit in the range is exempt/);
  assert.doesNotMatch(lines, /checklist above/, "there is no checklist when every commit is exempt");
});

test("extractChangelogSection returns an empty string when there is no release heading", () => {
  assert.equal(extractChangelogSection("# Changelog\n\nNothing released yet.\n"), "");
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
