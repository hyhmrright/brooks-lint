# Security Policy

## Scope

brooks-lint is a multi-platform AI code review plugin/skill package for Claude Code, Codex CLI, and Gemini CLI. It is primarily a set of Markdown skill files, plugin manifests, and shell hooks. It contains no long-running service, no bundled network client, and no application data store. The main attack surface is the prompt and hook content itself.

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
