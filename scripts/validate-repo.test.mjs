/**
 * Unit tests for parseFrontmatterBooks().
 *
 * Run:  node scripts/validate-repo.test.mjs
 *
 * Uses Node.js built-in assert — no test framework required.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  parseFrontmatterBooks,
  countBookSections,
  countProductionRisks,
  countTestRisks,
  extractChangelogVersion,
  extractGuideStepLabels,
} from "./frontmatter.mjs";

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

// ── Integration: validate-repo.mjs passes against current repo ─────────────

console.log("\nvalidate-repo integration");

test("validate-repo.mjs exits 0 against the current repository", () => {
  execFileSync("node", [path.join(__dirname, "validate-repo.mjs")], { encoding: "utf8" });
  // execFileSync throws on non-zero exit — reaching here means exit 0
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
