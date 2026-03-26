# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** 是一个 Claude Code Skill，将《人月神话》(The Mythical Man-Month) 的七大原则转化为可执行的代码质量审查框架。它的核心产物是 `SKILL.md`（供 Claude Code 安装使用的 skill 定义），以及辅助工具 `scripts/complexity_analyzer.py`（纯 Python，无外部依赖）。

## Running the Analyzer

No scripts required. The skill is entirely prompt-driven — install via `/plugin install` or copy `skills/brooks-lint/` to `~/.claude/skills/`.

## Architecture

### Structure

```
brooks-lint/
├── .claude-plugin/          # Plugin metadata for /plugin install
├── skills/brooks-lint/      # The skill itself
│   ├── SKILL.md             # Main skill — self-contained workflow + mode detection
│   ├── brooks-principles.md # Scoring rubrics for all 7 dimensions (read on demand)
│   ├── pr-review-guide.md   # Mode 1: PR review checklist (read when running Mode 1)
│   ├── architecture-guide.md# Mode 2: Architecture audit framework
│   └── debt-guide.md        # Mode 3: Tech debt classification
├── hooks/                   # SessionStart hook for session-level awareness
└── commands/                # /brooks-review, /brooks-audit, /brooks-debt
```

### How the skill works

1. `hooks/session-start` injects a brief note into every session: "brooks-lint is installed, use Skill tool to load it for code reviews"
2. When triggered, Claude loads `skills/brooks-lint/SKILL.md` via the Skill tool
3. SKILL.md detects the mode (PR Review / Architecture Audit / Tech Debt) from context
4. Claude reads the relevant guide file (`pr-review-guide.md`, `architecture-guide.md`, or `debt-guide.md`)
5. Claude scores across 7 Brooks dimensions using `brooks-principles.md` as the scoring rubric
6. Output follows the standard report template in SKILL.md

### Running the analyzer

No scripts required. The skill is entirely prompt-driven.

## Skill 安装方式

将 `skills/brooks-lint/` 复制到 `~/.claude/skills/brooks-lint`，即可被 Claude Code 自动发现并在相关代码审查场景中触发。

## Roadmap（开发时注意）

- v0.2：JS/TS AST 深度分析（替换当前的正则估算）
- v0.3：Mermaid 依赖图输出
- v0.4：Git 历史集成，追踪 Brooks 评分变化趋势
- v0.5：GitHub Action
- v1.0：VS Code 扩展
