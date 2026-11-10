# Author corrections after QA round1

All three findings accepted and corrected. Round1 QA records remain unchanged.
No live models, commits or unrelated source edits.

## F1: cancelled batch generation reuse

- HB-13/HB-14/HB-15 queue support now allocates monotonically increasing identities
  from a counter independent of active membership. Cancel/take remove active
  membership without resetting identity.
- Driver records cancel-then-reinsert (exactly the new deadline80 entry sends) and
  stale cancellation after a prior flush (the new entry still sends). Tests run
  these assertions for all three kinds and require increasing generation identity.
- The intended per-item versus aggregate expiry difference remains unchanged;
  unresolved and defect implementations still match byte-for-byte.

## F2: required versus optional fanout sinks

- Changed every relevant supplied contract and rubric from “every sink” to “every
  required sink”, including the protected scope and alternate-judgment text.
- Added an explicit optional-sink exclusion to the credit-window contract.
- Added textual consistency checks for all three cases. Existing executable tests
  still prove required-sink drainage releases credits while optional bytes remain.

## F3: ignored side-effect imports

- Replaced the `from`-only matcher with a conservative static import scanner that
  skips comments/ordinary strings, handles side-effect/default/named/namespace
  imports, and applies the same dependency allowlist to every accepted specifier.
- Unsupported dynamic/import-meta/attribute/assertion/re-export/escaped-specifier
  syntax fails closed; explicit semicolons are required. The README documents
  these restricted authoring conventions and explicitly denies security-sandbox
  or complete-JavaScript-parser claims.
- Regression tests prove an allowlisted side-effect import can freeze and export;
  missing, escaping, absolute and node: side-effect imports cannot freeze/export.
  Supported binding combinations and unsupported forms have direct tests.

## Verification

- `npm run evals:runtime:hard`:75/75 PASS,0 skipped/failed.
- Deterministic observation reproduction is byte-identical.
- `git diff --check`:PASS.
- Updated freeze SHA256:
  `00fd5a575c0db2249b96103faec48e74914f2eadd0d5da00294e4fbc82b5b682`.
- Author raw logs: `_workspace/hard-benchmark/tests-round2.log` and
  `_workspace/hard-benchmark/reproduced-round2.json`.

Ready for the second full QA gate. Historical initial freeze and round1 outcomes
are preserved in the parent-owned QA record directory.
