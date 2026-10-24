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

Use the existing shell installer from GitHub while npm publication is on hold:

```bash
./scripts/install.sh <platform>
# or without cloning
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- <platform>
```

**Release preparation — publication on hold.** The npm commands below are planned and currently
unavailable. npm 1.9.0 was withdrawn and cannot be reused; a new npm version requires approval.
After publication, Node.js **20+** and npm will provide installation without Git or Bash:

```bash
npx brooks-lint install <platform>
npx brooks-lint install <platform> --project
npx brooks-lint install --list
```

This installs Agent Skills into the selected agent's skill directory; it is not a native IDE extension.
Both installers preserve the flat layout. The inventory covers **13 named coding tools plus the
generic `agents` target**. Installation compatibility checks do not verify runtime behavior in every host.

`<platform>` ∈ `opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · bob ·
gemini · codex · claude · agents`. Add `--project` to install into the current repo instead of your
global config. `agents` targets the vendor-neutral `~/.agents/skills` folder that Cursor, Copilot, pi,
Gemini, Codex, and DeepSeek Harness all read.

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
| Factory Droid | [factory-droid-setup.md](factory-droid-setup.md) | `~/.factory/skills`, `.factory/skills`, `.agent/skills` | ✅ |
| DeepSeek Harness | [dsh-setup.md](dsh-setup.md) | `.dsh/skills`, `.agents/skills`, `~/.dsh/skills`, `~/.agents/skills` | ✅ |
| IBM Bob | [bob-setup.md](bob-setup.md) | `.bob/skills`, `~/.bob/skills` | ✅ |

For Claude Code, Gemini CLI, and Codex CLI, see the [README install section](../README.md#installation).
`./scripts/install.sh gemini` and `./scripts/install.sh codex` also work and use the flat layout these
two require (Gemini discovers skills only one level deep).

## Any other agent

If your agent accepts a skills folder or an instruction file, brooks-lint works:

- **Loads `SKILL.md`?** Point it at a flat `skills/` folder (use `install.sh agents` for the neutral
  `~/.agents/skills`).
- **Only reads an instructions file** (`AGENTS.md` / `CLAUDE.md` / a system prompt)? Add the repo's
  `AGENTS.md` so the agent learns the Iron Law and scoring, then have it read the relevant
  `skills/<mode>/SKILL.md` on demand.

## Verification status

Current maintainer verification covers Codex-related capabilities only. Other integrations retain
historical verification or documentation based on their official skill specifications. Automated
installer checks cover file layouts; they do not establish end-to-end behavior in every host.
This tool list describes compatibility, not a measured market-share percentage.

Community verification is welcome: [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new)
with the platform, version, and what you saw, working or broken.
