# Factory Droid Setup

Factory's [Droid](https://factory.ai) (`droid` CLI) natively loads
[Agent Skills](https://agentskills.io) and reads `AGENTS.md`, so all six brooks-lint modes run with no
conversion.

## Install

```bash
# simplest — one command
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- droid

# from a clone
./scripts/install.sh droid            # personal: ~/.factory/skills
./scripts/install.sh droid --project  # this repo: ./.factory/skills
```

Prefer a manual copy? Clone the repo and `cp -r skills/* ~/.factory/skills/` — the contents, not the
`skills/` folder itself, so `_shared/` lands as a sibling of the `brooks-*` folders.

Droid discovers skills from `~/.factory/skills` (personal), `.factory/skills` (project), and the legacy
`.agent/skills`, each a single level deep.

## Invoke

Ask naturally ("review this PR", "audit the architecture") — Droid auto-loads the matching skill from
its `description` — or use the slash form `/brooks-review` (Droid registers each skill as a command).
`AGENTS.md` carries the Iron Law and Health Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders, and Droid discovers skills only one level deep.
- Droid ignores Claude-only frontmatter fields (e.g. `allowed-tools`); `name` + `description` + body
  are all it needs, so the skills load unchanged.
- 🧪 Documented per the official [skills docs](https://docs.factory.ai/cli/configuration/skills) and
  [AGENTS.md docs](https://docs.factory.ai/cli/configuration/agents-md); community end-to-end
  verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
