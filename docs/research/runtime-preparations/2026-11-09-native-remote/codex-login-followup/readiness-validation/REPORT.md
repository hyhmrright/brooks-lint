# Login readiness follow-up — QA gate

Verdict: **PASS for the offline implementation and the narrowly documented next single text-only login smoke.** This is not approval or evidence of real-model execution, remote-shell live readiness, a hard quota/cost cap, or the 81-answer study.

## Automated gate (executed in order)

1. `npm run validate`: exit 0, repository validation passed for 1.9.1. Changelog coverage explicitly not audited because v1.9.1 is already tagged.
2. `npm test`: exit 0, final Node test suite 895/895, no failures/skips. Earlier validation-helper and installer suites also passed in the same command.
3. `npm run evals`: exit 0, 64 structural scenarios valid.

Verbatim outputs: `login-qa-validate.log`, `login-qa-test.log`, `login-qa-evals.log` alongside this report.

Parent separately reports `evals:runtime:prepared` 537/537, parser benchmark 30/30, and Codex fixture validation 7/7. Those are additional checks, not substituted for the QA gate above.

## Cross-document comparisons

- package.json 1.9.1 equals .claude-plugin/plugin.json, the marketplace plugin entry, .codex-plugin/plugin.json and gemini-extension.json.
- All six README badge versions equal 1.9.1; docs/index.html JSON-LD softwareVersion and CHANGELOG.md first release section also equal 1.9.1.
- source-coverage.md frontmatter contains 12 books. README.md, AGENTS.md and GEMINI.md each say “twelve classic engineering books”.
- evals/evals.json contains 64 entries; both AGENTS.md scenario-count claims match.
- All six shipped SKILL.md frontmatter descriptions have the negative “Do NOT trigger for:” boundary; none was modified in this task.

## Task-specific comparison

- New live entry point refuses an implicit live run, a missing explicit model, mixed fixture/live routing, and existing output directories. It uses native Codex App Server with ChatGPT account verification and a fresh access-only auth home. The original refresh credential is excluded and original auth is preserved by regression coverage.
- Model requested/CLI-selected fields are supported by saved sanitized thread/start RPC evidence; provider identity remains explicitly unverified/null. The final local fixture binds the current launcher source SHA-256. The older preliminary fixture is retained separately and not presented as current-source evidence.
- The single fixed text prompt, no execution environments, activity rejection, 45-second deadline, output bound, and process-group/pipe/private-home cleanup match LOGIN-SMOKE.md. The documentation accurately states that this is not a provider-side request/token/dollar cap, nor a guarantee that every advertised stock tool is disabled.
- Stock-code-mode records are synthetic, preserve generated source bytes/hash, and show the intended positive/negative boundary: disabled host returns the explicit disabled error with no command; enabled host executes the command and returns WORKER. The assertion-source binding and mutation checks passed. This is not falsely attributed as the proven cause of the earlier live answer, or as real model output.
- No real inference was run by QA. No API keys, real account tokens, or real account identifiers were found in the newly archived synthetic evidence; capability-token RPC fields are redacted.

No blocking findings for the documented scope. The maintainer should be told that they may switch models for the **single text login smoke**, while the full shell smoke and formal study remain separate gates.
