---
type: llm
focus: last_message
---
Facts about the diff under review (the answer is expected to be written in Chinese; judge its content):
- `docs/bob-setup.md` says `./scripts/install.sh bob` installs to "`~/.bob/skills` (or `$BOB_HOME/skills`)", lists a skill root "`<bob_home>/skills` (default `~/.bob/skills`)", and says Bob loads `$BOB_HOME/AGENTS.md`.
- `scripts/install.sh` `global_dir()` hard-codes `bob) printf '%s' "$HOME/.bob/skills"`; nothing in the installer reads `BOB_HOME`.

PASS only if the answer identifies that the documentation promises `$BOB_HOME` support (a configurable Bob home) that the installer does not implement — i.e. a user who sets `BOB_HOME` still gets the skills installed under `$HOME/.bob/skills` — and names both sides (the setup doc and `install.sh` / `global_dir`).

FAIL if `BOB_HOME` is not discussed, or is mentioned only as a documentation detail without noting that the installer ignores it.
