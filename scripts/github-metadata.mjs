/** Reconcile version-independent GitHub release metadata without deleting other labels. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function metadataDifferences(config, repo, labels) {
  const differences = [];
  if (repo.description !== config.description) differences.push("About description");
  if (repo.homepage !== config.homepage) differences.push("About homepage");
  if (JSON.stringify([...(repo.topics ?? [])].sort()) !== JSON.stringify([...config.topics].sort())) differences.push("repository topics");
  for (const expected of config.labels) {
    const actual = labels.find((label) => label.name === expected.name);
    if (!actual || actual.color.toLowerCase() !== expected.color.toLowerCase() || actual.description !== expected.description) {
      differences.push(`label: ${expected.name}`);
    }
  }
  return differences;
}

function main() {
  const mode = process.argv.slice(2);
  if (mode.length > 1 || (mode.length === 1 && !["--apply", "--check"].includes(mode[0]))) throw new Error("Usage: npm run github:metadata -- [--check|--apply]");
  const config = JSON.parse(readFileSync(new URL("../.github/repository-metadata.json", import.meta.url), "utf8"));
  if (config.topics.length > 20 || new Set(config.topics).size !== config.topics.length) throw new Error("GitHub requires at most 20 unique topics");
  const gh = (args, body) => execFileSync("gh", args, { encoding: "utf8", input: body === undefined ? undefined : JSON.stringify(body) });
  if (mode[0] === "--apply") {
    gh(["api", `repos/${config.repository}`, "--method", "PATCH", "--input", "-"], { description: config.description, homepage: config.homepage });
    gh(["api", `repos/${config.repository}/topics`, "--method", "PUT", "--input", "-"], { names: config.topics });
    for (const label of config.labels) gh(["label", "create", label.name, "--repo", config.repository,
      "--color", label.color, "--description", label.description, "--force"]);
  }
  const repo = JSON.parse(gh(["api", `repos/${config.repository}`]));
  const labels = JSON.parse(gh(["label", "list", "--repo", config.repository, "--limit", "1000", "--json", "name,color,description"]));
  const differences = metadataDifferences(config, repo, labels);
  if (differences.length) throw new Error(`GitHub metadata differs: ${differences.join(", ")}`);
  console.log(`GitHub About, topics, and ${config.labels.length} managed labels match ${config.repository}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
