# Health score consistency: offline QA

Verdict: **PASS for the implementation, regression coverage and repository
consistency gate**. No real model or judge call was made. This does not establish
model adherence, restored provider capacity or a completed effectiveness study.
The earlier comparison remains stopped with 11 completed responses.

## Independent review

The author and eval-curator handoffs were reviewed against the actual helper,
skill instructions, tests and archived response. A separate read-only codebase
reviewer also exercised the calculation and verifier boundaries; this is review
within the same Codex workflow, not independent human validation.

- The actual AS-21 supplied severity ledger computes dimension scores
  92 / 40 / 98 / 100 and the exact fraction 7950/100, rounding once to **80**.
  Positional references preserve missing risk codes instead of inventing them.
- The old completed response still contains both 77 and 80. The new contract
  rejects it; mutating a canonical headline to 77, altering component scores or
  arithmetic, and adding a second composite label also fail.
- All three presets, default balanced deductions, exact no-diff weights,
  half-up rounding, clean versus unassessed dimensions, caps and malformed input
  are covered. Missing debt risk codes are explicitly unverified under the
  supplied-capped-ledger assertion. Known cap violations still reject.
- Direct and symlink CLI entry points work. The helper runs from an npm-installed
  artifact after removing the unpacked package, and from a standalone shell
  installation, without local repository imports.
- The complete tool-free fallback remains inside the guide. Trigger descriptions,
  risk codes, guide step numbering and scoring weights are unchanged.

## Full final gate

The final gate ran sequentially on unchanged source. Every command exited zero:

| Command | Seconds | Exit |
| --- | ---: | ---: |
| `npm run validate` | 0.525 | 0 |
| `npm test` | 162.006 | 0 |
| `npm run evals` | 0.262 | 0 |
| `npm run benchmark` | 0.262 | 0 |
| `npm run evals:codex:validate` | 0.256 | 0 |
| `node --test evals/research/skill-revision/recovery.test.mjs` | 50.649 | 0 |
| `git diff --check` | 0.019 | 0 |

The full test command includes the eight health regression tests and seven
installer tests that previously passed as a focused 15/15 run. The separate
recovery suite passed **4/4**, with zero skips, using local fake CLI responses.
Structural evals cover **64** scenarios. The frozen parser benchmark matched
severity counts and SARIF validity for **30/30** reports, with 100% risk-code
precision and recall. Codex fixture validation checked **7** cases offline.
These parser and fixture checks do not measure the new skill's model efficacy.

## Preserved failures and corrections

The initial focused installer run failed because npm attempted to write its
cache outside the sandbox; the test now uses a temporary cache. The selected
failure excerpt is retained and labeled as an excerpt. The author loopbacks for
symlink CLI startup and severity-only supplied ledgers are also recorded.

The first full QA attempt passed repository validation but failed `npm test`
with **140 failures** under sandbox restrictions, including `listen EPERM` on
127.0.0.1 and blocked process-isolation checks. Its complete output and command
status remain archived. After confirming no prior test process remained, the
same source passed the full gate outside that sandbox. The authorization was
limited to offline commands and local fake services; no real model was called.
The failed attempt is not counted as a pass or silently discarded.

## Cross-document agreement

The package, all four plugin manifests, six README version badges, docs landing
page JSON-LD and CHANGELOG top section agree on **1.9.1**. The source-coverage
frontmatter derives **12** books and matches README, AGENTS and GEMINI. AGENTS'
eval-count claims match the **64** actual scenarios. Every shipped skill retains
its unchanged negative-trigger description. Both initial and resumed comparisons
are retained in the logs archive.

## Historical evidence and version boundary

The original freeze, recovery source/tests, raw archive, manifest, all 11
annotations, summary, assessment and failure analysis remain byte-identical to
commit `2e38033adcfff14bab568d4f5f77e95878bcd97d`. The prior pinned-source
reproduction checked 32 source files and regenerated a byte-identical summary.
QA checked the preserved artifact hashes again after the final gate.

| Preserved original artifact | SHA-256 |
| --- | --- |
| `raw-run.tar.gz` | `15b234b5d3e08fa9b6b8a84c8ac9b605c16338d70a19b3201bb21d1852900d97` |
| `annotations.json` | `afe181b9e6dec8c74f07a09cc83a08e51e595ae209f4ecc88af709c4d6882283` |
| `summary.json` | `dbc852226a4701684b19ae5ca6cdfe4993a4b6ab9189aabc0d7f1309ab8f8dd5` |

The original registration correctly fails current-checkout verification with
`Frozen source/input drift` after this health guide revision. Original recovery
must use the documented clean `2e38033` checkout and bound parent path. The
current fake recovery tests generate a current synthetic freeze; they do not
make the historical registration compatible with changed guidance. New-candidate
model results require a separate freeze and must not be merged with the 11 old
answers. No historical raw answer or score was edited to manufacture a pass.

## Exact checked source

| File | SHA-256 |
| --- | --- |
| `skills/brooks-health/SKILL.md` | `36c81fddaec4a27b564fc66ef193ecf5fa66f6c61093949bcb02e7b4b1a25ef0` |
| `skills/brooks-health/health-guide.md` | `e3c6ce0c3e0937cdd9bec0453ca34f63922409db900437ddecc046cfda7d0caa` |
| `skills/brooks-health/score-ledger.md` | `be3e6cf33dd6173a7fd7755a707a13225baba8dfef5107131b17d2c718428396` |
| `skills/brooks-health/scripts/score-dashboard.mjs` | `47eea99f63a0fb7f776f9ef279df092cbe9306f0d9dde5ac401bd24621feea37` |
| `scripts/health-dashboard.test.mjs` | `009f3ab13cfe15f5c98370f27a632eaedcf56fbcbe07785af19e127a108bc9db` |
| `scripts/npm-install.test.mjs` | `cdac781cbba811d141cd4760064ebde438dfaa36d102f2349e17765c5a6a35d9` |
| `package.json` | `83e2ddeb574486d8c8e96498662bc2905c60a51b5ad8006e1e4a5890092069b8` |

## Scope and remaining uncertainty

The helper verifies a canonical Markdown block and additional composite labels;
it does not interpret arbitrary surrounding prose, attest Markdown visibility,
or prove the truth of the diagnosed findings. Its supplied-ledger assertion is
input provenance, not independent verification of omitted risk codes. The current
three-finding cap and deduction maximum cannot exercise the zero floor; tests do
not claim that boundary was triggered.

The text-only benchmark prohibits tools and does not execute this helper. Offline
program tests establish deterministic behavior and installation compatibility,
not whether a model reliably invokes the helper or follows the fallback. Real
model adherence and provider availability remain untested for this revision.

## Logs

[Validation logs](health-score-consistency-validation-logs.tar.gz) preserve the
initial failures, stage handoffs, final command outputs, cross-document checks,
source hashes and historical-preservation checks. Archive SHA-256:
`b10529abe469ad595f657ac047bc040a027d0f27d2190bd64f0f926716cfaa75`. The archive passed a heuristic API-key/JWT/bearer scan with no
matches; this is not an exhaustive secret-detection proof.

QA made no commit or push. The orchestrator owns publication after this gate.
