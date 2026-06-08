# Kiro Setup

AWS [Kiro](https://kiro.dev) (IDE & CLI) natively loads Claude-compatible
[Agent Skills](https://agentskills.io), reads `AGENTS.md`, and **auto-registers each skill as a slash
command**, so all six brooks-lint modes run with no conversion.

## Install

```bash
# simplest — one command (global)
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- kiro

# from a clone
./scripts/install.sh kiro            # global:  ~/.kiro/skills
./scripts/install.sh kiro --project  # this repo: ./.kiro/skills
```

Manual equivalent:

```bash
git clone https://github.com/hyhmrright/brooks-lint.git /tmp/brooks-lint
mkdir -p ~/.kiro/skills
cp -r /tmp/brooks-lint/skills/* ~/.kiro/skills/   # flat — brooks-* and _shared/ as siblings
```

Or use the IDE: **Agent Steering & Skills** panel → **+** → **Import a skill** → paste a GitHub URL or
pick a local folder (Kiro copies it into your skills folder).

## Invoke

Ask naturally ("review this PR", "audit the architecture"), or use the auto-registered slash command
`/brooks-review`. `AGENTS.md` is always-included and carries the Iron Law and Health Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders.
- Kiro requires the folder name to equal the skill's `name` (✅ already true here), `name` ≤ 64 chars,
  and `description` ≤ 1024 chars (brooks-lint's longest is ~920).
- 🧪 Documented per the official [skills docs](https://kiro.dev/docs/skills/); community end-to-end
  verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
