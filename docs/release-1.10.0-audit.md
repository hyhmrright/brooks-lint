# Release 1.10.0 audit

> Historical preparation record. Its GitHub release/tag was later withdrawn, npm
> publication failed. The maintainer later selected 2.0.0; publication remains on hold.
> This record is not current release authorization. See [current readiness](next-release-readiness.md).

Range: `v1.9.1..231512e`. Version is a minor increment because the backlog adds
Codex behavioral evaluations and deterministic health tooling. Registry versions
and publication times checked on 2026-11-16 show no use of 1.10.0; withdrawn
1.9.0 is not reused. This audit does not claim registry visibility can prove the
absence of every historical private or withdrawn publication.

| Commit | Changelog coverage |
| --- | --- |
| d9bffd2 | Added: npm-backed DSH Discover index |
| 7393fa7 | Added: discovery keywords in official metadata |
| 4dfa5b0 | Added: offline repository health baseline |
| 0e4cb30 | Fixed: report/parser/runner/base-policy contracts and 64-case coverage |
| 72e00c2 | Added: isolated paired Codex evaluations and archived pilot |
| 17cdd1c | Changed: evidence-based severity and calibration provenance |
| f34624f | Fixed: title-level severity parser; Changed: literal labels and repeatability |
| 9590353 | Added/Fixed/Changed: health tooling, concise guides, bounded sweep, standalone regressions and candidate documentation (#46) |

Exempt: 15fa2d4, 85376e7 and 019c9cf are chart-only star-history refreshes;
231512e is the merge of the separately covered 9590353. Every commit in the
range was reviewed; automated PR-citation coverage is only an additional gate.

All six README translations and four manifests are version-propagated by the
canonical bump script. Existing install guides have no stale release pin beyond
historical publication descriptions. No description/trigger changes are added.
The DSH market index deliberately names an already published artifact; refresh
it only after the new npm publication is verified. There is no npm publishing
workflow in this repository: npm publication must be an explicit CLI operation
after exact release-commit CI and `npm run release:ci`.

No live model evaluations are part of this release. Research archives remain on
research/domain-packs at 17bd333, and bounded product regression extracts retain
provenance. Existing claims of non-independent evidence remain unchanged.
