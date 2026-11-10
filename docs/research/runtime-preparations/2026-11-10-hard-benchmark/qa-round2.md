# QA round 2: PASS

Date: 2026-11-10. Same-workflow Codex QA; not independent human validation.
Source files were not edited by QA. No live model calls were made.

## Round 1 findings closed

1. **Batch generation reuse:** HB-13/HB-14/HB-15 now allocate identities from a
   monotonic counter independent of active-map membership. All three execute
   cancel/reinsert and stale-token-after-flush regressions: only the new entry
   sends, identity increases, and stale cancellation cannot remove it. The original
   expiry defect/protection distinction remains. Supporting-code equality between
   defect and unresolved variants is retained.
2. **Fanout contract:** supplied contexts and all three rubrics now consistently
   require every **required** sink, explicitly excluding optional sinks. A specific
   consistency test guards wording and existing behavioral checks show optional
   retention with zero final required credits. The protected variant retains the
   slow-required-sink bound and continues accepting work after drainage.
3. **Import closure:** the scanner now recognizes supported static side-effect,
   default, named and namespace import forms, skips ordinary strings/comments,
   and enforces the same contained input whitelist. Tests accept an allowlisted
   side-effect import but reject missing, escaping, absolute and node: imports
   before freeze/export. Unsupported import forms are rejected. README explicitly
   describes restricted syntax and disclaims a complete parser or security sandbox.

The [closure evidence](round2/closure-evidence.json) captures reproduced values.
Round 1 failure findings and logs remain intact; they are not model mistakes.

## Complete verification gate

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run validate` | PASS | [raw output](round2/validate.txt) |
| `npm test` | PASS; Node test components 6 + 914 + 75 = 995, no failures/skips; custom validator checks also pass | [raw output](round2/test.txt) |
| `npm run evals` | PASS; 64 structural scenarios | [raw output](round2/evals.txt) |
| `npm run evals:runtime:prepared` | PASS; 541 + 75 = 616 tests, no failures/skips | [raw output](round2/prepared.txt) |
| `npm run benchmark` | PASS; 30/30 exact severity counts and valid SARIF, risk precision/recall100% on frozen parser corpus | [raw output](round2/benchmark.txt) |
| Hard-case reproduction | Byte-identical to committed observations | [reproduced data](round2/reproduced.json) |
| `git diff --check` | PASS | No whitespace errors |
| Cross-document gate | PASS | [checks](round2/cross-doc.json) |

[Command records](round2/commands.json) preserve exit codes and elapsed times.
The 75 hard-benchmark checks are included in both `npm test` and prepared testing;
they are not 150 distinct checks. Test counts are not semantic model evaluations.

Version1.9.1 agrees across the four manifests, six README badges, landing-page
JSON-LD and CHANGELOG. The source inventory derives12 books, matching README,
AGENTS and GEMINI. The ordinary eval inventory remains64; new research cases are
separate. All six skill descriptions retain their negative boundary clauses.

Final freeze SHA256:
`00fd5a575c0db2249b96103faec48e74914f2eadd0d5da00294e4fbc82b5b682`.

## Scope and remaining limits

Reviewed twelve families, thirty-six contexts/rubrics and variant mechanisms,
shared driver/oracle behavior, input-export boundary, new regression cases, design,
prospective protocol and preparation report. Equivalent causal witnesses are
accepted without hidden numbers, sibling source or prescribed wording. No remaining
blocking inconsistency was identified in this bounded review.

This passes the offline authoring gate only. It establishes tested observations,
artifact consistency and regression checks, not exhaustive interleavings, production
safety, measured difficulty, model improvement, human calibration, book mapping,
independent holdouts or live execution readiness. Public same-workflow development
exposure and the unmeasured “100 times” aspiration are explicitly documented.
