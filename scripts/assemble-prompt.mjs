import { readFileSync } from "node:fs";
import path from "node:path";
import { MODES, GUIDE_BY_MODE } from "./modes.mjs";
export { GUIDE_BY_MODE, VALID_MODES } from "./modes.mjs";

/**
 * The registry in modes.mjs owns guides, risk catalogs and runner capabilities.
 * VALID_MODES derives from it, and
 * validate-repo.mjs checks step continuity for every guide listed.
 *
 * A mode may carry more than one guide. Interactively, SKILL.md tells the agent
 * to read the secondary guide on demand; in the CI and eval paths there is no
 * on-demand read, so every guide the mode can dispatch to has to be in the
 * assembled system prompt or the mode simply does not exist there.
 */

/**
 * Assemble the system prompt for a given brooks-lint mode.
 * Shared by: GitHub Action (ci-review.mjs) and Eval Runner (run-evals-live.mjs).
 *
 * @param {string} mode - one of VALID_MODES
 * @param {string} skillsDir - absolute path to skills/ directory
 * @returns {string} concatenated system prompt with --- separators
 */
export function assembleSystemPrompt(mode, skillsDir) {
  if (!Object.hasOwn(MODES, mode)) throw new Error(`Unknown mode: ${mode}`);
  const sharedDir = path.join(skillsDir, "_shared");

  const read = (filePath) => readFileSync(filePath, "utf8");

  const sections = [
    read(path.join(sharedDir, "common.md")),
    read(path.join(sharedDir, "source-coverage.md")),
  ];

  // Add risk definitions based on mode
  for (const prefix of MODES[mode].risks) {
    sections.push(read(path.join(sharedDir, prefix === "T" ? "test-decay-risks.md" : "decay-risks.md")));
  }

  // Add mode-specific guide(s)
  const entry = GUIDE_BY_MODE[mode];
  if (!entry) throw new Error(`Unknown mode: ${mode}`);
  const [modeDir, ...guideFiles] = entry;
  for (const guideFile of guideFiles) {
    sections.push(read(path.join(skillsDir, modeDir, guideFile)));
  }

  return sections.join("\n\n---\n\n");
}
