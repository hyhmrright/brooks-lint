# Review, health and sweep guide revision comparison

This study compares the original guidance at commit
`37fd5a282df17736541c7c36d109f4ab070bbc8a` (arm A) with the revised guidance
captured in `evals/research/skill-revision/frozen-full.json` (arm B). It evaluates
whether a small guide revision improves bounded task outcomes, not whether these
skills are universally effective or defective. Historical no-skill results remain
context only; both contemporary arms receive skill guidance.

## Design and budget

- 16 original development cases: five review, six health, five sweep.
- Six new same-workflow boundary cases, two per skill. These are narrow authored
  regression boundaries, not independent holdouts or a demonstrated harder suite.
- 22 cases × two arms × three repeats = **132 primary calls**, balanced by rotating
  A/B order. Identical task files and authority/scoring rules within every pair.
- Original and revised guidance, cases, oracles, source files and the prospective
  review policy are content-hashed before execution. Old freezes stay unchanged.
- The maintainer selected **gpt-6.1-terra / low** for both arms. Actual execution
  must separately record the CLI version, selected identity, authorization and
  committed candidate source revision. Provider identity is not independently
  attested by CLI selection.
- At most 132 calls, 180 seconds per turn, eight hours per study. Stop admitting
  calls at **5,000,000 observed tokens**, checked between turns; one-turn overshoot
  is possible. Unknown failed usage, internal reconnects and billing are not
  hard-capped. Zero automatic retries. No additional model-judge calls.
- Any execution, identity, cleanup or usage failure stops admission, preserves
  raw evidence and leaves all remaining scheduled records as not-run. There is
  no implicit resume or automatic fallback to another model or API channel.

The previous target-skill guided arms used approximately 1.25 million observed
tokens for their combined 48 responses. This provides only a rough planning
reference, not a promise of this study's usage or subscription cost.

## Changes under test

Review now distinguishes omitted tests from a demonstrated coverage gap and input
preconditions from local validation duties. Health uses exact integer-weight
numerators and denominators, a single final rounding step and report consistency
checks. Sweep distinguishes native actions from bounded artifact delivery and
checks the requested serialization separately from edit authority and behavior.
A subsequent full raw-event audit established that the historical sweep format
failure came from a collector joining an abandoned stream fragment to a completed
answer. The corrected old sweep result is 15/15 in both arms. The sweep guide change
is therefore delivery-contract hardening, not a proven fix for that historical
model failure; the collector is corrected in both new-study arms. See the
[additive correction](all-skills-results/2026-11-11-terra-low-campaign/collector-correction/README.md).
Sweep includes review guidance, so its B arm also contains the review revision;
this is a bundled revision effect, not an isolated sweep-only effect.

The new cases test unavailable versus complete test inventory, exact capped ledger
arithmetic and unknown dimensions, escaped JSON repair output and explicit edit
refusal. `case-witnesses.mjs` executes only handwritten fixture code and tests;
the bounded artifact checker never executes generated model source. The health
witness cross-checks calculated scores against independent literal expected
results and records the exact expected fractions.

## Scoring and limitations

Read the frozen [review policy](../../evals/research/skill-revision/review-policy.md).
Each completed response needs individually supported semantic annotations with
exact quotes, answer hashes, missing-evidence reasons, reviewer/exposure metadata
and open-set adjudication. Masking does not make authorship or style independent.
There are no keyword-generated semantic labels or blanket passing annotations.

Report each skill and each cohort separately: diagnosis, task criteria, evidence,
confirmed unsupported and pending claims, protected/unresolved/scope controls,
artifact validity, complete-supported responses, paired results and usage. Arithmetic
claims are not false-positive defect responses; pending claims are not confirmed
false positives. Three repeats do not create three independent cases.

Original arbitrary witnesses in AS-01/AS-04/AS-35 receive an explicitly versioned
semantic-equivalence rule for this comparison. Historical originalRubric values
remain embedded unchanged, and old primary scores are not overwritten or directly
compared to the new metric. AS-35 validation responsibility remains ambiguous; do
not invent a duty to resolve it. Conditional illustrative health totals are allowed
when clearly labeled hypothetical and not published as the actual composite.

A positive descriptive result requires improvement in a targeted metric without a
new confirmed control false positive or artifact regression. Mixed or tied outcomes
must be reported. No result proves native loading, autonomous workflow reliability,
production benefit or broad generalization. Do not tune skills mid-run.

## Offline preparation and execution commands

From the repository root:

```bash
npm run evals:skill-revision
node evals/research/campaign-plan.mjs validate-historical evals/research/frozen-campaign.json
node evals/research/skill-revision/runner.mjs validate evals/research/skill-revision/frozen-full.json FREEZE_SHA256
```

The first two commands are offline. Historical validation verifies pinned Git
objects and archived bytes; it is not a bypass for live current-source checks.
Old live registration remains fail-closed after guide changes. Reproducing the
old report requires its documented pinned checkout.

Create a private registration config with `frozen` (the complete frozen object),
`anchor` (its SHA-256), `model`, `effort`, `cliVersion`, `authorization`, and optional
`inheritProxy: true` only if needed and explicitly documented. No API key belongs
in that file. The executor reads the existing ChatGPT login via the previously
hardened auth-only isolation adapter. Global login/configuration is not modified.
Save the committed candidate Git hash in separate execution metadata; do not add
unrecognized fields to the sealed registration.

```bash
node evals/research/skill-revision/runner.mjs register PRIVATE_CONFIG NEW_REGISTRATION
# Only with selected model/effort, explicit live authorization and offline QA PASS:
node evals/research/skill-revision/runner.mjs run REGISTRATION REGISTRATION_SHA256 NEW_RUN_DIRECTORY --live
node evals/research/skill-revision/runner.mjs verify RUN_DIRECTORY
# After all completed answers have been individually reviewed:
node evals/research/skill-revision/report.mjs RUN_DIRECTORY ANNOTATIONS NEW_REPORT
```

The runner writes a per-turn intent before submission, raw byte receipts,
registration/model/effort/usage/cleanup records, shuffled review packets and a
separate mapping. Output directories/files must be new. The report rechecks raw
records rather than trusting a mutable answer summary. These are consistency
checks, not tamper-proof signatures or semantic truth guarantees.

## Collector correction before execution

The superseded unexecuted preflight freeze is retained as
`superseded-preflight-before-collector.json` (anchor b7056c0938aaa3afc52cb87eda300fb95fa1d618a2023e68076265f6b15ce164).
It must not be registered for current-source execution. Protocol revision 2 binds
the repaired collector for both arms. Successful responses contain only completed
agent messages from the bound thread/turn, preserving every completed phase in
completion order. Unfinished deltas remain separate diagnostic evidence. Missing,
empty, malformed or conflicting completed answers fail closed with raw records
and cleanup retained. The run verifier reconstructs the selection from raw events.

This corrects an executor defect discovered in the historical sweep failure;
it does not establish a sweep-model formatting failure. See the separately
versioned historical campaign collector correction. No original result or raw
record is overwritten. The new source freeze is required because the collector
changed; the132-call budget, cases, arms and repeat counts did not change.

The [preparation record](skill-revision-preparation/README.md) preserves both QA
rounds, historical-verifier loopback and collector correction before live calls.
