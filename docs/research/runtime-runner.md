# Runtime research runner

Status: implemented research tooling, 2026-11-06. Deterministic fixtures and a
local fake CLI verified the tooling offline. A subsequent [real-model exploratory
study](runtime-results/2026-11-06-terra-37/README.md) records execution outcomes
and unresolved human review; the earlier [RT-01 pilot](runtime-results/2026-11-06-terra-pilot/README.md)
is reported separately.
See the [pilot plan](runtime-pilot-plan.md), [thirty-seven development cases](../../evals/research/runtime/README.md),
and [human review and independent holdouts procedure](runtime-review-and-holdouts.md).

## Scope and arms

This runner is separate from the shipped paired Codex behavioral runner. It accepts
only the revisioned runtime development catalog; neither runner's existing catalog
contract is weakened. Private holdout ingestion requires a separately reviewed
extension. No public risk code, score, production skill, or package release is added.

| Arm | Available catalog | Input |
| --- | --- | --- |
| A | Empty | Selected case's exact visible-input whitelist and natural task |
| B | Six unchanged core skills and shared framework | Same case and task |
| C | Same core plus `runtime-research` revision 1 | Same case and task |

The operator's explicit selection of C opts into making the experimental guidance
available. The natural task is identical across arms; no case answer, forced skill
invocation or special runtime hint is appended to C. The prototype is applicable
only to matching runtime-review requests. Its availability does not authorize a
runtime audit for a syntax request. Catalog presence and conservative observed
skill reads are distinct measurements; neither proves guidance was followed.

The runner rotates A/B/C starting order by case and repetition and executes serially.
Use an explicit model, reasoning setting, repetition count and per-process timeout.
One exploratory repetition and a later three-repetition study are separate plans;
neither is a statistically representative accuracy estimate.

## Offline validation and planning

Node.js 20 or later and Git are required. No new dependency is needed.

```bash
npm run evals:runtime:offline
npm run evals:runtime:research:validate
# Default mode is also validation; does not invoke Codex or read credentials.
npm run evals:runtime:research

# Planning writes frozen artifacts only. Replace MODEL with an explicit choice.
npm run evals:runtime:research -- --plan --model MODEL --runs 1 \
  --out evals/research/runtime/runs/plan-01
```

`--case RT-09` selects one case during planning; otherwise all thirty-seven are planned.
`--reasoning high` and `--timeout 240` are defaults. `--runs` accepts 1–100.
Plans record the source commit and dirty-worktree flag, exact natural prompts,
whitelisted inputs, private rubrics, core/prototype contents, manifest revision,
and SHA-256 content/tooling digests. Prefer a clean committed checkout for an
actual study. Files in the plan include private grading data and must never be
copied wholesale into a model workspace.

Planning and validation never start a CLI, including a version or prompt probe.
They work with a nonexistent `--codex` and missing credentials. Offline tests use
an executable fake with dummy authentication to verify the execution path; that
does not establish live CLI compatibility or model behavior.

## Live execution contract — a separate opt-in action

The following command is for an explicitly authorized study. Do not include it in
routine verification, CI or offline npm scripts.

```bash
npm run evals:runtime:research -- --live \
  --plan-file evals/research/runtime/runs/plan-01/plan.json \
  --out evals/research/runtime/runs/study-01
```

Live mode requires a frozen plan and a new output directory. It obtains model and
limits exclusively from that plan and rejects changed source artifacts, altered
plan contents, conflicting live settings and existing output directories. Use a
new plan after any case, rubric, guidance, core or tooling change. No implicit
retry overwrites a failed run; label any later recovery as a separate study.

Use a file-backed Codex login or `--auth-file /path/to/auth.json`; custom API
providers and keychain-only authentication are unsupported. The existing runner's
CLI integration is reused only for process, sanitized environment and catalog
parsing helpers, not its fixed paired catalog or judgment logic. Locally inspected
CLI help was version 0.166.0. Live execution records the actual CLI version and
fails closed on incompatible preflight/catalog output. The official
[non-interactive documentation](https://learn.chatgpt.com/docs/non-interactive-mode)
and [CLI reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
describe JSON events, ephemeral execution and read-only sandbox options. The
2026-11-06 study exercised this CLI path; its failures and the isolation limits
below remain part of the evidence, not proof of a hermetic environment.

Each turn gets fresh HOME/CODEX_HOME, a temporary Git repository with only the
input whitelist and selected catalog, approval mode `never`, read-only sandbox,
disabled web search, plugins, apps, hooks, bundled skills and multi-agent features.
User config/rules and project instructions are suppressed; preflight must discover
exactly zero/six/seven expected skills. Rubrics, metadata, tests and other cases
are not copied. A temporary authentication copy is removed in `finally`, along
with the temporary repository, on success, failure or interruption.

This is input/catalog isolation, not a hermetic operating-system boundary.
Read-only sandboxing does not prove that every host file is unreadable, and
preflight catalog checks do not establish all possible runtime context sources.
Use a clean dedicated host/container for a serious study; do not place private
holdout answers on a host available to the model. Case IDs and wording are visible,
and development data may already be known to a model. Claims of blinding must
reflect these limits.

## Evidence and semantic review

Raw directories under `evals/research/runtime/runs/` are ignored and private by
default. New directories are mode 0700 and generated files 0600. Keep them local
until inspected and sanitized; a custom `--out` is the operator's responsibility.

Execution writes `results.json`, exact prompts, prompt snapshots, process outcomes,
JSONL events, stderr and final answers. Failed preflights and partial failed turns
are retained. Failed turns never become successful restraint observations. A run
interruption leaves unattempted arms visible as `not-run`; CLI errors yield nonzero
exit status. Cost evidence includes elapsed time and token usage when emitted,
including available evidence for failures; absent usage is unknown, not zero.

`review-packets.json` contains successful answers, visible evidence and the same
frozen semantic rubrics for every arm, sorted by opaque packet ID. It omits arm
labels/catalogs/traces. A reviewer should receive only packets, not `results.json`;
answer wording can still reveal an arm. Packets are grading inputs, never review
model workspaces. `judgments-template.json` is an intentionally incomplete template,
not an automatic passing assessment. Copy it to a separate file and fill it in.

Use the same reviewer or independent semantic judging procedure across arms.
Any model reviewer must be invoked separately under explicit authorization, without
access to arm mappings, and labeled `method: "model"`. This runner does not launch
a judging model. Human inspection of every finding and abstention remains required
before interpreting study results. Agent QA of fixtures does not fulfill that gate.

For each judgment, fill in reviewer, method (`human`/`model`), task completion,
assessment (`defect`/`protected`/`unresolved`/`explanation`/`incomplete`), an exact
answer excerpt, unsupported-certainty and unsolicited-audit flags, and rationale.
Use `explanation` for a completed syntax response, not a runtime safety verdict.
Inspect every distinct asserted finding, including suggestions asserting a defect:

```json
{
  "quote": "exact excerpt from the answer",
  "expected_id": null,
  "support": "supported",
  "severity": "unspecified",
  "severity_ok": null,
  "evidence_complete": true,
  "reason": "Explain why supplied evidence supports the claim."
}
```

Use an expected issue ID only for a supported matching diagnosis; additional
supported issues may have `expected_id: null`. Other support values are
`unsupported` and `uncertain`. Severity is `Critical`, `Warning`, `Suggestion` or
`unspecified`; absent explicit severity requires `severity_ok: null`. List all
unmatched expected IDs in `missing_expected_ids`. Apply rubric reasoning, forbidden
claims and completion obligations semantically; do not require Brooks formatting,
public risk codes, book citations or numeric scores from arm A. An empty findings
list alone does not establish successful unresolved-context restraint.

```bash
npm run evals:runtime:research -- --summarize \
  --results evals/research/runtime/runs/study-01/results.json \
  --judgments /path/to/completed-judgments.json \
  --out evals/research/runtime/runs/review-01
```

Offline import checks packet/answer digests, quoted excerpts, issue matches,
missing IDs and severity consistency. It validates structure and internal
consistency, not the semantic truth of a human or model judgment. It preserves
the supplied judgments and input digests in a new output directory. Raw execution
results and previous review decisions remain unchanged.

Summaries report per-case/per-arm and aggregate recall, unsupported/uncertain
findings, evidence completeness, labeled/unlabeled severity, unresolved-context
restraint, unsolicited audits, observed reads and available costs. Direct A/B/C
comparisons include only complete executed-and-judged triplets. Excluded triplets,
individual-arm results and failures remain visible. Added expected issues in C
count only when correctly matched there and missed by B in the same triplet;
overlap is not new recall. Missing judgments, zero denominators and failed runs
cannot count as wins. Judgments and reviewer disagreements remain inspectable.

No summary automatically promotes the prototype. Source verification, human case
review, independent holdouts and an evidence-based decision remain outstanding.

The revision-7 manifest registers RT-01–RT-37. Plans contain 111 turns for one
repetition of all thirty-seven cases, or 333 for three repetitions; planning runs
no models. Context restraint metrics select every manifest case with
`kind: unresolved`: RT-07/08/13/16/19/22/25/28/31/34/37. Eleven controls distinguish
missing context from both demonstrated defects and bounded protection. The
prototype remains revision 1; expanding a challenge set does not assert guidance
coverage. Existing plans remain historical artifacts; freeze a new plan for the
expanded catalog.
