# Collector correction before the revision study

The prior AS-26 failed JSON output combined an abandoned delta item with a later
completed item. Root audited all318 historical responses and found two affected
records. This stage changes only future extraction; root owns additive historical
errata and corrected result views. Old frozen records are never rewritten.

## Implemented

- `codex-login-turn.mjs`: exported `completedAnswer` selects completed agent items
  from the bound thread/turn only. All completed phases—including commentary and
  absent/unknown phases—are retained in completion order. Identical completed
  retransmissions deduplicate; conflicting IDs or malformed items fail closed.
- Successful turn requires nonblank completed text. Stream deltas never become
  the final answer. `answerText` retains its legacy partial behavior for explicit
  diagnostics; version2 raw records store `diagnostic_answer`, `partial_answer`
  and `answer_selection` with IDs, phases, hashes and excluded orphan text.
- Final extraction runs on scrubbed saved events. Selection failures in finally
  are guarded and preserve full raw events, error, diagnostics and cleanup rather
  than escaping into generic setup failure. Returned record equals stored record.
- New revision run verifier independently reconstructs the completed-item view,
  checks its hash/selection metadata and rejects orphan-contaminated answers even
  if the attacker recomputes the raw byte receipt.
- Synthetic fixture and13 tests cover deltas/completion deduplication, abandoned
  reconnect item, legitimate completed commentary, unknown/absent phase, empty or
  missing completion, conflicting completion, failure partial diagnostics, scope,
  and stored raw selection equality. Existing timeout regression now checks
  partial diagnostics separately from completed-only response text.
- New132 plan protocolrevision2 uses the same repaired collector in both arms.
  Budget/cases/arms/repetitions unchanged. Superseded unexecuted b7056c... freeze
  retained as superseded-preflight-before-collector.json, not execution-ready.

## Freeze and verification

Current anchor:
`2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`.

- Collector targeted13/13 PASS (collector-fix-targeted.log).
- Legacy81-turn + new132-turn targeted22/22 PASS
  (collector-study-targeted.log), including new rehashed contamination rejection.
- Full `npm test` PASS, exit 0 (collector-fix-full-test.log), including pinned
  historical drill checks, current-source live gates and the final9/9 revision tests.
- `git diff --check` PASS; current frozen revision2 anchor validates unchanged.
- All historical verifiers remain explicitly pinned; live current-source gates
  remain fail-closed. No original campaign annotations/tables/raw edited by stage.

No live calls, commits or pushes. Full consistency-QA gate must review this final
collector state and new freeze before the parent can commit/register/execute.
