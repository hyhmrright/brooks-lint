/** Fail closed unless GitHub Validate has passed for this exact, clean commit. */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export function successfulRun(runs, sha) {
  const run = runs.find((candidate) => candidate.headSha === sha);
  if (!run || run.status !== "completed" || run.conclusion !== "success") {
    throw new Error(`Release blocked: Validate has not succeeded for ${sha}${run?.url ? ` (${run.url})` : ""}`);
  }
  return run;
}

function main() {
  const cwd = fileURLToPath(new URL("../", import.meta.url));
  const command = (program, args) => execFileSync(program, args, { cwd, encoding: "utf8" }).trim();
  if (command("git", ["status", "--porcelain"])) throw new Error("Release blocked: commit all release files before publishing");
  const sha = command("git", ["rev-parse", "HEAD"]);
  const runs = JSON.parse(command("gh", ["run", "list", "--repo", "hyhmrright/brooks-lint", "--workflow", "validate.yml",
    "--commit", sha, "--limit", "20", "--json", "databaseId,headSha,status,conclusion,url"]));
  const run = successfulRun(runs, sha);
  const { jobs } = JSON.parse(command("gh", ["run", "view", String(run.databaseId), "--repo", "hyhmrright/brooks-lint", "--json", "jobs"]));
  if (!jobs.length || jobs.some((job) => job.conclusion !== "success")) throw new Error("Release blocked: not every Validate job succeeded");
  command(process.execPath, [fileURLToPath(new URL("./github-metadata.mjs", import.meta.url)), "--check"]);
  console.log(`Release CI passed: ${sha} — ${run.url}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
