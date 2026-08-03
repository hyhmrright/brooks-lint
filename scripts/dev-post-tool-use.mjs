/**
 * Dev-only PostToolUse hook for working ON brooks-lint (not shipped to plugin users).
 *
 * Reads the Claude Code PostToolUse JSON payload from stdin and runs
 * `npm run validate` (manifest/badge/changelog/book-count/skill-step gate) when an
 * edit touches a drift-prone file. Local-test skill loading is handled separately
 * by a symlink (~/.claude/skills/brooks-lint -> repo skills/), not by this hook.
 *
 * Wired up from .claude/settings.local.json (maintainer-local, untracked):
 *   PostToolUse → command: node "$CLAUDE_PROJECT_DIR/scripts/dev-post-tool-use.mjs"
 *
 * Exit codes: 0 = clean/no-op; 2 = validate failed (stderr is fed back to Claude).
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ROOT_MANIFESTS = new Set([
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "AGENTS.md",
  "GEMINI.md",
  "gemini-extension.json",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".codex-plugin/plugin.json",
]);

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve("");
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
  });
}

function relPath(filePath) {
  if (!filePath) return null;
  const rel = path.relative(repoRoot, path.resolve(repoRoot, filePath));
  return rel.startsWith("..") ? null : rel;
}

const raw = await readStdin();
let rel = null;
try {
  rel = relPath(JSON.parse(raw)?.tool_input?.file_path);
} catch {
  process.exit(0); // not a JSON payload we understand — stay out of the way
}
if (!rel) process.exit(0);

if (!rel.startsWith("skills/") && !ROOT_MANIFESTS.has(rel)) process.exit(0);

try {
  execFileSync("npm", ["run", "validate"], { cwd: repoRoot, stdio: "pipe" });
} catch (err) {
  const out = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
  process.stderr.write(`brooks-lint validate failed after editing ${rel}:\n${out}\n`);
  process.exit(2); // surfaces to Claude so it can fix the drift it just introduced
}
