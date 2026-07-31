// Propagates the version from package.json to all other manifests and README.
// Run after manually bumping version in package.json.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readmeFiles,
  versionBadge,
  VERSION_BADGE_RE,
  SITE_METADATA_FILE,
  SOFTWARE_VERSION_RE,
} from "./versioned-files.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const readJson = (rel) => JSON.parse(readFileSync(path.join(root, rel), "utf8"));
const writeJson = (rel, obj) =>
  writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + "\n", "utf8");

const version = readJson("package.json").version;
console.log(`Bumping all manifests to ${version}…`);

const manifests = [
  { rel: ".claude-plugin/plugin.json",      update: (o) => { o.version = version; } },
  { rel: ".claude-plugin/marketplace.json", update: (o) => { o.plugins[0].version = version; } },
  { rel: ".codex-plugin/plugin.json",       update: (o) => { o.version = version; } },
  { rel: "gemini-extension.json",           update: (o) => { o.version = version; } },
];
for (const { rel, update } of manifests) {
  const obj = readJson(rel);
  update(obj);
  writeJson(rel, obj);
  console.log(`  ✓ ${rel}`);
}

for (const readmeRel of readmeFiles(root)) {
  let readme = readFileSync(path.join(root, readmeRel), "utf8");
  readme = readme.replace(VERSION_BADGE_RE, versionBadge(version));
  writeFileSync(path.join(root, readmeRel), readme, "utf8");
  console.log(`  ✓ ${readmeRel} badge`);
}

let siteMetadata = readFileSync(path.join(root, SITE_METADATA_FILE), "utf8");
siteMetadata = siteMetadata.replace(SOFTWARE_VERSION_RE, `$1${version}$2`);
writeFileSync(path.join(root, SITE_METADATA_FILE), siteMetadata, "utf8");
console.log(`  ✓ ${SITE_METADATA_FILE} softwareVersion`);

console.log(`\nAll manifests updated to ${version}. Run npm run validate to confirm.`);
