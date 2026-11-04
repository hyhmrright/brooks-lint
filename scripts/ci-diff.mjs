import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Resolve the review input before any model call; git failures are never empty diffs. */
export function readCiDiff({ projectDir, baseRef, headRef, env = process.env }) {
  for (const [name, ref] of [["base-ref", baseRef], ["head-ref", headRef]]) {
    if (ref !== undefined && (typeof ref !== "string" || !ref.trim())) throw new Error(`--${name} requires a non-empty git ref`);
  }
  const git = (...args) => execFileSync("git", args, {
    cwd: projectDir, encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
  const resolve = (ref) => {
    if (typeof ref !== "string" || !ref.trim()) throw new Error("A non-empty git ref is required");
    try { return git("rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`); }
    catch { throw new Error(`Cannot resolve git ref '${ref}'. Fetch the base and head commits (actions/checkout fetch-depth: 0).`); }
  };
  const isPR = env.GITHUB_EVENT_NAME?.startsWith("pull_request") || Boolean(env.GITHUB_BASE_REF);
  if (isPR) {
    let pr;
    if (env.GITHUB_EVENT_PATH) {
      try { pr = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8")).pull_request; }
      catch (error) { throw new Error("Cannot read GitHub pull request event", { cause: error }); }
    }
    baseRef ??= pr?.base?.sha;
    headRef ??= pr?.head?.sha;
    if (!baseRef || !headRef) throw new Error("PR review requires base/head SHAs from the GitHub event or explicit --base-ref and --head-ref.");
  }
  const result = (diff, scope, base = null) => ({ status: diff.trim() ? "ready" : "skipped", diff, scope, baseRef: base });
  const diff = (...args) => git("diff", "--no-ext-diff", "--no-textconv", ...args);
  if (!isPR && baseRef === undefined && headRef === undefined) {
    const staged = diff("--cached");
    if (staged.trim()) return result(staged, "staged changes (git diff --cached)");
    const unstaged = diff();
    if (unstaged.trim()) return result(unstaged, "unstaged changes (git diff)");
  }
  if (!baseRef) {
    let defaultRef;
    try { defaultRef = git("symbolic-ref", "refs/remotes/origin/HEAD"); } catch { /* local repositories may have no remote */ }
    for (const candidate of [defaultRef, "origin/main", "main", "origin/master", "master"].filter(Boolean)) {
      try { resolve(candidate); baseRef = candidate; break; } catch { /* try the next local base candidate */ }
    }
    if (!baseRef) throw new Error("No comparison base is available. Fetch the base or pass --base-ref explicitly.");
  }
  headRef ??= "HEAD";
  const base = resolve(baseRef);
  const head = resolve(headRef);
  try {
    return result(diff(`${base}...${head}`), `branch changes ${baseRef}...${headRef}`, base);
  } catch (error) {
    throw new Error(`Cannot read diff ${baseRef}...${headRef}; fetch complete history and a common ancestor.`, { cause: error });
  }
}
