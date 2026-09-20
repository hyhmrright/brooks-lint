---
name: release
description: >
  Cut a brooks-lint release: set the version in package.json, propagate it across
  all four plugin manifests and every version-bearing text file (README badges,
  docs site metadata), write the CHANGELOG entry, validate, then commit, push,
  tag, and publish the GitHub release.
  Triggers when the maintainer asks to "release", "cut a release", "ship a new
  version", or "bump and publish" brooks-lint.
  Do NOT trigger for: propagating an already-decided version without releasing
  (use `npm run bump` directly), CHANGELOG edits alone, or questions about the
  release process that don't ask to perform it.
disable-model-invocation: true
---

# brooks-lint — Release

Target version comes from `$ARGUMENTS` (e.g. `1.4.0`). If empty, ask the maintainer
for the semver bump before doing anything.

**Before accepting that version, read the backlog.** Run
`git log $(git describe --tags --abbrev=0)..HEAD --oneline` and look at what is
actually unreleased — the bump is decided by the whole range, not by the change
that prompted the release. If the range contains a feature or a new platform and
the maintainer asked for a patch, stop and say so: v1.5.1 was published, then
deleted and re-cut as v1.6.0 because twenty unreleased commits (including a new
platform) had been swept into a patch.

Execute these steps in order. `bump-version.mjs` reads the version FROM
`package.json` and does NOT touch the changelog — so the version edit and the
CHANGELOG entry are manual; the script only fans the version out to the manifests
and every version-bearing text file.

1. **Set the source of truth.** `npm version <version> --no-git-tag-version`
   (the `--no-git-tag-version` flag is required — plain `npm version` would create
   its own commit + tag and collide with the manual commit in step 5).
2. **Propagate.** `npm run bump` — writes the version into
   `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
   `.codex-plugin/plugin.json`, `gemini-extension.json`, and every version-bearing
   text file discovered by `scripts/version-refs.mjs` (all six README badges plus
   the JSON-LD `softwareVersion` on the docs landing page). Do not maintain a list
   here — the script's is authoritative.
3. **Write the changelog.** Add a new section at the top of `CHANGELOG.md` with
   categorized notes (Added / Fixed / Changed) summarizing the commits since the
   last release tag. The heading MUST be `## [<version>] - YYYY-MM-DD` —
   `npm run validate` parses that exact shape and fails on a bare `## <version>`.
3a. **Audit the range — every commit, no sampling.** `npm run validate` only
   checks that a section for the new version *exists*; nothing checks that it
   *covers* the range, so this walk is the only gate. List the commits:

   ```bash
   git log $(git describe --tags --abbrev=0)..HEAD --format='%h %an %s' --reverse
   ```

   Account for each one individually — it maps to an entry you just wrote, or to
   one of exactly three exclusions: the release bump itself, a merge commit whose
   branch commits are already accounted for, or a bot `chore:` star-history
   refresh. Everything else earns an entry, **including** internal hardening with
   no user-visible behavior change (a new validator check, a test-only guard) and
   **including** maintainer-facing doc fixes from outside contributors, who are
   credited by `@handle`. Watch two traps: a commit that landed after the tag
   reads as prior state when a later entry mentions it in passing, and a commit
   whose own message says "this belongs in the next release's changelog entry" is
   invisible unless you read the range. Both slipped through 1.6.0.
4. **Validate.** `npm run validate` — fails if any manifest, any version-bearing
   text file, or the CHANGELOG entry is out of sync. Fix and re-run until clean.
   Then `npm test`.
5. **Commit & push.** Stage everything `npm run bump` rewrote plus `CHANGELOG.md` —
   read `git status` rather than naming files, because the version-bearing set is
   discovered from disk and is more than one README; commit
   with a conventional message (`chore(release): bump version to <version>`); push
   to `main` (direct-to-main repo — no PR).
6. **Tag & publish.** Create the GitHub release:
   `gh release create v<version> --title "v<version>" --notes "<changelog section>"`.

Report the released version and the GitHub release URL when done.
