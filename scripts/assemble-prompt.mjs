import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Canonical mode registry: mode → [skill directory, ...guide filenames].
 * Adding a mode here is the only edit needed — VALID_MODES derives from it, and
 * validate-repo.mjs checks step continuity for every guide listed.
 *
 * A mode may carry more than one guide. Interactively, SKILL.md tells the agent
 * to read the secondary guide on demand; in the CI and eval paths there is no
 * on-demand read, so every guide the mode can dispatch to has to be in the
 * assembled system prompt or the mode simply does not exist there.
 */
export const GUIDE_BY_MODE = {
  review: ["brooks-review", "pr-review-guide.md"],
  audit: ["brooks-audit", "architecture-guide.md", "onboarding-guide.md"],
  debt: ["brooks-debt", "debt-guide.md"],
  test: ["brooks-test", "test-guide.md"],
  health: ["brooks-health", "health-guide.md"],
  sweep: ["brooks-sweep", "sweep-guide.md"],
};

/** Canonical list of valid mode names — import from here to avoid drift. */
export const VALID_MODES = Object.keys(GUIDE_BY_MODE);

/**
 * Assemble the system prompt for a given brooks-lint mode.
 * Shared by: GitHub Action (ci-review.mjs) and Eval Runner (run-evals-live.mjs).
 *
 * @param {string} mode - one of VALID_MODES
 * @param {string} skillsDir - absolute path to skills/ directory
 * @returns {string} concatenated system prompt with --- separators
 */
export function assembleSystemPrompt(mode, skillsDir) {
  const sharedDir = path.join(skillsDir, "_shared");

  const read = (filePath) => readFileSync(filePath, "utf8");

  const sections = [
    read(path.join(sharedDir, "common.md")),
    read(path.join(sharedDir, "source-coverage.md")),
  ];

  // Add risk definitions based on mode
  if (mode === "test") {
    sections.push(read(path.join(sharedDir, "test-decay-risks.md")));
  } else if (mode === "health" || mode === "sweep") {
    sections.push(read(path.join(sharedDir, "decay-risks.md")));
    sections.push(read(path.join(sharedDir, "test-decay-risks.md")));
  } else {
    sections.push(read(path.join(sharedDir, "decay-risks.md")));
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
