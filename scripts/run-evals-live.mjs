/**
 * Live eval runner — executes skill prompts against Claude API and validates output.
 * Shares system-prompt assembly with ci-review.mjs (via assemble-prompt.mjs).
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs
 *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --risk R1
 *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --id 5
 *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --mode review
 *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --model claude-opus-4-6
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { assembleSystemPrompt, VALID_MODES } from "./assemble-prompt.mjs";
import { parseArgs } from "./cli-utils.mjs";
import { extractRiskCodes, classify } from "./eval-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const filterRisk = args.risk ?? null;
const filterId   = args.id ? parseInt(args.id, 10) : null;
const filterMode = args.mode ?? null;
const model      = args.model ?? "claude-sonnet-4-6";
const skillsDir  = path.join(root, "skills");

if (filterMode && !VALID_MODES.includes(filterMode)) {
  console.error(`Unknown mode: ${filterMode}. Valid modes: ${VALID_MODES.join(", ")}`);
  process.exit(1);
}

// ── Load scenarios ────────────────────────────────────────────────────────────

const scenarioData = JSON.parse(readFileSync(path.join(root, "evals/evals.json"), "utf8"));
let scenarios = scenarioData.evals;

if (filterId !== null) scenarios = scenarios.filter((s) => s.id === filterId);
if (filterMode)        scenarios = scenarios.filter((s) => s.mode === filterMode);
if (filterRisk)        scenarios = scenarios.filter((s) => s.expected_output.includes(filterRisk));

if (scenarios.length === 0) {
  console.error("No scenarios match the given filters.");
  process.exit(1);
}

console.log(`Running ${scenarios.length} scenario(s) with model ${model}...\n`);

// ── Prompt assembly cache — one per mode ──────────────────────────────────────

const promptCache = {};
function getSystemPrompt(mode) {
  if (!promptCache[mode]) promptCache[mode] = assembleSystemPrompt(mode, skillsDir);
  return promptCache[mode];
}


// ── Run scenarios ─────────────────────────────────────────────────────────────

const client = new Anthropic();
const results = [];

for (const scenario of scenarios) {
  process.stdout.write(`  #${scenario.id} ${scenario.name} (${scenario.mode})... `);

  const systemPrompt = getSystemPrompt(scenario.mode);
  const userMessage  = scenario.files?.length
    ? `${scenario.prompt}\n\nFiles:\n${scenario.files.map((f) => `**${f.path}**\n\`\`\`\n${f.content}\n\`\`\``).join("\n\n")}`
    : scenario.prompt;

  let aiText = "";
  let verdict = "fail";
  let error = null;

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    aiText  = message.content[0]?.text ?? "";
    verdict = classify(scenario, aiText);
  } catch (err) {
    error   = err.message;
    verdict = "error";
  }

  process.stdout.write(`${verdict}\n`);
  results.push({ id: scenario.id, name: scenario.name, mode: scenario.mode, verdict, error });
}

// ── Summary report ────────────────────────────────────────────────────────────

const counts = { pass: 0, partial: 0, fail: 0, "false-positive-pass": 0, error: 0 };
for (const r of results) counts[r.verdict]++;

const total    = results.length;
const passRate = Math.round(((counts.pass + counts["false-positive-pass"]) / total) * 100);

console.log("\nBrooks-Lint Eval Report");
console.log("═══════════════════════");
console.log(`Total    : ${total}`);
console.log(`Pass     : ${counts.pass}`);
console.log(`FP-Pass  : ${counts["false-positive-pass"]}`);
console.log(`Partial  : ${counts.partial}`);
console.log(`Fail     : ${counts.fail}`);
if (counts.error) console.log(`Error    : ${counts.error}`);
console.log(`Pass rate: ${passRate}%`);

// Per-risk accuracy — single pass over scenarios
const riskTotals = {};
const riskPasses = {};
const resultById = Object.fromEntries(results.map((r) => [r.id, r]));
for (const scenario of scenarios) {
  const r = resultById[scenario.id];
  for (const code of extractRiskCodes(scenario.expected_output)) {
    riskTotals[code] = (riskTotals[code] ?? 0) + 1;
    if (r.verdict === "pass" || r.verdict === "false-positive-pass") {
      riskPasses[code] = (riskPasses[code] ?? 0) + 1;
    }
  }
}

if (Object.keys(riskTotals).length > 0) {
  console.log("\nPer-risk accuracy:");
  for (const code of Object.keys(riskTotals).sort()) {
    const p = riskPasses[code] ?? 0;
    const t = riskTotals[code];
    console.log(`  ${code}: ${p}/${t} (${Math.round((p / t) * 100)}%)`);
  }
}

const failed = results.filter((r) => r.verdict === "fail" || r.verdict === "error");
if (failed.length > 0) {
  console.log("\nFailed scenarios:");
  for (const r of failed) {
    const detail = r.error ? `: ${r.error}` : "";
    console.log(`  #${r.id} ${r.name}${detail}`);
  }
}

if (counts.fail > 0 || counts.error > 0) process.exit(1);
