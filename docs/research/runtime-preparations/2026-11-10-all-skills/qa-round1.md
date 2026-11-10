# All-skills benchmark QA round 1 — FAIL

Date: 2026-11-10. No real model calls. No product/source edits by QA.
Route all three findings below to eval-curator; regenerate affected all-skills
freezes, simulation archive and parent campaign freeze, then rerun the full gate.

## Automated gate

All commands completed with exit 0:

- `npm run validate` — qa-round1-validate.log
- `npm test` — qa-round1-test.log, including 15 all-skill and 2 campaign tests
- `npm run evals` — qa-round1-evals.log, 64 structural cases
- `npm run benchmark` — qa-round1-benchmark.log
- `npm run evals:codex:validate` — qa-round1-codex-offline.log
- `git diff --check` — clean

Green tests do not override the concrete oracle and fairness findings below.

## 1. P1 — Artifact parser accepts repairs with different JavaScript semantics

**Symptom:** AS-26's artifact verifier accepts both
`return cents++ - cents/10;` and `return` followed by a newline and
`cents * .9;` as correct repairs. Its recorded hidden checks say 100 produces 90.
Actual JavaScript returns 89.9 for the first and undefined for the second.
**Source:** `evals/research/all-skills/artifacts.mjs:10` permits a line terminator
following return; line 14 tokenizes `++` as two separate plus tokens, bypassing
JavaScript maximal-munch semantics and the declared pure-expression restriction.
**Consequence:** a behavior-breaking or non-pure returned source artifact can earn
artifact success and complete-supported credit. This crosses the source/oracle
boundary the new sweep track exists to verify.
**Remedy:** make the accepted lexical subset faithful to JavaScript: reject update
operators and return line terminators (including CR/LF/U+2028/U+2029), guard other
unsupported numeric/syntax forms, and preserve valid spaced unary expressions.
Add these concrete counterexamples as regressions. Do not execute model code to
work around the parser boundary.

The inverse boundary also needs a precise contract: `return cents * 9e-1;` is a
valid pure numeric expression under the current visible wording but is rejected.
Either support its literal form faithfully or clearly declare a narrower numeric
grammar in all sweep inputs. Include lexical differential checks for accepted
forms. Evidence: qa-round1-artifacts.log (three actual verifier calls).

## 2. P2 — AS-24 withholds a required scoring rule from the baseline

**Symptom:** `cases/AS-24/rubric.json:4` requires “Known PR score95”.
**Source:** `cases/AS-24/contract.md:1` supplies only one PR Warning under balanced;
its three exported inputs omit the base score and balanced deduction formula.
The B arm receives those rules from common.md, while A cannot derive 95 from its
provided inputs. This contradicts the equal normative-rule policy in
`review-policy.md` and `docs/research/all-skills-benchmark.md`.
**Consequence:** this evidence point can reward privileged private-policy access
rather than improved handling of unscanned dimensions.
**Remedy:** supply the same neutral base/deduction formula to both arms in AS-24,
without revealing the answer or inferring that null dimensions are clean. Add an
export-level fairness regression so this does not recur.

## 3. P2 — AS-12's exact Pain score conflicts with its supplied observations

**Symptom:** `cases/AS-12/rubric.json:8` requires exactly Pain2 × Spread2 = 4.
**Source:** contract.md says a mapping was omitted in the last two changes;
changes.md says omitted twice. priority-policy.md assigns Pain3 when regressions
occur on most changes, as well as defining Pain2 for noticeably slower work.
**Consequence:** Pain3 × Spread2 = 6 is defensible from the supplied observations
and can incorrectly lose an evidence point. Both scores mean scheduled debt, so
the exact forced 4 is unnecessary to the priority decision.
**Remedy:** clarify the frequency/history to uniquely support Pain2, or accept
both justified interpretations in the rubric. Keep the real propagation/omission
finding and the separation of priority from severity. Add a rubric consistency
check/witness for the revised facts.

## Checks that passed

- Read all 35 cases' task, source, contract, rubric and sweep oracle artifacts.
  Six shipped skills are derived and covered; health has six cases, others five;
  four maintenance-policy cases are separate. AS-35 has real source evidence.
- Health AS-21: strict scores 92/40/98/100, composite79.5→80. AS-22 omits PR,
  renormalizes .30/.25/.20 by .75, keeps clean Test100, composite98.466…→98.
- Task-criteria outcomes do not count arithmetic/maintenance criteria as detected
  bugs; case-level expected issues and criteria have separate denominators.
- Sweep applies only allowlisted replacements, protects other bytes, does not
  run generated JS/shell, and counts malformed artifacts as task failures.
  Its native-workflow and restricted-grammar limits are disclosed.
- Original response/record integrity issue is addressed by reconstruction from
  raw receipt-bound records. Public report CLI accepts the legitimate archived
  fake run; raw-answer mutation without changing its receipt fails with
  `Raw byte hash mismatch` and creates no forged report. Saved in
  qa-round1-provenance.log. Model/effort/CLI/prompt/source/cleanup checks inspected.
- Current full210 and alternative smoke14 freezes validate. Parent campaign
  validates 318 calls, model/effort unset, explicit later registration and no
  automatic retries. PB108 remains separate; no old source or freeze changed.
- Fake archive has safe paths and no AppleDouble, auth.json or real-looking
  Bearer/API/JWT markers. All fourteen turns are labeled simulation; 1400 tokens
  are synthetic. Evidence: qa-round1-archive.log.
- Versions agree at 1.9.1 across four plugin surfaces, all six README badges,
  JSON-LD and top CHANGELOG. Source inventory derives twelve books and
  README/AGENTS/GEMINI agree. AGENTS says64 scenarios and evals contains64.
  All six skill descriptions retain negative-trigger clauses. Evidence:
  qa-round1-cross-docs.log.

## Disposition

FAIL for the three concrete findings, not for the explicitly limited scope.
No model tests should start until the evaluator and rubric fairness fixes pass
another complete offline QA gate. First-round logs must remain intact.
