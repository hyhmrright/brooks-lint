# QA gate — initial FAIL

## Blocking finding

`evals/research/skills-benchmark-v2/campaign-v3.test.mjs:28` invokes historical probe verification against current checkout sources. After the scorer correction, `campaign-v3.mjs:82` rejects its retained scorer source hash (`Probe source changed`). Actual `1ddc81b5d3aded744f6a2a83c96ff8ad06ec6d6f2ba3d1fd23bae50900d71259`; historical expected `96c424d416a4796ef8a942e6df873db55525481d9a3b70cb319a1d6a447baa64`.

Route to author/tooling: execute historical verification against the frozen source snapshot, preserving all historical hashes/receipts and current execution drift rejection. Do not reseal historical data merely to accept new scorer code.

## Checks completed

- `npm run validate`: PASS.
- `npm test`: FAIL at historical v3 transport verification. Earlier suites pass in escalated run. Initial restricted run failed local process/socket fixtures; its log is retained separately.
- Ordered `npm run evals` and `npm run benchmark`: not reached after failure.
- Targeted health/dashboard-delivery/sweep boundaries: 21/21 PASS.
- Direct supplied-ledger check: duplicate explicit ID across dimensions rejects; distinct IDs remain accepted. Distinct-ID semantic deduplication is intentionally not claimed.
- Cross-doc checks: package/manifests/six README badges/JSON-LD/top CHANGELOG all 1.9.1; derived source count 12 matches README/AGENTS/GEMINI; actual eval count 64; all six negative trigger clauses present.
- Historical results and frozen inputs unchanged in git diff; no real models invoked.

Logs: `_workspace/brooks-harness/{validate,test,test-sandbox-restricted,targeted,supplied-ledger}.log`.
