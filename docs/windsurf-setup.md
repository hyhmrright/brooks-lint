# Windsurf Setup

[Windsurf](https://windsurf.com) (Cascade) natively loads [Agent Skills](https://agentskills.io) and
reads `AGENTS.md`, so all six brooks-lint modes run with no conversion.

## Install

```bash
# simplest — one command (global)
curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- windsurf

# from a clone
./scripts/install.sh windsurf            # global:  ~/.codeium/windsurf/skills
./scripts/install.sh windsurf --project  # this repo: ./.windsurf/skills
```

Prefer a manual copy? Clone the repo and `cp -r skills/* ~/.codeium/windsurf/skills/` — the contents, not the
`skills/` folder itself, so `_shared/` lands as a sibling of the `brooks-*` folders.

## Invoke

Ask naturally ("review this PR", "audit the architecture") — Cascade selects the matching skill from
its `description`. The repo's `AGENTS.md` is read by Windsurf's rules engine and carries the Iron Law
and Health Score rules. (`@skill-name` also references a discovered skill.)

## Notes

- **Flat layout** is mandatory (the installer guarantees it): `../_shared/` only resolves when
  `_shared/` is a sibling of the `brooks-*` folders.
- 🧪 Documented per the official [Cascade skills docs](https://docs.windsurf.com/windsurf/cascade/skills);
  community end-to-end verification welcome — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
