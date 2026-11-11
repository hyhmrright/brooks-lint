# Eval loop-back: preserved HB/BV readiness verification

QA round1 was preserved and traced to the saved54-turn HB/BV fake-process drill
using a current-source guide validator. The revised guides correctly invalidate
that live source gate. The old archived freeze must remain immutable.

Added `evals/research/runtime/benchmark-audit/login-history.mjs`, an explicit
historical-only verifier pinned to37fd5a282df17736541c7c36d109f4ab070bbc8a.
It verifies original frozen/readiness/inventory/execution/archive bytes against
Git, fixed protocol anchor, source/guidance/scoring/rubric snapshots, every archived
file hash/size, and54 raw intents, prompts, answer receipts, model/effort/CLI,
cleanup confirmations and observed usage. It never starts a model or grants live
execution. The original saved anchor is
bc9a74b4cb3205a818756580f44a9a4b1240a829fef698aa5fcb08b70795ca78;
the9c145... hash mentioned in QA1 describes the differing current reconstruction.

Updated only the historical readiness test to use this explicit verifier. Added
mutations of frozen bytes and compressed archive bytes; both rejected. Tests also
confirm unchanged live validateFreeze/register refuse the old freeze after the
guide revision. All original archive and freeze bytes are retained. The new132turn
study source dependencies are untouched, so its anchor remains
b7056c0938aaa3afc52cb87eda300fb95fa1d618a2023e68076265f6b15ce164.

Targeted tests:2/2 PASS (revision-history-fix.log).
Full `npm test` rerun PASS, exit 0, including the historical readiness and final
9/9 revision tests (revision-loopback-full-test.log). No further guide-drift failures
were found by the full chain. `git diff --check` PASS.

Parent subsequently found an independent response-collector defect in a historical
sweep answer and has explicitly held live preparation. This loop-back did not edit
the collector. Its correction and subsequent source freeze/QA remain separate work;
this successful old-state test run is not approval of a future changed collector.
No live calls, no commits or pushes. Full QA rerun still required.
