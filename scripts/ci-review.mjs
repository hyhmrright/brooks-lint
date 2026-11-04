/**
 * CI entry point — reviews a supplied Git diff via Anthropic SDK.
 * Shared prompt assembly with run-evals-live.mjs (via assemble-prompt.mjs).
 *
 * Reads git diff from the project, assembles the system prompt for the mode,
 * injects the project `.brooks-lint.yaml` (see ci-config.mjs — this path has no
 * tools, so an uninjected config is an unapplied one),
 * calls Claude API, and outputs JSON { report, score, mode, scope, trend,
 * findings, previousScore, delta, truncated } to stdout. With --format sarif it
 * emits a SARIF 2.1.0 log instead (for GitHub Code Scanning); a truncated
 * report is annotated on stderr either way.
 *
 * Usage:
 *   node scripts/ci-review.mjs \
 *     --mode review \
 *     --model claude-sonnet-4-6 \
 *     --skills-dir ./skills \
 *     --project-dir /path/to/project \
 *     [--config-ref base|head] \
 *     [--base-ref <ref>] [--head-ref <ref>] \
 *     [--format json|sarif] \
 *     [--sarif-out brooks-lint.sarif] \
 *     [--max-tokens 4096]
 *
 * Environment:
 *   ANTHROPIC_API_KEY  required
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assembleSystemPrompt, VALID_MODES } from "./assemble-prompt.mjs";
import { assertRunnerMode, runnerInstructions } from "./modes.mjs";
import { readCiDiff } from "./ci-diff.mjs";
import {
  CONFIG_REFS,
  configSizeError,
  configSystemBlock,
  customRisksBlock,
  hasCustomRisks,
  loadProjectConfig,
} from "./ci-config.mjs";
import { readHistory, getTrend } from "./history.mjs";
import { countFindings, parseReport } from "./report-parse.mjs";
import { reportToSarif } from "./sarif.mjs";
import { parseArgs, parseMaxTokens, maxTokensError, warnIfTruncated } from "./cli-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = parseArgs(process.argv.slice(2));

const mode = args.mode ?? "review";
const model = args.model ?? "claude-sonnet-4-6";
const format = args.format ?? "json";
const configRef = args["config-ref"] ?? "base";
const maxTokens = parseMaxTokens(args["max-tokens"]);
const skillsDir = path.resolve(args["skills-dir"] ?? path.join(__dirname, "..", "skills"));
const projectDir = path.resolve(args["project-dir"] ?? process.cwd());
const toolVersion = JSON.parse(
  readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
).version;

if (!VALID_MODES.includes(mode)) {
  console.error(`Unknown mode: ${mode}. Valid modes: ${VALID_MODES.join(", ")}`);
  process.exit(1);
}
try { assertRunnerMode(mode, "ci"); }
catch (error) { console.error(error.message); process.exit(1); }

if (!["json", "sarif"].includes(format)) {
  console.error(`Unknown format: ${format}. Valid formats: json, sarif`);
  process.exit(1);
}

if (!CONFIG_REFS.includes(configRef)) {
  console.error(`Unknown config-ref: ${configRef}. Valid values: ${CONFIG_REFS.join(", ")}`);
  process.exit(1);
}

if (maxTokens === null) {
  console.error(maxTokensError(args["max-tokens"]));
  process.exit(1);
}

// ── Main ──────────────────────────────────────────────────────────────────────
let input;
try { input = readCiDiff({ projectDir, baseRef: args["base-ref"], headRef: args["head-ref"] }); }
catch (error) { console.error(JSON.stringify({ error: error.message, mode })); process.exit(1); }
const { diff, scope } = input;
if (input.status === "skipped") {
  if (format === "sarif") {
    console.error("No diff to review; SARIF was not generated.");
  } else {
    console.log(JSON.stringify({ status: "skipped", reason: "No changes in the selected diff", report: "", score: null, mode, scope, findings: { critical: 0, warning: 0, suggestion: 0 } }));
  }
  process.exit(0);
}

// The project config goes in its own system block rather than through
// assembleSystemPrompt(): that function is shared with run-evals-live.mjs and
// stays a pure function of (mode, skillsDir), and a system block keeps policy
// out of the user message, which carries the untrusted diff.
let projectConfig;
try {
  projectConfig = loadProjectConfig({ projectDir, configRef, baseRef: input.baseRef });
} catch (err) {
  console.error(JSON.stringify({ error: err.message, mode, scope }, null, 2));
  process.exit(1);
}

if (projectConfig.content) {
  const sizeError = configSizeError(projectConfig.content);
  if (sizeError) {
    console.error(JSON.stringify({ error: sizeError, mode, scope }, null, 2));
    process.exit(1);
  }
}

const systemBlocks = [
  { type: "text", text: assembleSystemPrompt(mode, skillsDir) },
  { type: "text", text: configSystemBlock(projectConfig) },
  { type: "text", text: runnerInstructions("ci") },
];

// common.md makes custom-risks-guide.md a conditional read; CI has no on-demand
// read, so the condition has to be mirrored here or `Cx` codes arrive undefined.
if (projectConfig.content && hasCustomRisks(projectConfig.content)) {
  const guide = customRisksBlock(skillsDir);
  if (guide) systemBlocks.push({ type: "text", text: guide });
}

const userMessage = `Run brooks-lint ${mode} mode on the following diff.\n\nScope: ${scope}\n\n\`\`\`diff\n${diff}\n\`\`\``;

let message;
try {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemBlocks,
    messages: [{ role: "user", content: userMessage }],
  });
} catch (err) {
  console.error(JSON.stringify({ error: err.message, mode, scope }, null, 2));
  process.exit(1);
}

// Truncation is diagnostic output only; it cannot produce a passing CI result.
const truncated = warnIfTruncated(message);

const report = message.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");

const parsed = parseReport(report, { mode });
if (truncated || !parsed.valid) {
  console.error(JSON.stringify({ status: "incomplete", error: truncated ? "Model response was truncated" : "Invalid review report", errors: parsed.errors, mode, scope, report }));
  process.exit(1);
}
const score = parsed.score;

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
    { status: "complete", report, score, mode, scope, trend: trendNote, findings, previousScore, delta, truncated },
    null,
    2,
  ));
}
