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

Execute these steps in order. `bump-version.mjs` reads the version FROM
`package.json` and does NOT touch the changelog — so the version edit and the
CHANGELOG entry are manual; the script only fans the version out to manifests + badge.

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
   last release tag (`git log <last-tag>..HEAD --oneline`). The heading MUST be
   `## [<version>] - YYYY-MM-DD` — `npm run validate` parses that exact shape and
   fails on a bare `## <version>`.
4. **Validate.** `npm run validate` — fails if any manifest, the README badge, or
   the CHANGELOG entry is out of sync. Fix and re-run until clean. Then `npm test`.
5. **Commit & push.** Stage the changed manifests, README, and CHANGELOG; commit
   with a conventional message (`chore(release): bump version to <version>`); push
   to `main` (direct-to-main repo — no PR).
6. **Tag & publish.** Create the GitHub release:
   `gh release create v<version> --title "v<version>" --notes "<changelog section>"`.

Report the released version and the GitHub release URL when done.
