# QA1 coverage-validation remediation

QA1 proved that replacing the run's six cases with six copies of the first case
and rehashing run.json passed the original validator. All original observations,
QA1 report/reproduction/streams and original author gate records remain unchanged.
No Docker container or model was rerun during this validator-only repair.

The validator now requires the exact six unique mode sequence, unique container
IDs and names, agreement with each standalone case, and a disjoint, ordered,
contiguous complete partition of all commands. It requires the exact expected
artifact inventory and rejects extra/missing files. Every command argv is matched
to its case's exact sequence and owned ID; full inspections bind ID, name, image,
entrypoint, mode and security/resource policy. Command exits/signals, byte counts
and raw streams are checked. Case pointer fields cannot refer to another turn.

Eleven additional mutation regressions cover QA1's duplication bypass, omitted
modes, standalone mismatch, duplicate IDs/names, overlapping/reordered/orphan
commands, foreign files, foreign target IDs and a rehashed inspected-image mismatch.
The focused suite now has 39 tests. These establish internal evidence consistency,
not authenticity against an actor replacing every source and trusted anchor.

`qa1-final-sources/` preserves the original `final-sources/` contents before repair;
`qa1-readme.md` preserves the author README. `author-inventory.json` is the unchanged
point-in-time author manifest: its old `final-sources/` entries can be checked in
`qa1-final-sources/`, and its README entry in `qa1-readme.md`. New `final-sources/`
and `remediation-validation.json` describe the repaired validator and its checks.
`qa-round1/`, `observations/` and both development collections are unchanged.
