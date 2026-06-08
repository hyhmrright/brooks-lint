# Getting Started — brooks-lint on any agent

brooks-lint is six [Agent Skills](https://agentskills.io) (`SKILL.md` + Markdown guides) plus a
shared `_shared/` framework folder. **Any coding agent that loads Agent Skills can run all six modes
with no conversion** — you just place the `skills/` directory where that agent looks for skills.

## The one thing that matters: flat layout

Every skill reads the shared framework via the relative path `../_shared/common.md`. That only
resolves when `_shared/` is a **sibling** of the `brooks-*` folders:

```
<skills-dir>/
├── brooks-review/SKILL.md     ← reads ../_shared/common.md
├── brooks-audit/SKILL.md
├── …
└── _shared/                   ← sibling, no SKILL.md (ignored as a skill, read as files)
```

So always copy `skills/*` **flat** — never nest everything under one `brooks-lint/` folder for the
platforms that discover skills with a single-level glob (`skills/<name>/SKILL.md`).

## Simplest install — one command

The installer copies the skills flat into the correct folder for your platform, so you can't get the
layout wrong:

```bash
# from a clone
./scripts/install.sh <platform>

# or without cloning
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- <platform>
```

`<platform>` ∈ `opencode · cursor · windsurf · antigravity · pi · kiro · copilot · claude · agents`.
Add `--project` to install into the current repo instead of your global config. `agents` targets the
vendor-neutral `~/.agents/skills` folder that Cursor, Copilot, and pi all read.

## Per-platform guides

| Platform | Guide | Discovers `SKILL.md` from | Reads `AGENTS.md` |
|----------|-------|---------------------------|:-----------------:|
| OpenCode | [opencode-setup.md](opencode-setup.md) | `~/.config/opencode/skills`, `.opencode/skills`, `~/.claude/skills` | ✅ |
| Cursor | [cursor-setup.md](cursor-setup.md) | `~/.cursor/skills`, `.cursor/skills`, `.agents/skills` | ✅ |
| Windsurf | [windsurf-setup.md](windsurf-setup.md) | `~/.codeium/windsurf/skills`, `.windsurf/skills` | ✅ |
| Antigravity | [antigravity-setup.md](antigravity-setup.md) | `.agent/skills`, `~/.gemini/skills` | ✅ |
| pi | [pi-setup.md](pi-setup.md) | `~/.pi/agent/skills`, `.pi/skills`, settings array | ✅ |
| GitHub Copilot | [copilot-setup.md](copilot-setup.md) | `.github/skills`, `.claude/skills`, `~/.copilot/skills` | ✅ |
| Kiro | [kiro-setup.md](kiro-setup.md) | `.kiro/skills`, `~/.kiro/skills` | ✅ |

For Claude Code, Gemini CLI, and Codex CLI, see the [README install section](../README.md#installation).

## Any other agent

If your agent accepts a skills folder or an instruction file, brooks-lint works:

- **Loads `SKILL.md`?** Point it at a flat `skills/` folder (use `install.sh agents` for the neutral
  `~/.agents/skills`).
- **Only reads an instructions file** (`AGENTS.md` / `CLAUDE.md` / a system prompt)? Add the repo's
  `AGENTS.md` so the agent learns the Iron Law and scoring, then have it read the relevant
  `skills/<mode>/SKILL.md` on demand.

## Verification status

The marketplace-installed platforms (Claude Code, Gemini CLI, Codex CLI) are maintainer-verified. The
seven Agent-Skills platforms above are documented from each tool's official skill spec and verified at
the file-layout level (the installer is tested), but not yet end-to-end run by the maintainer on every
platform. **Tried one? Tell us** — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new)
with the platform, version, and what you saw, working or broken.
