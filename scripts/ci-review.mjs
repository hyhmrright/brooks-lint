/**
 * CI entry point — runs a brooks-lint mode via Anthropic SDK.
 * Shared prompt assembly with run-evals-live.mjs (via assemble-prompt.mjs).
 *
 * Reads git diff from the project, assembles the system prompt for the mode,
 * calls Claude API, and outputs JSON { report, score, mode, scope, trend,
 * findings, previousScore, delta } to stdout. With --format sarif it emits a
 * SARIF 2.1.0 log instead (for GitHub Code Scanning).
 *
 * Usage:
 *   node scripts/ci-review.mjs \
 *     --mode review \
 *     --model claude-sonnet-4-6 \
 *     --skills-dir ./skills \
 *     --project-dir /path/to/project \
 *     [--format json|sarif] \
 *     [--sarif-out brooks-lint.sarif]
 *
 * Environment:
 *   ANTHROPIC_API_KEY  required
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { assembleSystemPrompt, VALID_MODES } from "./assemble-prompt.mjs";
import { readHistory, getTrend } from "./history.mjs";
import { countFindings } from "./report-parse.mjs";
import { reportToSarif } from "./sarif.mjs";
import { parseArgs } from "./cli-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = parseArgs(process.argv.slice(2));

const mode = args.mode ?? "review";
const model = args.model ?? "claude-sonnet-4-6";
const format = args.format ?? "json";
const skillsDir = path.resolve(args["skills-dir"] ?? path.join(__dirname, "..", "skills"));
const projectDir = path.resolve(args["project-dir"] ?? process.cwd());
const toolVersion = JSON.parse(
  readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
).version;

if (!VALID_MODES.includes(mode)) {
  console.error(`Unknown mode: ${mode}. Valid modes: ${VALID_MODES.join(", ")}`);
  process.exit(1);
}

if (!["json", "sarif"].includes(format)) {
  console.error(`Unknown format: ${format}. Valid formats: json, sarif`);
  process.exit(1);
}

// ── Read git diff ─────────────────────────────────────────────────────────────

function getGitDiff(projectRoot) {
  const run = (cmd, cmdArgs) => {
    try {
      return execFileSync(cmd, cmdArgs, { cwd: projectRoot, encoding: "utf8" });
    } catch {
      return "";
    }
  };

  const staged = run("git", ["diff", "--cached"]);
  if (staged.trim()) return { diff: staged, scope: "staged changes (git diff --cached)" };

  const unstaged = run("git", ["diff"]);
  if (unstaged.trim()) return { diff: unstaged, scope: "unstaged changes (git diff)" };

  const branch = run("git", ["diff", "main...HEAD"]);
  if (branch.trim()) return { diff: branch, scope: "branch changes vs main (git diff main...HEAD)" };

  return { diff: "", scope: "no diff detected — full codebase scan" };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const client = new Anthropic();

const { diff, scope } = getGitDiff(projectDir);
const systemPrompt = assembleSystemPrompt(mode, skillsDir);

const userMessage = diff
  ? `Run brooks-lint ${mode} mode on the following diff.\n\nScope: ${scope}\n\n\`\`\`diff\n${diff}\n\`\`\``
  : `Run brooks-lint ${mode} mode on this project.\n\nScope: ${scope}`;

let message;
try {
  message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
} catch (err) {
  console.error(JSON.stringify({ error: err.message, mode, scope }, null, 2));
  process.exit(1);
}

const report = message.content[0]?.text ?? "";

const scoreMatch = report.match(/Health\s+Score[:\s]+(\d+)/i);
const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

const findings = countFindings(report);

const trend = getTrend(readHistory(projectDir), mode);
const previousScore = trend ? trend.lastScore : null;
const delta = trend && score !== null ? score - previousScore : null;

let trendNote;
if (!trend) {
  trendNote = "First CI run — no trend data";
} else if (score === null) {
  trendNote = "Score unavailable — cannot compute trend";
} else {
  trendNote = delta === 0
    ? `Stable at ${score} over last ${trend.runCount} runs`
    : `${previousScore} → ${score} (${delta > 0 ? "+" : ""}${delta}) over last ${trend.runCount} runs`;
}

// SARIF is needed if either the stdout format is sarif or --sarif-out is set.
const needsSarif = format === "sarif" || args["sarif-out"];
const sarif = needsSarif
  ? JSON.stringify(reportToSarif(report, { mode, toolVersion }), null, 2)
  : null;

// --sarif-out writes a SARIF file regardless of the stdout format, so the Action
// can keep emitting JSON (for the PR comment + gates) and still upload SARIF.
if (args["sarif-out"]) {
  writeFileSync(path.resolve(args["sarif-out"]), sarif + "\n");
}

if (format === "sarif") {
  console.log(sarif);
} else {
  console.log(JSON.stringify(
    { report, score, mode, scope, trend: trendNote, findings, previousScore, delta },
    null,
    2,
  ));
}
