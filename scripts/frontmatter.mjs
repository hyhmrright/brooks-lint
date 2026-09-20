/**
 * Shared frontmatter parsing utilities.
 *
 * Extracted so that validate-repo.mjs and validate-repo.test.mjs can both
 * import parseFrontmatterBooks without the test file triggering the full
 * validation run on import.
 */

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n");
}

/** Global-regex matches against newline-normalized text, or [] when none. */
function findMatches(text, pattern) {
  return normalizeNewlines(text).match(pattern) ?? [];
}

/**
 * The YAML block between the leading `---` fences, or null when a file has no
 * frontmatter. Non-greedy, so it stops at the FIRST closing fence rather than
 * swallowing a `---` rule further down the document.
 */
function frontmatterBlock(text) {
  return normalizeNewlines(text).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? null;
}

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
  const block = frontmatterBlock(text);
  if (block === null) return null;
  const booksSection = block.match(/^books:\n((?:[ \t]+-[^\n]+\n?)+)/m);
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
  return findMatches(text, /^## .+ — \*/gm).length;
}

/**
 * Count production decay risk sections in decay-risks.md.
 * Each risk section uses the pattern: ## Risk N: Title
 */
export function countProductionRisks(text) {
  return findMatches(text, /^## Risk \d+:/gm).length;
}

/**
 * Count test decay risk sections in test-decay-risks.md.
 * Each risk section uses the pattern: ## Risk TN: Title
 */
export function countTestRisks(text) {
  return findMatches(text, /^## Risk T\d+:/gm).length;
}

/**
 * Extract the latest version string from CHANGELOG.md.
 * Returns null if no version header is found.
 */
export function extractChangelogVersion(text) {
  return normalizeNewlines(text).match(/^## \[(.+?)\] - /m)?.[1] ?? null;
}

/**
 * Extract the newest release section from CHANGELOG.md — everything from the
 * first `## [version] - date` heading up to the next one. Returns "" when the
 * file has no version heading at all.
 */
export function extractChangelogSection(text) {
  const body = normalizeNewlines(text);
  const headings = [...body.matchAll(/^## \[.+?\] - /gm)];
  if (headings.length === 0) return "";
  // slice(start, undefined) runs to the end — the newest-is-only-section case.
  return body.slice(headings[0].index, headings[1]?.index);
}

/**
 * Extract step labels from a guide file.
 * Matches: ### Step 1, ### Step 2a, ### Step 6b, ### Step 0, etc.
 * Returns: ["1", "2a", "6b", ...] — the label portion only.
 */
export function extractGuideStepLabels(text) {
  return findMatches(text, /^### Step (\d+[a-z]?)/gm)
    .map(m => m.replace(/^### Step /, ""));
}

/**
 * True when a SKILL.md frontmatter opts the skill into OpenCode's `/` menu.
 *
 * OpenCode v2 reads `metadata.opencode/slash` (skill-file.ts →
 * `metadataBoolean(frontmatter.metadata, "opencode/slash")`); without it the
 * skill is reachable only via `/skills` or `@name`. `"true"` is the canonical
 * spelling, but YAML's bare `true` parses to the same boolean, so both pass.
 *
 * Expected frontmatter shape:
 *   metadata:
 *     opencode/slash: "true"
 */
export function hasOpencodeSlashFlag(text) {
  const metadata = (frontmatterBlock(text) ?? "").match(/^metadata:\n((?:[ \t]+[^\n]*\n?)+)/m)?.[1] ?? "";
  return /^[ \t]+opencode\/slash:[ \t]*["']?true["']?[ \t]*$/m.test(metadata);
}

export const PRODUCTION_RISK_COUNT = 6;
export const TEST_RISK_COUNT = 6;
