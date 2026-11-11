> **Later collector audit correction:** the initial sweep attribution below is superseded. The invalid concatenation came from an abandoned stream item in the collector, not from the completed model answer. Sweep guide edits are delivery-contract hardening, not a demonstrated fix for that historical model failure. See the campaign collector correction.

# Three-skill revision — diagnosis before changes

Baseline: commit 37fd5a2 and its 318-response campaign. These are bounded,
same-workflow observations; the three skills are not established universally
ineffective. Frozen gold and historical responses are not changed by this stage.

## Findings

1. **Review evidence scope**
   - Symptom: three responses deduct for missing tests when only module source,
     not the complete project test inventory, was supplied. Their extra claims
     remain pending, not proven false positives.
   - Source: `pr-review-guide.md` Step 7 asks whether test changes accompany a
     diff and moves directly from new behavior with no new tests to a finding;
     it does not explicitly distinguish absent evidence from observed absence.
   - Consequence: omitted tests can be mistaken for lack of regression protection
     and contribute an unsupported deduction. Separately, valid-input wording
     can be mistaken for a requirement to reject invalid inputs.
   - Remedy: establish evidence scope, inspect available tests, preserve unknown
     coverage/contract ownership, and trace both possible outcomes before an
     unconditional finding. Preserve findings for demonstrable local test gaps.

2. **Health arithmetic and consistency**
   - Symptom: five guided fixed-ledger responses contain wrong intermediate sums
     or conflicting headline/body scores; a source-diagnosis response also has
     conflicting scores independently of its pending claims.
   - Source: `health-guide.md` states the scoring rules but illustrates rounded
     redistributed weights as equalities and lacks a single calculation ledger
     plus final equality check.
   - Consequence: correct dimension values can produce wrong composites, and a
     coincidentally correct final rounded number can conceal arithmetic errors.
   - Remedy: exact integer-weight numerator and denominator, one rounding step,
     ledger-backed values reused throughout output, and consistency checks.
     Supplied adjudicated ledgers are arithmetic inputs, not new diagnoses.

3. **Sweep artifact validity**
   - Symptom: one guided answer contains a truncated JSON draft before its complete
     intended object; the frozen artifact oracle rejects it.
   - Source: `sweep-guide.md` primarily specifies the native Markdown report and
     has no explicit final serialization check for a requested structured artifact.
   - Consequence: a correct intended repair cannot be consumed. This single event
     does not prove the native sweep workflow unsafe or generally unreliable.
   - Remedy: honor a requested structured output envelope, serialize one complete
     value, validate syntax and allowed edits separately from behavior, and report
     only verification actually performed. Preserve the default native workflow.

## Scope

Guide-only changes in the three assigned skill directories. No new risk codes,
step numbers, trigger descriptions, shared framework edits, or benchmark answers.
No live calls or commits by this stage.

## Completed edits and author check

Edited only:

- `skills/brooks-review/pr-review-guide.md`: scope/contract checks in Step 1;
  Step 7 tests missing-evidence guard, observed local gap distinction, and causal
  regression requirement. Existing risk/severity framework retained.
- `skills/brooks-health/health-guide.md`: ledger-only versus source diagnosis,
  exact rational redistributed weights, integer numerator/denominator formula,
  single rounded value and output consistency checks; incomplete evidence remains
  unscored, and a tool-use claim requires actual permitted execution.
- `skills/brooks-sweep/sweep-guide.md`: runner-capability boundary and conditional
  artifact serialization checks in Step 8, preserving default Markdown/native
  sweep behavior and permission boundaries.

No new risk codes, renamed steps, SKILL.md changes or trigger-description edits.
No new shared-file dependency, external calculator dependency or scripted runtime
was added. No benchmark IDs, case-specific values or expected answer text appear
in the guides. The added arithmetic constants are the existing canonical weights.

`npm run validate` passed (1.9.1); `git diff --check` passed. Full offline checks
and frozen-comparison implementation belong to the following eval/QA stages.

Recommended new paired boundaries for the eval stage:

- Review: supplied source with omitted test inventory must not earn a scored
  missing-test allegation; a complete supplied test inventory with a concrete
  escaping behavior mutation must still permit a supported T5 finding.
- Health: new ledgers with different severities/presets and non-terminating
  normalized weights must retain exact intermediate sums and one consistent
  headline. A clean assessed dimension stays100; a genuinely unassessed one must
  not silently become100. Do not encode the observed old-case numeric answers.
- Sweep: authorized bounded repair requiring an escaped multiline/string-bearing
  payload must serialize one valid artifact; an unknown or refused edit contract
  must preserve files and return a valid permitted empty replacement envelope.
  Check syntax, authority and behavioral repair as distinct axes.

All old freezes and result files remain unchanged. Existing historic-source
verification versus future live-source drift is an executor responsibility; this
stage does not regenerate freezes to make changed guidance appear unchanged.
