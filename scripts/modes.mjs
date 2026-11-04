/** Shared mode contract for prompt assembly, fixtures, and tool-less runners. */
export const MODES = {
  review: { directory: "brooks-review", guides: ["pr-review-guide.md"], risks: ["R", "T"], runners: ["ci", "eval"] },
  audit: { directory: "brooks-audit", guides: ["architecture-guide.md", "onboarding-guide.md"], risks: ["R"], runners: ["eval"] },
  debt: { directory: "brooks-debt", guides: ["debt-guide.md"], risks: ["R"], runners: ["eval"] },
  test: { directory: "brooks-test", guides: ["test-guide.md"], risks: ["T"], runners: ["eval"] },
  health: { directory: "brooks-health", guides: ["health-guide.md"], risks: ["R", "T"], runners: ["eval"] },
  sweep: { directory: "brooks-sweep", guides: ["sweep-guide.md"], risks: ["R", "T"], runners: [] },
};

export const VALID_MODES = Object.keys(MODES);
export const GUIDE_BY_MODE = Object.fromEntries(Object.entries(MODES)
  .map(([mode, { directory, guides }]) => [mode, [directory, ...guides]]));

export function modesForRunner(runner) {
  return VALID_MODES.filter((mode) => MODES[mode].runners.includes(runner));
}

export function assertRunnerMode(mode, runner) {
  if (!Object.hasOwn(MODES, mode)) throw new Error(`Unknown mode: ${mode}. Valid modes: ${VALID_MODES.join(", ")}`);
  if (!MODES[mode].runners.includes(runner)) {
    throw new Error(`Mode '${mode}' is not supported by the ${runner} runner. Supported modes: ${modesForRunner(runner).join(", ")}. Use an interactive agent for repository access or edits.`);
  }
}

export function runnerInstructions(runner) {
  if (runner === "ci") return "Runner scope: review only the supplied diff. You have no tools or access to other files. Do not claim a full-codebase scan, edits, test execution, or history writes. Absence of test changes alone is not proof existing behavior lacks tests; report only evidence visible in this input.";
  if (runner === "eval") return "Runner scope: analyze only the supplied scenario and file contents. You have no tools. Do not claim to inspect other files, execute tests, modify files, or write history. State any evidence limitations; never invent missing repository context.";
  throw new Error(`Unknown runner: ${runner}`);
}
