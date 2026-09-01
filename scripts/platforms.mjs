/**
 * Platform-inventory helpers shared by validate-repo.mjs and its tests.
 *
 * Nothing here hardcodes a platform or a translation. The platforms carrying an
 * install-table row are discovered from the docs/<name>-setup.md files on disk,
 * the documents that must show that table are discovered from README*.md, and
 * the installer's own list is parsed out of scripts/install.sh — so a new
 * platform, or a seventh language, is covered on arrival. Keeping a separate
 * hand-maintained list is what let the localized README badges go stale before
 * (see version-refs.mjs).
 */

import { readdirSync } from "node:fs";
import path from "node:path";

/**
 * Every document that carries the per-platform install table: all README
 * translations, plus the getting-started guide, which is the one non-README
 * page with a platform table of its own.
 */
export function platformDocs(root) {
  const readmes = readdirSync(root)
    .filter((file) => file.startsWith("README") && file.endsWith(".md"))
    .sort();
  return [...readmes, path.join("docs", "getting-started.md")];
}

/** Every per-platform setup guide, as bare filenames. */
export function setupGuides(root) {
  return readdirSync(path.join(root, "docs"))
    .filter((file) => file.endsWith("-setup.md"))
    .sort();
}

/**
 * Setup-guide filenames linked from one document, normalized so a README's
 * `docs/kiro-setup.md` and getting-started's sibling `kiro-setup.md` compare
 * equal. Returns a sorted, de-duplicated array.
 */
export function linkedSetupGuides(text) {
  const links = text.matchAll(/\((?:docs\/)?([a-z0-9-]+-setup\.md)\)/g);
  return [...new Set([...links].map((match) => match[1]))].sort();
}

/**
 * The `<platform> = …` line that tells a reader what `install.sh` accepts, plus
 * the line after it, since the getting-started copy wraps mid-list. Returns ""
 * when the document has no such line.
 *
 * This is the one place a platform has to be spelled out; a mere mention
 * anywhere in the document is worthless as a check, because most platforms are
 * named by their own install path (`~/.bob/skills` contains "bob") in a table
 * row that checkPlatformDocs already requires.
 */
export function platformEnumeration(text) {
  return text.match(/^.*<(?:platform|平台)>.*?[=∈].*(?:\n.*)?/m)?.[0] ?? "";
}

/**
 * Whether some text names a platform as a whole token rather than a substring,
 * so `pi` does not match "piper" and `bob` does not match "bob-setup.md". Splits
 * rather than building a regex out of PLATFORMS, which is unvalidated text.
 */
export function namesPlatform(text, platform) {
  return text.split(/[^a-z0-9-]+/).includes(platform);
}

/**
 * The installer's platform list plus the platforms each directory-mapping
 * function actually handles. A platform in PLATFORMS with no case arm fails
 * `install.sh <platform>` with "unknown platform"; a case arm missing from
 * PLATFORMS is invisible in --list and the help text.
 */
export function parseInstallerPlatforms(text) {
  const declared = text.match(/^PLATFORMS="([^"]*)"/m)?.[1].trim();
  return {
    declared: declared ? declared.split(/\s+/) : [],
    global: caseArms(text, "global_dir"),
    project: caseArms(text, "project_dir"),
  };
}

/** Platform names matched by the `case` arms of one shell function. */
function caseArms(text, fnName) {
  const body = text.match(new RegExp(`^${fnName}\\(\\) \\{$([\\s\\S]*?)^\\}$`, "m"))?.[1] ?? "";
  return [...body.matchAll(/^\s+([a-z][a-z0-9-]*)\)/gm)].map((match) => match[1]);
}
