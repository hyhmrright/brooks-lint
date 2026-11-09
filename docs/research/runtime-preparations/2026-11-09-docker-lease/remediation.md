# QA1 repair record

The QA1 semantic timing bypass is fixed without changing the Docker manager,
supervisor, or recorded Docker observations. The exact QA1 script now rejects the
mutation; its original accepted result is preserved unchanged in qa-round1.

The checker binds completion facts, state, reason and ID; validates finite ordered
case/event/command timestamps; requires removal then confirmed absence then state
completion then exactly one completion event; and binds an expired never-started
intent to preceding empty discovery. Twelve new rehashed timing mutations cover
early, late, reordered, divergent, non-numeric and negative-interval claims.

Final verification: all 22 commands in remediation-validation.json passed; 673 main
Node tests, 222 helper checks, six provider tests, 64 structural evals. The lease
suite contains 54 controls. The saved eight-case Docker drill passes unchanged.
No real model/provider calls, credentials, model switches or additional Docker
experiments occurred in this repair.

Preservation verified: all 317 original author files map through
qa1-preservation.json (README to qa1-readme.md); every file in the QA1 directory
matches qa1-round-preservation.json. Original final-sources are unchanged;
remediation-sources holds byte-identical copies of current modules and is hashed
in remediation-sources.json. Runtime manager and service match the original
snapshots exactly. remediation-initial preserves the first green repair gate
before the final expired-intent timing regression. QA2 remains the release gate.
