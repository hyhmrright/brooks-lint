/**
 * Health score history utilities.
 *
 * Reads and writes .brooks-lint-history.json in the project root.
 * Each record: { date, mode, score, findings: { critical, warning, suggestion }, scope }
 *
 * Run:  node scripts/history.mjs [projectRoot]
 *       Prints the history for projectRoot (default: cwd).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HISTORY_FILE = ".brooks-lint-history.json";

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
 * Returns null if no prior records exist for the mode.
 * Returns { lastScore, runCount } where lastScore is the most recent prior score.
 */
export function getTrend(history, mode) {
  const modeHistory = history.filter(r => r.mode === mode);
  if (modeHistory.length === 0) return null;
  return {
    lastScore: modeHistory[modeHistory.length - 1].score,
    runCount: modeHistory.length,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const projectRoot = process.argv[2] ?? process.cwd();
  const history = readHistory(projectRoot);
  if (history.length === 0) {
    console.log("No history found.");
  } else {
    console.log(JSON.stringify(history, null, 2));
  }
}
