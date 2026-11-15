# Historical health scorer replay

`score-dashboard.snapshot.txt` preserves the exact scorer bytes at commit
`c570a731ff8ca98a6ed23a63b193fefaa80057be`, checked against the source hash already
recorded in the retained v3 probe and later health campaign freezes:
`96c424d416a4796ef8a942e6df873db55525481d9a3b70cb319a1d6a447baa64`.
It is not the shipped scorer and must not be updated to fix current behavior.

`archive-tests.mjs` is an offline test wrapper. It copies the repository evidence
into a temporary workspace, restores that pinned scorer, and runs only a fixed
allowlist of existing offline suites. HS suites also restore the existing anchored
Markdown snapshot and check all frozen source hashes before and after testing.
The v5 recovery wrapper reuses the scorer restoration alongside its existing
Markdown and history-hash checks. Current scorer files are never overwritten.

No production collector imports this helper. Real registration and collection
still reject old proof when current source hashes differ; historical replay does
not grant execution authorization. Current scorer unit tests and the current-source
rejection/registration regression remain separate from historical replay.
