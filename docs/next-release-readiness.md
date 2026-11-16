# Next-release readiness — decision pending

Audited main: `d248ad584f3e222e39b175e4d6e001ab93d741ae`, 2026-11-16.
**Do not publish, bump a version, create a tag or run a model from this checklist.**
The maintainer is considering 2.0.0 and will confirm separately. Source metadata
remains 1.10.0; that GitHub release/tag was withdrawn. Published npm latest is
1.9.1. This document records preparation, not a release approval.

## Version recommendation

Recommend **2.0.0**, subject to maintainer confirmation, because public behavior
has changed: the Action's skipped output is no longer a numeric zero, CI modes
are restricted to review, health can withhold a numeric composite, and sweep's
iteration budget and authorization/report contracts differ. Consumers relying
on the previous behavior need migration. See the
[concrete migration draft](migration-v2-draft.md), based on v1.9.1 versus main,
and [SemVer](https://semver.org/). This recommendation supersedes the earlier
minor-version recommendation, which emphasized additive tooling but did not
fully account for these observable contract changes. It does not claim an API
break in the unchanged npm installer/export surface, or a major measured model
capability improvement. A larger benchmark by itself would not justify a major.

## Complete unreleased-commit accounting

The `v1.9.1..d248ad5` range has 16 commits. The ten non-exempt commits below
have entries in the existing pending changelog section; its version heading is
not a fresh release decision. The old audit stopped before #47 and is historical.

| Commit | Coverage / disposition |
| --- | --- |
| d9bffd2 | Added: published-artifact-backed DSH index |
| 7393fa7 | Added: preserve discovery keywords |
| 4dfa5b0 | Added: offline repository health baseline |
| 0e4cb30 | Fixed: parser/report admission, runner modes and trusted base policy |
| 72e00c2 | Added: paired isolated Codex behavioral evaluations |
| 17cdd1c | Changed: impact-based severity with evidence limitations |
| f34624f | Fixed/Changed: explicit severity parsing and repeatability records |
| 9590353 | Added/Fixed/Changed: health tooling, bounded sweep, focused guides, product regressions (#46) |
| 9423394 | Changed: six README rewrites and documentation/evidence boundaries (#47) |
| d248ad5 | Same #47 entry: fix missing merged-PR changelog citation, not a new product capability |

Exempt: 15fa2d4, 85376e7 and 019c9cf are chart-only star refreshes;
231512e and 51d982f are merges whose branch commits are covered; d6e58c7 is
the prior release bump. Although the automated audit exempts that bump, its
version propagation, audit and candidate-status documents were read explicitly;
their outdated authorization is now labeled historical. Citation validation
proves only references, not complete or accurate prose.

## Evidence status and gaps

The [benchmark index](benchmark-evidence.md) covers all six skills, main's
product/parser/native-Codex checks and retained research studies without combining
incompatible denominators. Latest focused review/audit ties and the single test
advantage must not become a universal efficacy claim. Health's later scope fixes
have offline coverage but no completed post-fix behavioral efficacy test; a frozen
follow-up is not a result. Sweep's observed advantage is limited to authored
families. There are no independent unseen holdouts or independent human truth.
These limitations restrict marketing claims; they do not automatically require
another model campaign before shipping a usable workflow.

The merged main CI passed Node 20/22/24 after the #47 citation fix. It is historical
validation of that exact commit, not a pass for a future version-bump commit.

## Remaining release gates

| Item | State / required action |
| --- | --- |
| Version and release authorization | Blocked on maintainer confirmation; 2.0.0 is only a recommendation |
| npm publisher access | Last attempt returned E401 identity failure after a rejected publish; no restored login has been demonstrated. Verify authorized login/rights before attempting either distribution |
| Version availability | Read-only registry check on 2026-11-16 showed latest 1.9.1 and versions 0.0.0-stage/1.9.1; remote tags v1.10.0/v2.0.0 absent. Recheck just before the approved release; absence is not proof about every withdrawn historical registry record |
| Public migration and benchmark explanation | Drafts now prepared; confirm selected version and adapt consumers as documented |
| Version-bearing surfaces | After approval run canonical bump and update changelog/date, four manifests, six README badges/Action examples, JSON-LD, install/publishing notices and release audit; replace withdrawn/source-only notices only when true |
| npm/README resource links | Verify packed README links and installed health resources during package inspection; not every repository document ships in npm |
| GitHub metadata | Read-only check passed on 2026-11-16; reapply/check if release descriptions change |
| Final exact-commit validation | Run offline gates, push, wait for every Validate matrix job and run release:ci on the final clean commit. Never reuse the current CI as a future release's authorization |
| Distribution and post-publication | After approval/gates publish, verify registry version and isolated installation/DSH provider; then generate the DSH index from the actual published timestamp, validate, commit/push and verify deployment |

Do not reuse withdrawn npm 1.9.0. Do not recreate the withdrawn GitHub release
or publish a speculative 2.0.0 while the hold is active. Preserve research branch
17bd333 and its original records. No model calls are part of this audit.
