# Cursor Setup

[Cursor](https://cursor.com) added native [Agent Skills](https://agentskills.io) support in 2.4. It
loads `SKILL.md` skills and reads `AGENTS.md`, so all six brooks-lint modes run with no conversion.

## Install

```bash
# simplest — one command (global)
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- cursor

# from a clone
./scripts/install.sh cursor            # global:  ~/.cursor/skills
./scripts/install.sh cursor --project  # this repo: ./.cursor/skills
```

Manual equivalent:

```bash
git clone https://github.com/hyhmrright/brooks-lint.git /tmp/brooks-lint
mkdir -p ~/.cursor/skills
cp -r /tmp/brooks-lint/skills/* ~/.cursor/skills/   # flat — brooks-* and _shared/ as siblings
```

Cursor also loads `.agents/skills/` / `~/.agents/skills/` and existing Claude/Codex skill folders, so
`./scripts/install.sh agents` works too and is shared with Copilot and pi.

## Invoke

Ask naturally ("review this PR", "audit the architecture") and Cursor selects the matching skill from
its `description`, or use the `/brooks-review` slash form once the skill is discovered.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders.
- 🧪 Documented per the official [skills docs](https://cursor.com/docs/skills); community end-to-end
  verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
