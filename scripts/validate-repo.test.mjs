/**
 * Unit tests for parseFrontmatterBooks().
 *
 * Run:  node scripts/validate-repo.test.mjs
 *
 * Uses Node.js built-in assert — no test framework required.
 */

import assert from "node:assert/strict";
import { parseFrontmatterBooks } from "./frontmatter.mjs";

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

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
