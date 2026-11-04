# Real Codex behavioral evaluation

`npm run evals:codex` compares the same natural task with and without the repository's six skills. It runs real, isolated Codex CLI sessions, then grades each final answer in a separate session that does not receive the experimental arm label or execution trace. This is distinct from the 64 structural scenarios, the frozen parser corpus, and the historical Anthropic API runner. It does not require an Anthropic key.

## Run

Use a file-backed ChatGPT login from `codex login` and a CLI supporting `--no-daemon`, `--ignore-user-config`, `--ignore-rules`, `debug prompt-input`, and `--output-schema` (initial pilot: 0.166.0). Keychain-only credentials and custom API providers are not currently supported. Model access depends on the logged-in account.

```bash
npm run evals:codex:validate            # offline: no login, network, or model calls
npm run evals:codex -- --model gpt-6-astra --reasoning high --runs 3
# Small exploratory run or one-case diagnosis:
npm run evals:codex -- --model gpt-6-astra --runs 1 --case review-rule-drift
```

Live runs consume the account's Codex allowance. Model selection is mandatory; reasoning defaults to `high`, repetitions to 3, and the per-process deadline to 240 seconds. Options: `--timeout SECONDS`, `--codex PATH`, `--auth-file PATH`, `--out NEW_DIRECTORY`. Output directories must be new so a rerun cannot overwrite evidence. The default `evals/codex/runs/` directory is ignored by Git. Offline repository checks do not start live runs.

## Isolation and evidence

Each answer and judge gets a fresh Git fixture, HOME, and CODEX_HOME. Only fixture files are present in both arms; the treatment additionally gets the checkout's `skills/` under `.agents/skills/`. No project AGENTS.md, parent checkout instructions, user config, installed user skills, plugins, hooks, apps, web search, or subagents are loaded. Bundled skills are disabled. Hosts with admin-installed skills are rejected. Authentication is copied into a private temporary directory and deleted after the session; it is never written into results. Transport proxy and certificate settings are retained, while arbitrary environment credentials are not inherited. SIGINT and SIGTERM cancel the active child process group and clean temporary credentials. Do not terminate the parent runner with SIGKILL: like any abrupt process death, this can prevent temporary-directory cleanup.

The runner captures `debug prompt-input` before execution and compares the complete developer-provided skill catalog with the expected six entries or an empty baseline catalog. Skill names in task or answer text are ignored. Both arms use the same explicit model and reasoning setting, with alternating arm order across cases/repetitions. Runs are serial, so load does not differ by arm. They use read-only sandboxing and approval mode `never`; the implementation negative control asks for code in the answer, not file edits.

Raw run directories contain prompt snapshots, JSONL events, stderr, final answers, judge outputs, `results.json`, and `summary.md`. Results record model, CLI version, fixture/skill/schema digests, trace hashes, observed reads, judgments, and errors. Snapshot paths contain ephemeral directories; inspect and sanitize raw artifacts before sharing. Credentials are excluded, but model-generated commands can still reveal host paths.

## What is measured

- **Trigger:** a completed, successful `cat`, `head`, `tail`, `sed`, or `awk` content-read command that outputs a skill's SKILL.md frontmatter and Setup body. A promise to use a skill, a filename listing, or a metadata-only search is insufficient. This conservative trace proxy can miss alternate read tools and does not prove instruction adherence.
- **Completion:** the case's requested assessment or answer was actually delivered. A plan or background-agent claim is incomplete. Baseline prose does not need Brooks headings, codes, scores, or citations.
- **Required-issue recall:** expected issues correctly identified divided by rubric issues. Clean controls have no expected issue and do not inflate recall.
- **False-positive fraction:** unsupported defect claims divided by all asserted findings. Additional supported issues are allowed. Uncertain findings are counted separately; this is not a population false-positive rate.
- **Severity calibration:** correctly calibrated explicit severity labels divided by labeled findings. Unlabeled findings remain separate and produce N/A when no denominator exists; they are not automatically errors. Non-trigger cases also track unsolicited reviews.

The judge receives the task, complete fixture, authored rubric, and answer. Exact evidence quotes, expected IDs, matched/missed consistency, and severity calibration against the allowed values for matched issues are validated deterministically. The judge shares the evaluated model, and arm labels are hidden rather than inherently unknowable (Brooks formatting can reveal them). Judge bias, repeated model error, and rubric limitations remain. Review individual answers and rationales; these scores are not human-certified truth.

Only pairs where **both** arms complete execution and valid judging enter comparative metrics. Timeouts, malformed logs, invalid judgments, and absent arms are reported as excluded pairs and make the live command exit nonzero. They never count as a win. Keep failure counts alongside scores; exclusion can bias comparisons. There are no automatic retries that silently select a better answer.

## Coverage and interpretation

The initial seven cases cover review, architecture audit, test review, local severity restraint, syntax explanation, and new implementation. They include executable policy divergence, missing branch coverage, mocked subjects, and a clean composition root. Unit tests verify the intended bugs and prove that defective mutants survive the deliberately weak test fixtures. Expected facts are authored before runs, not inferred from model output.

Debt, health, sweep, large repositories, custom risks, other languages, multilingual triggers, and cross-model generalization are not yet covered. A single repetition is an exploratory pilot, not statistical evidence of improvement. Use multiple repetitions and broader cases before setting a quality gate; do not adjust ground truth merely to improve observed scores.

The runner follows the official [skill evaluation workflow](https://developers.openai.com/blog/eval-skills), [non-interactive CLI guidance](https://developers.openai.com/codex/noninteractive), and [skill discovery/configuration rules](https://developers.openai.com/codex/skills). The frozen parser benchmark remains unchanged.

## Initial pilot

The [2026-11-04 exploratory comparison](../evals/codex/pilot-2026-11-04.md)
archives the first complete seven-pair run, including answers, model judgments,
fixture ground truth, and skill-read evidence. Its execution began before the
runner's QA hardening; every recorded catalog, judgment, trace hash, and aggregate
was subsequently checked with the final validators. The archive records both
source digests. This preserves the initial observations without rerunning cases
to select more favorable answers.

The [severity-calibration rerun](../evals/codex/calibration-2026-11-04.md)
uses the same seven cases, judge schema, judge prompt, model, reasoning, and one
repetition, with a fresh baseline. See the [prior diagnosis and rule changes](severity-calibration.md).
The original pilot is retained unchanged. Compare denominators and individual
findings: severity percentages can change when the number of findings changes.
