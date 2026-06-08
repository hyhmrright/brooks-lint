# GitHub Copilot Setup

GitHub Copilot has supported [Agent Skills](https://agentskills.io) since December 2025 (coding agent,
Copilot CLI, and VS Code agent mode). It reads `AGENTS.md` and **auto-detects existing `.claude/skills`
folders**, so all six brooks-lint modes run with no conversion.

## Install

```bash
# personal (all repos) — one command
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- copilot

# from a clone
./scripts/install.sh copilot            # personal: ~/.copilot/skills
./scripts/install.sh copilot --project  # this repo: ./.github/skills
```

Manual equivalent (commit to a repo so the cloud agent and reviewers share it):

```bash
git clone https://github.com/hyhmrright/brooks-lint.git /tmp/brooks-lint
mkdir -p .github/skills
cp -r /tmp/brooks-lint/skills/* .github/skills/   # flat — brooks-* and _shared/ as siblings
```

Copilot discovers skills from `.github/skills`, `.claude/skills`, `.agents/skills` (project) and
`~/.copilot/skills`, `~/.agents/skills` (personal). `./scripts/install.sh agents` (→ `~/.agents/skills`)
is shared with Cursor and pi.

## Invoke

Ask naturally in Copilot Chat / CLI ("review this PR", "audit the architecture") — Copilot loads the
matching skill on demand from its `description`. `AGENTS.md` (or `.github/copilot-instructions.md`)
carries the Iron Law and Health Score rules.

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders.
- Org/enterprise-level skills were "coming soon" at launch; repo-level `.github/skills` works today.
- 🧪 Documented per the [Agent Skills announcement](https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/)
  and [docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills); community
  end-to-end verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
