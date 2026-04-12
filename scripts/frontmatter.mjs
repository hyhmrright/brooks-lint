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
