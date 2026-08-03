# Security Policy

## Scope

brooks-lint is a multi-platform AI code review plugin/skill package for Claude Code, Codex CLI, and Gemini CLI. It is primarily a set of Markdown skill files, plugin manifests, and shell hooks. It runs no long-running service and stores no application data.

The attack surface, in rough order of exposure:

- **Prompt and hook content** — the skill instructions themselves, and the SessionStart hook that writes short-form command wrappers into `~/.claude/commands/`.
- **`scripts/install.sh`** — documented as a `curl … | bash` one-liner. It clones this repository over the network and copies files into a per-platform skills folder under `$HOME`. Reviewing the script before piping it to a shell is always reasonable; the repo-local form (`./scripts/install.sh <platform>`) avoids the pipe entirely.
- **The GitHub Action** (`.github/actions/brooks-lint`) — installs the pinned Anthropic SDK and sends the diff under review to the Anthropic API using the caller's `ANTHROPIC_API_KEY`. It writes no secrets to disk and posts only the generated report back to the PR.
- **The docs site** (`docs/`) — static GitHub Pages; the only third-party code is a version-pinned Mermaid bundle on the gallery page.

If you believe a skill prompt could be crafted to cause Claude to behave in a harmful or unintended way (prompt injection via malicious code input, jailbreak vectors in skill instructions, etc.), please report it privately.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security concerns.**

Email: hyhmrright@gmail.com

Or use [GitHub's private vulnerability reporting](https://github.com/hyhmrright/brooks-lint/security/advisories/new).

You can expect an acknowledgement within 48 hours and a resolution or status update within 7 days.

## What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)
