# IBM Bob Setup

[IBM Bob](https://bob.ibm.com) (`bob`) is IBM's AI-powered developer agent — an "everything is a
skill" architecture with a chat interface and IDE integrations. It natively loads
[Agent Skills](https://agentskills.io) and reads `AGENTS.md`, so all six brooks-lint modes run with
no conversion.

## Install

```bash
# simplest — one command (global)
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- bob

# from a clone
./scripts/install.sh bob            # global: ~/.bob/skills
./scripts/install.sh bob --project  # this repo: ./.bob/skills
```

Prefer a manual copy? Clone the repo and `cp -r skills/* ~/.bob/skills/` — the contents, not the
`skills/` folder itself, so `_shared/` lands as a sibling of the `brooks-*` folders.

Bob scans these skill roots, highest priority first, so an existing vendor-neutral install is picked
up automatically:

| Root | Notes |
|---|---|
| `<projectRoot>/.bob/skills` | what `--project` writes |
| `~/.bob/skills` | what the global install writes |

When the same skill name appears in two roots, the project-level skill takes precedence.

## Invoke

Just ask — Bob routes to a skill from its `description`:

- "review this PR" → `brooks-review`
- "audit the architecture" → `brooks-audit`
- "where's our worst tech debt?" → `brooks-debt`

For explicit invocation, type `/` followed by the skill token in the chat prompt, or type it by
hand: `/brooks-review`, `/brooks-audit`, `/brooks-debt`, `/brooks-test`, `/brooks-health`,
`/brooks-sweep`. The repo's `AGENTS.md` carries the Iron Law (Symptom → Source →
Consequence → Remedy) and the Health Score rules; Bob also loads `~/.bob/AGENTS.md` plus every
`AGENTS.md` from the project root down to your working directory.

## Notes

- IBM Bob is available at [bob.ibm.com](https://bob.ibm.com); download and sign-in instructions
  are on that page.
- 🧪 Documented per IBM's [Skills](https://bob.ibm.com/docs/ide/features/skills) and
  [Configuring](https://bob.ibm.com/docs/shell/configuration/configuring) pages; community
  end-to-end verification welcome —
  [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
