# npm and DSH market publishing

The npm package provides a portable skills installer and the DSH bundle provider.
It installs Agent Skills into supported coding agents; it is not a native IDE extension.
The canonical platform inventory and paths remain in `scripts/install.sh`. The Node
installer reads those mappings as data without executing the shell script.

## Publication authorization and version history

The user approved the unified 1.9.1 GitHub/npm release and DSH market publication, conditional on
all remote CI jobs passing for the exact release commit. Complete the gates below before publishing.
Approval covers publication after those gates, so preparation does not require another confirmation.

npm 1.9.0 was withdrawn and npm forbids reusing that version. Keep GitHub, npm, and the repository's
single-source version aligned for this release and use a new version for every subsequent npm release.

The npm CLI requires Node.js 20+ and npm. It covers 13 named coding tools plus the generic `agents`
target. These are Agent Skills installations, not native IDE extensions. Installation checks validate
paths and packaged resources; they do not establish runtime compatibility in every host.
The project's DSH index is generated and deployed after npm publication. Community-market inclusion
requires those maintainers' review; submissions do not imply acceptance.

## Release checklist

Complete these checks before publication:

- Synchronize all six README translations, CHANGELOG, four plugin manifests, version references,
  setup/publishing documentation, and the docs website with the actual release state.
- Synchronize GitHub About, topics, and relevant issue labels from
  `.github/repository-metadata.json` with `npm run github:metadata -- --apply`, then run
  `npm run github:metadata -- --check` to confirm the remote state.
- Audit every commit in the release range and retain historical platform verification accurately.
- Propagate versions through `npm run bump`; do not hand-edit version references.
- Run the offline validation, unit tests, structural evals, and parser benchmark. Push the exact
  prepared commit and require every remote Validate CI job for that commit to pass.
- If the user has placed publication on hold, obtain explicit approval before npm publication,
  GitHub release/tag creation, or DSH index generation/deployment. Approval must cover the fresh npm
  version because withdrawn npm 1.9.0 cannot be reused.

## Publication procedure

1. Follow the repository release procedure, including the complete changelog audit,
   version propagation, offline validation, unit tests, structural evals, and parser benchmark.
   After pushing, wait for the `Validate` workflow on the exact release commit
   to finish successfully on every Node.js version. A local pass is insufficient;
   do not create the release or publish to npm while CI is pending or failing.
   `npm run release:ci` checks the exact commit, every remote job, and the managed GitHub metadata. The npm
   `prepublishOnly` hook enforces it automatically, including for dry runs.
2. Run `npm publish --dry-run` and inspect the packed files. The package must contain
   `bin/`, `lib/`, `scripts/install.sh`, `scripts/npm-platforms.mjs`, `skills/` including
   `_shared/`, and `cordis.patch.yml`. No install lifecycle script is required.
3. After the exact-commit CI gate passes, create the matching Git tag and GitHub release,
   then publish the verified npm artifact with `npm publish --access public`. npm authentication
   and any account-required second factor must be satisfied by the publisher. Keep all three
   version numbers aligned and include specific contributor credits in the release notes.
4. Verify `npm view brooks-lint version` and install the registry artifact in an isolated
   directory. Verify both the CLI installer and all six DSH provider skills.
5. Run `npm run market:generate` after publication. It reads the exact local version
   from npm and uses the registry's publication timestamp; unpublished versions fail.
6. Commit and push `docs/dsh/index.json`, then check the Pages URL returns the new index:
   `https://hyhmrright.github.io/brooks-lint/dsh/index.json`.

## Discovery

DSH has no default market index. After npm publication and verified index deployment, users add
the project's index URL in Discover and search for `brooks-lint`. They can also enter `brooks-lint`
in Add plugin directly. Adding the custom source is required for market search.
The market generator pins an npm version, so running it is part of every npm release.

For broader discovery, submit the repository to
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
and the npm package to
[Open Plugin Market](https://github.com/polang233/dsh-plugin-index/blob/main/.github/CONTRIBUTING.md).
Community inclusion depends on those maintainers' review. Publication to npm or
the project's own index does not imply acceptance by a community market.

Installation tests validate copied files, paths, and packaged resources. They do not
establish fresh end-to-end verification inside every listed coding agent; the
repository's maintainer testing policy still applies.
