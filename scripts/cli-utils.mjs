/**
 * Shared CLI argument parsing, defaults, and output-ceiling reporting.
 * Used by: ci-review.mjs, run-evals-live.mjs, and the PR-comment step of
 * .github/actions/brooks-lint/action.yml (which imports TRUNCATION_NOTICE).
 */

/**
 * Ceiling on the model's output tokens, and the only place the number lives:
 * both scripts and the GitHub Action fall back to it rather than restating it.
 * A report that hits the ceiling is truncated, and truncation fails in the
 * wrong direction — fewer findings parse out, so the Health Score comes back
 * HIGHER and a fail-below gate can pass a run it should have failed.
 */
export const DEFAULT_MAX_TOKENS = 4096;

/**
 * Resolve a --max-tokens value to a positive integer, or null if it is not one.
 *
 * Null is the caller's cue to exit: parseArgs() yields the boolean `true` for a
 * flag whose next token is another flag (`--max-tokens --mode review`), and
 * `parseInt(true, 10)` is NaN — which would otherwise reach the API as an
 * opaque 400 instead of a message naming the flag the user got wrong.
 */
export function parseMaxTokens(raw) {
  if (raw === undefined) return DEFAULT_MAX_TOKENS;
  // Digits only: rejects the boolean `true`, negatives, decimals, "1e4", "8k".
  if (typeof raw !== "string" || !/^\d+$/.test(raw.trim())) return null;
  const value = parseInt(raw.trim(), 10);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** The message both scripts print for a --max-tokens value parseMaxTokens rejected. */
export function maxTokensError(raw) {
  // `true` means the flag was given with no value of its own.
  const got = raw === true ? "no value given" : JSON.stringify(raw);
  return `Invalid --max-tokens: ${got}. Must be a positive integer, e.g. --max-tokens ${DEFAULT_MAX_TOKENS}.`;
}

/**
 * What a run says when the model stopped because it ran out of output tokens.
 *
 * One wording, two readers: the workflow annotation ci-review.mjs writes to
 * stderr, and the PR comment action.yml posts — which imports this constant
 * rather than restating it, so the two can never drift into disagreeing about
 * what a truncated report means.
 *
 * Single line on purpose: GitHub parses a workflow command up to the first
 * newline, so an embedded one would truncate the warning about truncation.
 */
export const TRUNCATION_NOTICE =
  "brooks-lint's report hit the output ceiling and was cut off, so the Health Score is " +
  "unreliable and probably too high — findings that never arrived are never deducted from " +
  "it. Raise max-tokens and re-run before trusting this score or any gate built on it.";

/**
 * Emit a GitHub workflow annotation if a response was truncated, and report
 * whether it was.
 *
 * On stderr, never stdout: action.yml redirects ci-review.mjs's stdout into
 * brooks-lint-report.json, so a workflow command written there would land
 * inside the JSON file and never reach the workflow log. GitHub reads these
 * commands from a step's stderr too, which makes console.error the one channel
 * that works on both paths.
 *
 * This helper emits an annotation only. Callers reject truncated output before
 * producing a successful CI result or a passing eval verdict.
 *
 * @param {{stop_reason?: string}|null|undefined} message an Anthropic Messages response
 * @returns {boolean} true when the response stopped at the output ceiling
 */
export function warnIfTruncated(message) {
  if (message?.stop_reason !== "max_tokens") return false;
  console.error(`::warning::${TRUNCATION_NOTICE}`);
  return true;
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
        args[key] = argv[i + 1];
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}
