# OpenCode Setup

[OpenCode](https://opencode.ai) natively loads [Agent Skills](https://agentskills.io) and reads
`AGENTS.md`, so all six brooks-lint modes run with no conversion.

## Install

```bash
# simplest — one command (global)
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- opencode

# from a clone
./scripts/install.sh opencode            # global: ~/.config/opencode/skills
./scripts/install.sh opencode --project  # this repo: ./.opencode/skills
```

Prefer a manual copy? Clone the repo and `cp -r skills/* ~/.config/opencode/skills/` — the contents, not the
`skills/` folder itself, so `_shared/` lands as a sibling of the `brooks-*` folders.

OpenCode also discovers Claude-compatible `~/.claude/skills/*/SKILL.md`, so an existing Claude install
(if flat) is picked up automatically.

## Invoke

Just ask — OpenCode auto-selects skills from each `description`:

- "review this PR" → `brooks-review`
- "audit the architecture" → `brooks-audit`
- "where's our worst tech debt?" → `brooks-debt`

For explicit invocation, `/brooks-review` etc. are available once the skill is discovered. The repo's
`AGENTS.md` carries the Iron Law (Symptom → Source → Consequence → Remedy) and the Health Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): skills read `../_shared/`, which only
  resolves when `_shared/` sits beside the `brooks-*` folders.
- 🧪 Documented per the official [skills](https://opencode.ai/docs/skills/) and
  [rules](https://opencode.ai/docs/rules/) docs; community end-to-end verification welcome —
  [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
