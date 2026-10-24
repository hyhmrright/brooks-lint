# npm and DSH market publishing

The npm package provides a portable skills installer and the DSH bundle provider.
It installs Agent Skills into supported coding agents; it is not a native IDE extension.
The canonical platform inventory and paths remain in `scripts/install.sh`. The Node
installer reads those mappings as data without executing the shell script.

## Release

1. Follow the repository release procedure, including the complete changelog audit,
   version propagation, offline validation, unit tests, structural evals, and parser benchmark.
2. Run `npm publish --dry-run` and inspect the packed files. The package must contain
   `bin/`, `lib/`, `scripts/install.sh`, `scripts/npm-platforms.mjs`, `skills/` including
   `_shared/`, and `cordis.patch.yml`. No install lifecycle script is required.
3. Publish the verified release with `npm publish --access public`. npm authentication
   and any account-required second factor must be satisfied by the publisher.
4. Verify `npm view brooks-lint version` and install the registry artifact in an isolated
   directory. Verify both the CLI installer and all six DSH provider skills.
5. Run `npm run market:generate` after publication. It reads the exact local version
   from npm and uses the registry's publication timestamp; unpublished versions fail.
6. Commit and push `docs/dsh/index.json`, then check the Pages URL returns the new index:
   `https://hyhmrright.github.io/brooks-lint/dsh/index.json`.

## Discovery

DSH has no default market index. Users can add the project's index URL in Discover
and search for `brooks-lint`, or enter `brooks-lint` directly in Add plugin.
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
