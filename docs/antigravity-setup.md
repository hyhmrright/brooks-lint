# Antigravity Setup

Google's [Antigravity](https://antigravity.google) uses Claude-compatible
[Agent Skills](https://agentskills.io) and reads `AGENTS.md` / `GEMINI.md`, so all six brooks-lint
modes run with no conversion.

## Install

```bash
# project-scoped is the official convention (recommended)
./scripts/install.sh antigravity --project   # this repo: ./.agent/skills

# global
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- antigravity
./scripts/install.sh antigravity             # global: ~/.gemini/skills
```

Manual equivalent (project):

```bash
git clone https://github.com/hyhmrright/brooks-lint.git /tmp/brooks-lint
mkdir -p .agent/skills
cp -r /tmp/brooks-lint/skills/* .agent/skills/   # flat — brooks-* and _shared/ as siblings
```

## Invoke

Ask naturally ("review this PR", "audit the architecture") — the agent selects the matching skill from
its `description`. `AGENTS.md` / `GEMINI.md` carry the Iron Law and Health Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders.
- The project convention `.agent/skills/` is well documented; the **global** skills path
  (`~/.gemini/skills` vs a product subfolder) varies between sources — if the global install isn't
  discovered, use the project install. Please report what worked.
- 🧪 Documented per the official [skills](https://antigravity.google/docs/skills) and
  [rules & workflows](https://antigravity.google/docs/rules-workflows) docs; community end-to-end
  verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
