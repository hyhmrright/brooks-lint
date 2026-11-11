# Three-skill revision preflight QA — PASS (round 2)

The complete gate was rerun after the historical readiness boundary fix and the
completed-message collector correction. Round 1 remains preserved separately.
No live model calls, commits or pushes were made by QA.

## Automated gate

All six commands completed with exit 0, in order (`commands.json` and raw logs):

1. `npm run validate` — PASS.
2. `npm test` — PASS, 154.349 seconds. Includes the historical campaign/readiness
   tests, completed-message collector regressions, existing login studies, and
   the final 9/9 revision tests with the full 132-turn synthetic CLI exercise.
3. `npm run evals` — PASS, 64 structural scenarios.
4. `npm run benchmark` — PASS, severity fidelity 30/30, risk precision/recall100%,
   SARIF validity30/30.
5. `npm run evals:codex:validate` — PASS, 7 offline fixture schemas.
6. `git diff --check` — PASS.

## Cross-document and freeze checks

Thirty direct cross-document/byte checks passed: package version1.9.1 agrees with
four manifests, six README badges, landing-page JSON-LD and top CHANGELOG;
source inventory derives12 books matching README/AGENTS/GEMINI; actual evals64
matches AGENTS; six negative trigger boundaries remain present. No descriptions
changed, so a separate trigger audit is unnecessary. No release is requested.

The five original full/smoke/campaign frozen files remain byte-identical to
commit37fd5a2. Skill changes are exactly the three intended guide files.

Final new freeze:
`2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`
(protocol revision2).

The audit independently compared all A guidance with pinned37fd5a2 Git content,
all B guidance with current files and snapshot hashes, and found exactly the
intended three guide differences. The 22-case/132-turn schedule contains each
case × arm × repeat exactly once;16 historical cases and6 authored boundaries
remain separate. Case inputs are identical between arms; rubric/oracle/case-ID
fields are absent from responder prompts. Limits match the announced132 calls,
5,000,000 observed-token stop, eight hours,180-second turns and zero retries.
The superseded, unexecuted pre-collector freeze is rejected by current validation.

SR03 was independently recalculated using integer products:
`100*25 + 98*30 + 98*25 + 78*20 = 9450`;9450/100 rounds to95;
removing PR gives6950/75, rounding to93. The witness-method description now
accurately says it cross-checks independent literal results and records fractions.
Review inventory/validation-duty boundaries, unknown health dimensions, and sweep
syntax/edit-authority/behavior controls agree with their contracts.

## Historical readiness loop-back

`login-history.mjs` is explicitly offline and pinned to37fd5a2; it checks immutable
source/guidance/scoring/rubric and archive bytes, all file hashes/sizes, and54
synthetic raw turns including intents, prompts, identity, usage and cleanup.
Live `validateFreeze`/registration do not fall back to historical acceptance.
Byte mutations and live rejection of changed historical freezes are tested.

The actual saved readiness anchor is
`bc9a74b4cb3205a818756580f44a9a4b1240a829fef698aa5fcb08b70795ca78`.
Round1's prose reversed the displayed old/current hash attribution; this round
checks the pinned bytes directly and records the corrected identity. The original
round1 log and failure remain available. Historical verified turns54, observed
synthetic tokens5400; no live authorization is granted by this verifier.

## Completed-message collector inspection

Successful version2 records use only completed agent-message items in the bound
thread and turn. Orphan deltas remain diagnostic data. All completed phases,
including legitimate commentary, absent and unknown phases, are retained in
completion order; the implementation does not discard commentary to make an
artifact pass. Identical retransmissions deduplicate; conflicting/malformed
completions fail closed. Empty/missing completed output cannot become a successful
answer from delta text alone. Failed turns preserve partial/diagnostic text and
raw events; guarded final serialization retains failures instead of replacing
them with a generic setup error. The returned and saved records are tested equal.

The new revision verifier recomputes answer selection from saved raw events and
checks answer bytes, IDs/phases, orphan metadata and hashes rather than trusting
record.answer alone. It shares the frozen selection helper, so this is a separate
verification step, not an independently implemented extraction algorithm. A
rehashed receipt with orphan-contaminated answer is rejected. Tests cover real
completed commentary, replay, scope, missing/empty/conflicting items, failed
partials and output preservation. Full gate exercised these tests successfully.

## Independent correction replay and raw audit

Ran the additive correction reproducer against the archive-only extraction and
clean detached source at37fd5a2. All four outputs are byte-identical to the saved
candidate correction JSON files; hashes are in `correction-verification.json`.
Twelve historical JSON/archive files in the campaign directory and the original
interrupted archive remain unchanged. Original report tables remain behind clear
correction notices; the erratum withdraws attribution of the old failure to sweep.

A separately written Python event scan checked all318 completed raw records:
exactly one completed final item per record;316 raw answers already equal that
item; exactly2 have orphan fragments. In AS-26, original item `msg_0ca81...`
produces an incomplete prefix, event40 records a stream disconnect, and later
item `msg_07070...` completes a valid single JSON replacement object. The abandoned
item has no completion. PB-07 similarly has an orphan prefix. This independently
confirms the mechanism rather than merely accepting the correction's summary.

The unchanged original artifact oracle passes the completed AS-26 answer. Derived
sweep B complete/artifact success becomes15/15 and evidence45/45, tied with A.
The correction reproducer asserts all other skill summaries—including health—
and runtime scores are unchanged. Both original/corrected annotations are retained
for the two affected answers; no original raw answers, receipts or scores were
rewritten. See `independent-event-audit.json`, `as26-raw-audit.json`, reproduction
logs and correction hashes.

## Verdict and limits

PASS for this checked source/freeze and offline evidence state. No blocking
consistency finding remains. This is not evidence that the revised skills improve
model behavior: that requires the separately authorized prospective run and
semantic assessment. It also does not establish provider model attestation,
independent human judgment or correctness for every future streaming protocol.
Parent may archive these records, commit/push preparation and execute the selected
132-call gpt-6.1-terra/low study using this final freeze.
