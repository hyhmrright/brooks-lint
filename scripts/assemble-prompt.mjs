import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Assemble the system prompt for a given brooks-lint mode.
 * Shared by: GitHub Action (ci-review.mjs) and Eval Runner (run-evals-live.mjs).
 *
 * @param {string} mode - "review" | "audit" | "debt" | "test" | "health"
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
  } else if (mode === "health") {
    sections.push(read(path.join(sharedDir, "decay-risks.md")));
    sections.push(read(path.join(sharedDir, "test-decay-risks.md")));
  } else {
    sections.push(read(path.join(sharedDir, "decay-risks.md")));
  }

  // Add mode-specific guide
  const guideMap = {
    review: ["brooks-review", "pr-review-guide.md"],
    audit: ["brooks-audit", "architecture-guide.md"],
    debt: ["brooks-debt", "debt-guide.md"],
    test: ["brooks-test", "test-guide.md"],
    health: ["brooks-health", "health-guide.md"],
  };

  const [modeDir, guideFile] = guideMap[mode] ?? (() => { throw new Error(`Unknown mode: ${mode}`); })();
  sections.push(read(path.join(skillsDir, modeDir, guideFile)));

  return sections.join("\n\n---\n\n");
}
