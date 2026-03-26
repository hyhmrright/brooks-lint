# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**brooks-lint** 是一个 Claude Code Plugin，将《人月神话》(The Mythical Man-Month) 的七大原则转化为可执行的代码质量审查框架。核心产物是 `skills/brooks-lint/SKILL.md`（供 Claude Code 安装使用的 skill 定义）。

## Install

```bash
# Via plugin manager (recommended)
/plugin install hyhmrright/brooks-lint

# Manual
cp -r skills/brooks-lint/ ~/.claude/skills/brooks-lint
```

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

## Development Gotchas

- **Hook 测试**：`bash hooks/session-start` 直接运行可验证 JSON 输出格式；`CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start` 测试 Claude 平台分支
- **Skill 同步**：`skills/brooks-lint/` 与 marketplace 安装路径 (`~/.claude/plugins/...`) 是两份独立副本，修改后需手动重新安装
- **package.json**：`"type": "module"` 为 v0.3 JS/TS 阶段占位，当前无 JS 代码，不影响运行

## Roadmap（开发时注意）

- v0.3：Mermaid 依赖图输出
- v0.4：Git 历史集成，追踪 Brooks 评分变化趋势
- v0.5：GitHub Action
- v1.0：VS Code 扩展
