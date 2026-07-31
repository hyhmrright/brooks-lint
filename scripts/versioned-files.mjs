/**
 * Canonical inventory of the non-manifest files that carry the release version.
 *
 * bump-version.mjs writes them and validate-repo.mjs asserts them, both from
 * this list — so a file can never be bumped without being validated, and a new
 * translated README is picked up by both sides the moment it lands on disk.
 */

import { readdirSync } from "node:fs";

// README.md plus every localized sibling (README.zh-CN.md, README.ja.md, …).
const README_FILE_RE = /^README(\.[A-Za-z]{2}(-[A-Za-z]{2,4})?)?\.md$/;

// The docs site advertises the version through its JSON-LD SoftwareApplication.
export const SITE_METADATA_FILE = "docs/index.html";
export const SOFTWARE_VERSION_RE = /("softwareVersion":\s*")[\d.]+(")/;

export const VERSION_BADGE_RE = /version-[\d.]+?-blue\.svg/g;

export function versionBadge(version) {
  return `version-${version}-blue.svg`;
}

export function readmeFiles(root) {
  return readdirSync(root)
    .filter((entry) => README_FILE_RE.test(entry))
    .sort();
}
