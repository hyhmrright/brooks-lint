# DeepSeek Harness (dsh) Setup

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) is DeepSeek AI's
open-source agent harness — an "everything is a plugin" architecture with a Web UI, started with
`npx @deepseek-ai/dsh web`. It natively loads [Agent Skills](https://agentskills.io) and reads
`AGENTS.md`, so all six brooks-lint modes run with no conversion.

## Install the npm plugin

Enter `brooks-lint` in **Plugins → Add plugin**, or use the DSH CLI:

```bash
dsh plugin --profile web add brooks-lint
```

For the desktop app, use `dsh plugin --profile desktop add brooks-lint`. Fully quit the desktop
app before changing its profile from the CLI, then reopen it. The plugin registers all six modes
and provides their shared framework resources.

Many thanks to [@Sad-happy](https://github.com/Sad-happy) for implementing the native DSH bundle
and skill provider in [PR #44](https://github.com/hyhmrright/brooks-lint/pull/44), then verifying
installation with the DSH 0.2.1-rc.2 desktop app. This community contribution made package-name
installation possible; it does not change the maintainer's Codex-only ongoing testing policy.

## Search in Discover

DSH ships no market index by default. Enable **Plugins → Experimental plugins → More → Custom
plugin markets**, open **Discover → Add index source**, and add the project's index:

```text
https://hyhmrright.github.io/brooks-lint/dsh/index.json
```

Then search for `brooks-lint` and confirm installation. Index sources belong to the current profile.
Adding this custom source is required for search; publication does not add it to every user's DSH.
Inclusion in other community markets depends on their maintainers' review and remains pending.
See the [official plugin-market guide](https://deepseek-harness.github.io/deepseek-harness/en/guide/plugin-market).

## Alternative: install skill files

The universal installer requires **Node.js 20+** and npm:

```bash
npx brooks-lint install dsh
npx brooks-lint install dsh --project
npx brooks-lint install --list
```

Avoid installing both plugin and filesystem copies. The shell installer also remains available:

```bash
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- dsh
# from a clone; add --project for the current repo
./scripts/install.sh dsh
```

For manual installation, copy `skills/*` flat so `_shared/` sits beside the `brooks-*` folders.
Automated installation tests verify file layouts and resources, not behavior in every host.

dsh scans these skill roots, highest priority first, so an existing vendor-neutral install is picked
up automatically:

| Root | Notes |
|---|---|
| `<projectRoot>/.dsh/skills` | what `--project` writes |
| `<projectRoot>/.agents/skills` | shared with Cursor, Copilot, pi |
| `$DSH_HOME/skills` (default `~/.dsh/skills`) | what the global install writes |
| `$DSH_AGENTS_HOME/skills` (default `~/.agents/skills`) | `./scripts/install.sh agents` also covers dsh |

The project root is the nearest ancestor containing `.git`; without one, dsh uses the current
directory. When the same skill name appears in two roots, the higher one wins.

## Invoke

Just ask — dsh routes to a skill from its `description`:

- "review this PR" → `brooks-review`
- "audit the architecture" → `brooks-audit`
- "where's our worst tech debt?" → `brooks-debt`

For explicit invocation, type `/` in the Web UI prompt and pick the skill, or type the token by hand:
`/brooks-review`, `/brooks-audit`, `/brooks-debt`, `/brooks-test`, `/brooks-health`, `/brooks-sweep`.
dsh recognises a whitespace-bounded `/name` anywhere in a message and injects that skill's body
deterministically. The repo's `AGENTS.md` carries the Iron Law (Symptom → Source → Consequence →
Remedy) and the Health Score rules; dsh also loads `$DSH_HOME/AGENTS.md` plus every `AGENTS.md` from
the project root down to your working directory.

## Notes

The following layout details apply to filesystem installation.

- **Flat layout** is mandatory (the installer guarantees it): discovery is one level deep
  (`<root>/<name>/SKILL.md`), never recursive, and the skills read `../_shared/`, which only resolves
  when `_shared/` sits beside the `brooks-*` folders. `_shared/` itself has no `SKILL.md`, so dsh
  ignores it as a skill and the modes read it as ordinary files.
- dsh is in developer preview and warns of compatibility-breaking changes; the skill discovery
  contract above reflects `packages/skill/skill-filesystem` as of August 2026.
- 🧪 Documented per the official [skills subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md)
  docs; community end-to-end verification welcome —
  [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
