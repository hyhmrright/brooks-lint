/**
 * Where the version appears as a literal string inside text files, and how it
 * should read at the current version.
 *
 * Shared by bump-version.mjs (which rewrites these) and validate-repo.mjs
 * (which fails the build when one falls behind), so the two can never disagree
 * about what carries a version. Keeping a separate list in each is exactly what
 * let the localized README badges — and then the docs landing page's JSON-LD —
 * go stale unnoticed: propagation and validation shared the same blind spot.
 *
 * Files are discovered from disk, so a new translation or docs page is covered
 * on arrival. Structured manifests (package.json and the four plugin manifests)
 * are NOT here: they hold the version in a real JSON field and are read/written
 * as JSON, not by pattern.
 */

import { readdirSync } from "node:fs";
import path from "node:path";

const KINDS = [
  {
    // Shields.io badge at the top of every README translation.
    dir: ".",
    include: (f) => f.startsWith("README") && f.endsWith(".md"),
    pattern: /version-[\d.]+-blue\.svg/g,
    render: (v) => `version-${v}-blue.svg`,
    required: true,
  },
  {
    // schema.org SoftwareApplication metadata on the GitHub Pages site.
    // Only the landing page carries JSON-LD, hence not required.
    dir: "docs",
    include: (f) => f.endsWith(".html"),
    pattern: /"softwareVersion": "[\d.]+"/g,
    render: (v) => `"softwareVersion": "${v}"`,
    required: false,
  },
];

/**
 * Every version-bearing text file, as
 * `{ rel, pattern, expected, required }` — `expected` being the exact text each
 * `pattern` match should equal at `version`.
 */
export function versionRefs(root, version) {
  return KINDS.flatMap(({ dir, include, pattern, render, required }) =>
    readdirSync(path.join(root, dir))
      .filter(include)
      .sort()
      .map((file) => ({
        rel: path.join(dir, file),
        pattern,
        expected: render(version),
        required,
      })),
  );
}
