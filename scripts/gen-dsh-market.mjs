/** Publish a DSH market entry only after the exact local release exists on npm. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function buildMarket(local, registry) {
  const published = registry.versions?.[local.version];
  const timestamp = Date.parse(registry.time?.[local.version]);
  if (registry.name !== local.name || published?.name !== local.name || published.version !== local.version) {
    throw new Error(`npm has not published ${local.name}@${local.version}`);
  }
  if (!Number.isFinite(timestamp) || !published.dsh?.bundle?.patch) {
    throw new Error("Published package needs a publication time and dsh.bundle.patch");
  }
  return {
    format: 1,
    title: "brooks-lint",
    description: "Official brooks-lint coding-agent skills",
    plugins: [{
      name: local.name,
      title: "brooks-lint",
      description: published.description,
      author: "hyhmrright",
      homepage: "https://hyhmrright.github.io/brooks-lint/",
      repository: { url: "https://github.com/hyhmrright/brooks-lint" },
      metadata: { keywords: published.keywords },
      versions: [{
        version: published.version,
        publishTimestamp: Math.floor(timestamp / 1000),
        source: { type: "npm", registry: "https://registry.npmjs.org/" },
      }],
    }],
  };
}

async function main() {
  const local = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(local.name)}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`npm registry returned HTTP ${response.status}`);
  const market = buildMarket(local, await response.json());
  const directory = new URL("../docs/dsh/", import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("index.json", directory), JSON.stringify(market, null, 2) + "\n");
  console.log(`Generated market for ${local.name}@${local.version}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
