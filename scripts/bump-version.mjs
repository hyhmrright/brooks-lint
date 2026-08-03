// Propagates the version from package.json to every other place that carries
// it: the plugin manifests, the README badges, and the docs site metadata.
// Run after manually bumping version in package.json.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { versionRefs } from "./version-refs.mjs";

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

// README badges and the docs JSON-LD. validate-repo.mjs checks the same list,
// so neither can drift out of sync with the other.
for (const { rel, pattern, expected } of versionRefs(root, version)) {
  const file = path.join(root, rel);
  const text = readFileSync(file, "utf8");
  // Candidates are discovered by directory, so some carry no version at all
  // (docs/gallery.html, docs/guide.html) — skip rather than rewrite untouched.
  if (!text.match(pattern)) continue;
  writeFileSync(file, text.replace(pattern, expected), "utf8");
  console.log(`  ✓ ${rel}`);
}

console.log(`\nAll manifests updated to ${version}. Run npm run validate to confirm.`);
