/**
 * Shared frontmatter parsing utilities.
 *
 * Extracted so that validate-repo.mjs and validate-repo.test.mjs can both
 * import parseFrontmatterBooks without the test file triggering the full
 * validation run on import.
 */

/**
 * Parse the `books:` list from a YAML frontmatter block at the top of a
 * markdown file. Returns an array of book title strings, or null if the
 * frontmatter or `books` key is absent.
 *
 * Expected frontmatter shape:
 *   ---
 *   books:
 *     - Title One
 *     - Title Two
 *   ---
 *
 * Tolerates any leading whitespace before the hyphen (2-space or 4-space
 * indentation both work). Book titles may contain colons, asterisks, or
 * other special characters — the only delimiter is the line break.
 */
export function parseFrontmatterBooks(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const booksSection = match[1].match(/^books:\n((?:[ \t]+-[^\n]+\n?)+)/m);
  if (!booksSection) return null;
  return booksSection[1]
    .split("\n")
    .filter((line) => /^\s+-/.test(line))
    .map((line) => line.replace(/^\s+-\s*/, "").trim());
}

/**
 * Count book sections in source-coverage.md.
 * Each book section uses the pattern: ## Author Name — *Book Title*
 */
export function countBookSections(text) {
  return (text.match(/^## .+ — \*/gm) ?? []).length;
}

/**
 * Count production decay risk sections in decay-risks.md.
 * Each risk section uses the pattern: ## Risk N: Title
 */
export function countProductionRisks(text) {
  return (text.match(/^## Risk \d+:/gm) ?? []).length;
}

/**
 * Count test decay risk sections in test-decay-risks.md.
 * Each risk section uses the pattern: ## Risk TN: Title
 */
export function countTestRisks(text) {
  return (text.match(/^## Risk T\d+:/gm) ?? []).length;
}

/**
 * Extract the latest version string from CHANGELOG.md.
 * Returns null if no version header is found.
 */
export function extractChangelogVersion(text) {
  return text.match(/^## \[(.+?)\] - /m)?.[1] ?? null;
}

/**
 * Extract step labels from a guide file.
 * Matches: ### Step 1, ### Step 2a, ### Step 6b, ### Step 0, etc.
 * Returns: ["1", "2a", "6b", ...] — the label portion only.
 */
export function extractGuideStepLabels(text) {
  return (text.match(/^### Step (\d+[a-z]?)/gm) ?? [])
    .map(m => m.replace(/^### Step /, ""));
}
