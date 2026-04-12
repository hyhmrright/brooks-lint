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

// ── Integration: validate-repo.mjs passes against current repo ─────────────

console.log("\nvalidate-repo integration");

test("validate-repo.mjs exits 0 against the current repository", () => {
  execFileSync("node", [path.join(__dirname, "validate-repo.mjs")], { encoding: "utf8" });
  // execFileSync throws on non-zero exit — reaching here means exit 0
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
