# Codex setup

This guide describes this repository's installer and skill layout. Current
maintainer verification focuses on Codex; it does not guarantee that every Codex
version or execution environment has the same capabilities.

## Install

For current main, clone the repository and run:

```bash
bash scripts/install.sh codex
```

The shell installer maps global Codex installation to `~/.codex/skills`, and
`--project` to `.codex/skills` beneath the current working directory. The portable
npm installer supports the same target and custom `--dir` destinations. For the
latest published package, use `npx brooks-lint@latest install codex` with Node.js 20+.
See [npm](https://www.npmjs.com/package/brooks-lint) and [GitHub Releases](https://github.com/hyhmrright/brooks-lint/releases) for available versions.

Keep `_shared` beside the six `brooks-*` directories. Preserve health's
`score-ledger.md` and `scripts/` resources. This repository's own maintenance
checkout exposes skills under `.agents/skills/` through symlinks; that is distinct
from the installer's copied layout. See [getting started](getting-started.md).

## Invoke and verify scope

Start a new Codex session after installation if discovery has not refreshed.
Ask for a concrete scope:

```text
$brooks-review Review the current diff against its caller contract.
$brooks-test Review the existing tests in tests/payments/ for lost protection.
$brooks-health Assess this repository and state unassessed dimensions explicitly.
```

The agent must read the selected SKILL.md, its guide and shared references. A
successful installation is not evidence that those files were actually read.
Review the session's file-read/tool records when checking activation. Natural
language discovery is host/model-dependent, not a guarantee made by this plugin.

Read-only modes do not authorize edits. Sweep needs an authorized scope and
available editing/verification tools; it must stop honestly when required checks
cannot be completed. A sandbox or missing Node executable may prevent tool-backed
health finalization. The guide requires truthful fallback limits, not fabricated
execution receipts. An explicitly tool-required task stays incomplete without
the required successful execution.

## Keep evaluation separate

Using a skill in your own Codex session differs from running the repository's
behavioral comparison collector. [Codex behavioral evals](codex-behavior-evals.md)
have explicit model selection, isolation and judging rules. Offline fixture
validation does not call a model; live evaluation must be requested separately.
The GitHub Action uses an Anthropic-compatible API and does not consume Codex
login credentials. See [runner contracts](runner-contracts.md).
