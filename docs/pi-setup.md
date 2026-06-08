# pi Setup

[pi](https://github.com/earendil-works/pi) (the earendil-works coding agent) natively loads
[Agent Skills](https://agentskills.io) and reads `AGENTS.md` / `CLAUDE.md`, so all six brooks-lint
modes run with no conversion.

## Install

```bash
# simplest — one command (global)
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- pi

# from a clone
./scripts/install.sh pi            # global:  ~/.pi/agent/skills
./scripts/install.sh pi --project  # this repo: ./.pi/skills
```

Or **don't copy at all** — point pi at a clone via settings (`~/.pi/settings.json`, or project
`.pi/settings.json`):

```json
{ "skills": ["/path/to/brooks-lint/skills"] }
```

pi can also reuse other tools' skill folders the same way, e.g. `{ "skills": ["~/.claude/skills"] }`
(only if that folder is flat).

## Invoke

Ask naturally ("review this PR", "audit the architecture"), or use the auto-registered command form
`/skill:brooks-review`. `AGENTS.md` carries the Iron Law and Health Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders.
- pi caps `description` at 1024 chars; brooks-lint's longest is ~920, so all six skills load cleanly.
- 🧪 Documented per the official [skills docs](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md);
  community end-to-end verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
