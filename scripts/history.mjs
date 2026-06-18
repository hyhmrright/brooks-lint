/**
 * Health score history utilities.
 *
 * Reads and writes .brooks-lint-history.json in the project root.
 * Each record: { date, mode, score, findings: { critical, warning, suggestion }, scope }
 *
 * Run:  node scripts/history.mjs [projectRoot]          # readable trend view
 *       node scripts/history.mjs [projectRoot] --json    # raw JSON for tooling
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HISTORY_FILE = ".brooks-lint-history.json";

// Map the human-facing mode names the report template uses (common.md) onto the
// canonical CLI mode names. History records are written by the model and may use
// either form ("PR Review" vs "review"); ci-review.mjs queries with the canonical
// name. Normalizing both sides keeps getTrend from silently missing every record.
const MODE_ALIASES = {
  "pr review": "review",
  "architecture audit": "audit",
  "tech debt": "debt",
  "tech debt assessment": "debt",
  "test quality": "test",
  "test quality review": "test",
  "health dashboard": "health",
  "full sweep": "sweep",
};

export function normalizeMode(mode) {
  if (typeof mode !== "string") return mode;
  const key = mode.trim().toLowerCase();
  return MODE_ALIASES[key] ?? key;
}

/**
 * Read history from .brooks-lint-history.json.
 * Returns empty array if the file does not exist or contains invalid JSON.
 */
export function readHistory(projectRoot) {
  try {
    return JSON.parse(readFileSync(path.join(projectRoot, HISTORY_FILE), "utf8"));
  } catch {
    return [];
  }
}

/**
 * Append a record to .brooks-lint-history.json, creating the file if needed.
 */
export function appendHistory(projectRoot, record) {
  const history = readHistory(projectRoot);
  history.push(record);
  writeFileSync(
    path.join(projectRoot, HISTORY_FILE),
    JSON.stringify(history, null, 2) + "\n",
  );
}

/**
 * Get trend info for a mode from a history array (not including the current run).
 * Mode matching is alias-tolerant (see normalizeMode), so a canonical query like
 * "review" still matches records stored as "PR Review".
 * Returns null if no prior records exist for the mode.
 * Returns { lastScore, runCount } where lastScore is the most recent prior score.
 */
export function getTrend(history, mode) {
  const target = normalizeMode(mode);
  const modeHistory = history.filter(r => normalizeMode(r.mode) === target);
  if (modeHistory.length === 0) return null;
  return {
    lastScore: modeHistory[modeHistory.length - 1].score,
    runCount: modeHistory.length,
  };
}

/**
 * Render a sequence of 0–100 scores as a unicode sparkline.
 */
export function sparkline(scores) {
  const bars = "▁▂▃▄▅▆▇█";
  return scores
    .map(s => {
      const clamped = Math.max(0, Math.min(100, s));
      return bars[Math.round((clamped / 100) * (bars.length - 1))];
    })
    .join("");
}

/**
 * Render the whole history as a per-mode trend summary (one line per mode).
 */
export function renderHistory(history) {
  if (history.length === 0) return "No history found.";

  const byMode = new Map();
  for (const r of history) {
    const m = normalizeMode(r.mode);
    if (!byMode.has(m)) byMode.set(m, []);
    byMode.get(m).push(r);
  }

  const lines = [`Brooks-Lint Health History — ${history.length} record(s)`, ""];
  for (const [mode, records] of byMode) {
    const scores = records.map(r => r.score).filter(s => typeof s === "number");
    if (scores.length === 0) continue;
    const latest = scores[scores.length - 1];
    const delta = latest - scores[0];
    const trend = scores.length > 1
      ? `${delta >= 0 ? "+" : ""}${delta} over ${scores.length} runs`
      : "1 run";
    lines.push(`${mode.padEnd(8)} ${sparkline(scores)}  latest ${latest}/100  (${trend})`);
  }
  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cliArgs = process.argv.slice(2);
  const asJson = cliArgs.includes("--json");
  const projectRoot = cliArgs.find(a => !a.startsWith("--")) ?? process.cwd();
  const history = readHistory(projectRoot);
  console.log(asJson ? JSON.stringify(history, null, 2) : renderHistory(history));
}
