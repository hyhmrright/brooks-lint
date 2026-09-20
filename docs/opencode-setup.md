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

Those two paths are unchanged on OpenCode v2. v2 additionally scans `~/.claude/skills` and
`~/.agents/skills`, so an existing Claude Code install (if flat) is picked up automatically, and
`./scripts/install.sh agents` covers OpenCode too.

## Invoke

Just ask — OpenCode auto-selects skills from each `description`:

- "review this PR" → `brooks-review`
- "audit the architecture" → `brooks-audit`
- "where's our worst tech debt?" → `brooks-debt`

For explicit invocation on v2, each `SKILL.md` opts into the slash menu with
`metadata: opencode/slash: "true"`, so the six modes show up in the `/` popup and run directly:

```
/brooks-review  /brooks-audit  /brooks-debt  /brooks-test  /brooks-health  /brooks-sweep
```

Two alternatives work regardless: `/skills` lists every discovered skill so you can pick one, and
typing `@brooks-review` attaches that skill to your prompt instead of running it standalone.

On OpenCode 1.x (still what npm `latest` installs — the 1.18.x line) the opt-in flag is ignored, so use
`/skills` → pick, or type `/brooks-review` **followed by a space** — a bare `/brooks-review` plus
Enter is swallowed by the `/` popup.

The repo's `AGENTS.md` carries the Iron Law (Symptom → Source → Consequence → Remedy) and the Health
Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): skills read `../_shared/`, which only
  resolves when `_shared/` sits beside the `brooks-*` folders.
- **Do not add same-named commands.** On v2 a command that shares a skill's name *shadows* the
  skill: the `/` popup hides skills already registered as commands, and submit resolves a command
  before a skill. The `opencode/slash` opt-in is the supported way to get `/brooks-*` in the menu.
- 🧪 Documented per the official [skills](https://opencode.ai/docs/skills/) and
  [rules](https://opencode.ai/docs/rules/) docs; community end-to-end verification welcome —
  [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
