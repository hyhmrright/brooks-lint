# Brooks-Lint v0.2 设计文档

**日期**：2026-03-26
**状态**：已批准，待实现
**目标版本**：v0.2.0

---

## 背景与目标

brooks-lint v0.1 是一个原型，核心内容（七原则框架、审查清单）已有，但缺乏作为 Claude Code 插件的工程化基础设施。对标 [superpowers](https://github.com/obra/superpowers) 的成熟插件结构，v0.2 目标是将 brooks-lint 改造为可通过 `/plugin install` 安装、可上 Claude 官方 marketplace 的成熟插件。

**关键决策：**
- 移除 `scripts/complexity_analyzer.py`，skill 完全由提示词驱动（无外部依赖）
- 一个主 skill + 三个斜杠命令（模式切换型，对标 superpowers 风格）
- session-start hook 注入轻量元指令，skill 内容按需加载

---

## 目录结构

```
brooks-lint/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
│
├── skills/
│   └── brooks-lint/
│       ├── SKILL.md
│       ├── brooks-principles.md
│       ├── pr-review-guide.md
│       ├── architecture-guide.md
│       └── debt-guide.md
│
├── hooks/
│   ├── hooks.json
│   └── session-start
│
├── commands/
│   ├── brooks-review.md
│   ├── brooks-audit.md
│   └── brooks-debt.md
│
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-03-26-brooks-lint-v2-design.md
│
├── assets/
│   └── logo.svg
├── package.json
├── CHANGELOG.md
├── README.md
├── LICENSE
└── CLAUDE.md
```

**从 v0.1 的变化：**
- `SKILL.md` 从根目录移入 `skills/brooks-lint/`
- `references/` 内容重写并拆分为 4 个辅助文件，移入 `skills/brooks-lint/`
- `scripts/complexity_analyzer.py` 删除
- 新增：`.claude-plugin/`、`hooks/`、`commands/`、`package.json`、`CHANGELOG.md`

---

## 插件基础设施

### `.claude-plugin/plugin.json`

```json
{
  "name": "brooks-lint",
  "description": "Code quality reviews through the lens of The Mythical Man-Month — Brooks's 7 principles as a Claude Code skill",
  "version": "0.2.0",
  "author": {
    "name": "hyhmrright",
    "email": "hyhmrright@gmail.com"
  },
  "homepage": "https://github.com/hyhmrright/brooks-lint",
  "repository": "https://github.com/hyhmrright/brooks-lint",
  "license": "MIT",
  "keywords": [
    "code-quality",
    "code-review",
    "brooks-law",
    "mythical-man-month",
    "architecture",
    "tech-debt"
  ]
}
```

### `.claude-plugin/marketplace.json`

```json
{
  "name": "brooks-lint-marketplace",
  "description": "Marketplace for brooks-lint plugin",
  "owner": {
    "name": "hyhmrright",
    "email": "hyhmrright@gmail.com"
  },
  "plugins": [
    {
      "name": "brooks-lint",
      "description": "Code quality reviews through the lens of The Mythical Man-Month",
      "version": "0.2.0",
      "source": "./",
      "author": {
        "name": "hyhmrright",
        "email": "hyhmrright@gmail.com"
      }
    }
  ]
}
```

### `package.json`

```json
{
  "name": "brooks-lint",
  "version": "0.2.0",
  "type": "module"
}
```

---

## Hooks

### `hooks/hooks.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start\"",
            "async": false
          }
        ]
      }
    ]
  }
}
```

### `hooks/session-start`

bash 脚本，输出 JSON 格式的 `additionalContext`，内容为：

> 你已安装 brooks-lint 插件。当用户进行代码审查、架构讨论、技术债务评估，或提到"人月神话"、"Brooks 定律"、"概念完整性"等概念时，使用 `Skill` 工具加载 `brooks-lint` skill。可用斜杠命令：`/brooks-review`（PR 审查）、`/brooks-audit`（架构审查）、`/brooks-debt`（技术债务评估）。

注入内容保持轻量（< 100 字），不注入 SKILL.md 全文。同时兼容 Cursor 和 Claude Code 两种平台（通过 `CURSOR_PLUGIN_ROOT` / `CLAUDE_PLUGIN_ROOT` 环境变量判断输出格式）。

---

## 斜杠命令

三个命令结构相同，均位于 `commands/` 目录：

### `commands/brooks-review.md`
```markdown
---
description: Run a Brooks-Lint PR review on the current code changes
---

Use the brooks-lint skill to perform a PR review (Mode 1).
Analyze the current code or diff from the perspective of Brooks's 7 principles.
Load pr-review-guide.md for the detailed checklist.
```

### `commands/brooks-audit.md`
```markdown
---
description: Run a Brooks-Lint architecture audit on the current codebase
---

Use the brooks-lint skill to perform an architecture audit (Mode 2).
Analyze the project structure from the perspective of Brooks's 7 principles.
Load architecture-guide.md for the detailed audit framework.
```

### `commands/brooks-debt.md`
```markdown
---
description: Run a Brooks-Lint tech debt assessment on the current codebase
---

Use the brooks-lint skill to perform a tech debt assessment (Mode 3).
Categorize and prioritize technical debt using Brooks's framework.
Load debt-guide.md for the debt classification and roadmap template.
```

---

## SKILL.md 结构

位置：`skills/brooks-lint/SKILL.md`

### Frontmatter

```yaml
---
name: brooks-lint
description: >
  Use for code review, architecture review, or tech debt assessment.
  Triggers when: user asks to review code, discuss architecture health,
  assess maintainability, or mentions Brooks's Law / Mythical Man-Month /
  conceptual integrity / second system effect / no silver bullet.
  Also triggers when user asks why the codebase is hard to maintain,
  why adding developers isn't helping, or why complexity keeps growing.
---
```

### 正文结构

```
# Brooks-Lint

## The Iron Law
一句核心原则：区分本质复杂度（问题域本身决定）和偶然复杂度（实现方式引入）。
审查的唯一目的是识别并消除偶然复杂度，同时接受本质复杂度的存在。

## When to Use
- 自动触发场景列表
- 斜杠命令强制触发说明

## Mode Detection
上下文判断逻辑：
- 有代码 diff / PR 内容 → Mode 1: PR Review
- 有目录结构 / 多文件分析 / 架构描述 → Mode 2: Architecture Audit
- 用户问"为什么慢/难维护/加人没用" → Mode 3: Tech Debt Assessment
- 用户用斜杠命令 → 强制指定模式

## Mode 1: PR Review
触发条件 + 执行步骤（引用 pr-review-guide.md）+ 输出模板

## Mode 2: Architecture Audit
触发条件 + 执行步骤（引用 architecture-guide.md）+ 输出模板

## Mode 3: Tech Debt Assessment
触发条件 + 执行步骤（引用 debt-guide.md）+ 输出模板

## Output Format
七维度评分模板（所有模式共用）：
- 评分：⬛⬛⬛⬜⬜ 3/5 格式
- 关键发现：🔴 严重 / 🟡 警告 / 🟢 亮点
- 重构建议：P0 / P1 / P2 优先级
- Brooks 语录：每份报告附一条相关原文引用

## Reference Files
列出四个辅助文件及使用时机：
- brooks-principles.md：评分时需要权威依据时读
- pr-review-guide.md：Mode 1 执行时读
- architecture-guide.md：Mode 2 执行时读
- debt-guide.md：Mode 3 执行时读
```

---

## 辅助文件内容策略

所有辅助文件遵循统一写法原则：
- 开头一句 "Core principle" 说明文件存在的理由
- 用具体可判断的问题代替抽象原则
- 只写判断标准和行动指引，不写教程

### `brooks-principles.md`

七大原则各含三块内容：
1. Brooks 原文核心观点（1-2句）
2. 代码层面的具体表现（可观测的症状）
3. 1-5 分评分标准（每分对应具体状态描述）

### `pr-review-guide.md`

按七个维度组织的 PR 检查清单：
- 每个维度 5-8 条具体问题（可直接判断 yes/no）
- 有问题才记录，无问题不输出
- 包含"快速跳过"条件（某维度明显健康时直接跳过）

### `architecture-guide.md`

两层分析框架：
- 模块层：依赖流向、接口宽度、变更传播半径分析方法
- 系统层：Conway 定律映射、概念完整性检查
- 附：模块依赖图文本绘制模板（供 Claude 输出结构化依赖关系）

### `debt-guide.md`

五类债务框架：
- 概念债务、结构债务、过度工程债务、知识债务、测试债务
- 每类：识别特征 + 严重程度判断标准（高/中/低）
- 偿还路线图输出模板（P0/P1/P2）

---

## 实现优先级

| 优先级 | 内容 | 说明 |
|--------|------|------|
| P0 | 目录结构重组 | 移动文件，删除 scripts/ |
| P0 | `.claude-plugin/` 基础设施 | plugin.json、marketplace.json |
| P0 | `hooks/` 实现 | session-start 脚本 + hooks.json |
| P0 | `skills/brooks-lint/SKILL.md` 重写 | 核心内容 |
| P1 | 三个辅助文件重写 | brooks-principles、pr-review、architecture、debt |
| P1 | `commands/` 三个斜杠命令 | brooks-review、brooks-audit、brooks-debt |
| P1 | `package.json` + `CHANGELOG.md` | 版本管理 |
| P2 | `README.md` 更新 | 新安装方式 |

---

## 不在本次范围内

- 多平台支持（Cursor / Codex / Gemini）— v0.3
- 自动化测试（`tests/` 目录）— v0.3
- CI/CD GitHub Action — v0.5
