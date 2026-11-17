<p align="center"><img src="assets/logo.svg" alt="brooks-lint" width="150"></p>

# brooks-lint

[English](README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

![Source version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![MIT](https://img.shields.io/badge/license-MIT-green.svg)

六个工作流，覆盖代码审查、架构、技术债、测试质量、健康看板与限定范围的修复，以十二本经典软件工程书籍为基础。

已发布版本：[npm](https://www.npmjs.com/package/brooks-lint) · [GitHub Releases](https://github.com/hyhmrright/brooks-lint/releases)

[从 1.9.1 迁移到 2.0.0](docs/migration-v2.md)
brooks-lint 由 Agent Skills、共享指导和小型确定性报告工具组成。诊断由你的编码代理执行；项目提供工作流、风险分类和报告约定。它不是静态分析器，也不保证模型能发现所有缺陷。

## 从 Codex 开始

```bash
# Source checkout: Git + Bash
git clone https://github.com/hyhmrright/brooks-lint.git
cd brooks-lint
bash scripts/install.sh codex
```

```text
$brooks-review Review the current diff and identify supported maintainability risks.
$brooks-health Assess this repository; distinguish missing evidence from clean dimensions.
```

以上命令将当前源码安装到 Codex 的全局技能目录。如果没有发现技能，请启动新会话。项目级安装应在目标项目中通过绝对路径执行安装脚本，并使用 `codex --project`。保留 `_shared` 与六个技能目录的同级关系。详见 [Codex 指南](docs/codex-setup.md)。

使用 Node.js 20+ 安装最新发布版本：`npx brooks-lint@latest install codex`。其他安装目标见[入门指南](docs/getting-started.md)。

## 选择符合任务范围的技能

| 技能 | 适用任务 | 是否修改文件？ |
|---|---|---|
| `$brooks-review` | 审查 diff 或指定代码：契约、证据支持的风险及区分性见证。 | 否 |
| `$brooks-audit` | 模块依赖、职责归属和边界完整性；另有团队入门指南。 | 否 |
| `$brooks-debt` | 识别维护债务、排序并制定偿还计划。 | 否 |
| `$brooks-test` | 审查已有测试：断言能检测和遗漏哪些失败。 | 否 |
| `$brooks-health` | 四个维度的简要评估和有证据范围限制的看板。 | 否 |
| `$brooks-sweep` | 在限定范围内诊断并执行已授权、可验证的修复。 | 是 |

Codex 使用 `$brooks-review`；其他宿主使用自己的调用方式。自然语言触发取决于宿主和模型。Health 是摘要，不是四次穷尽式审计。Sweep 需要编辑和验证能力，并沿用已有授权；不会仅因修改多个文件就再次要求确认。

## 如何理解报告

保留的问题应遵循 **现象 → 来源 → 后果 → 修复**：可观察证据、相关工程原则、影响和适当范围内的建议。书籍引用解释框架，不是诊断正确或章节对应准确的证明。受保护行为与未决义务应如实说明，不凭空扣分；预测结果必须与实际运行的检查区分。

分数是按配置汇总已保留问题的结果，**不是代码正确的概率**。Health 从同一份清单计算代码质量、架构、技术债和测试质量。允许执行工具时，随附 Node 工具生成分数并定稿。必要维度缺少决定性证据时标为 **unassessed**，不输出数值综合分。仅无 diff 的 PR 维度可以 **skipped** 并重新分配权重。已评估且未发现问题不等于未知。

交付工具检查提供的输出字节是否与定稿和凭据一致，不验证诊断正确性、后续界面渲染或传输。无法执行工具时必须说明验证限制，不得虚构凭据。详见[评分清单与工具约定](skills/brooks-health/score-ledger.md)。

Sweep 默认最多 **三轮修复总计**，包括首轮及仅处理 Critical 的轮次；同时遵守用户的时间和工具预算。停止时报告有证据支持的原因与未解决项。局部范围已干净，可以与更广维度仍未知同时成立。详见 [Sweep 指南](skills/brooks-sweep/sweep-guide.md)。

## 风险分类

| 生产代码 | 测试 |
|---|---|
| R1 — 认知过载 | T1 — 测试晦涩 |
| R2 — 变更传播 | T2 — 测试脆弱 |
| R3 — 知识重复 | T3 — 测试重复 |
| R4 — 意外复杂性 | T4 — Mock 滥用 |
| R5 — 依赖失序 | T5 — 覆盖幻觉 |
| R6 — 领域模型失真 | T6 — 架构失配 |

## 十二本书

| Book | Author |
|---|---|
| *The Mythical Man-Month* | Frederick P. Brooks Jr. |
| *Code Complete* | Steve McConnell |
| *Refactoring* | Martin Fowler |
| *Clean Architecture* | Robert C. Martin |
| *The Pragmatic Programmer* | Andrew Hunt & David Thomas |
| *Domain-Driven Design* | Eric Evans |
| *A Philosophy of Software Design* | John Ousterhout |
| *Software Engineering at Google* | Titus Winters, Tom Manshreck & Hyrum Wright |
| *The Art of Unit Testing* | Roy Osherove |
| *How Google Tests Software* | James Whittaker, Jason Arbon & Jeff Carollo |
| *Working Effectively with Legacy Code* | Michael Feathers |
| *xUnit Test Patterns* | Gerard Meszaros |

[来源映射](skills/_shared/source-coverage.md)记录概念、权衡和误报保护。这套风险分类是项目对书中思想的综合，不是这些作者共同制定的官方分类。

<a id="benchmark"></a>

## Benchmark：六个技能，分别带来什么

从一件你本来就要做的事开始：带反例的代码审查、依赖诊断、债务偿还计划、测试缺口分析、有范围的健康报告或经过验证的修复。下表直接展示**全部六个技能**，包括持平和退步。工作流的用途与实测提升分开说明。

| 实验 | 技能与证据 | 基线 → 技能 | 观察到的变化 |
|---|---|---:|---|
| E1 | [review](docs/benchmark-evidence.md#review) | 6/6 → 6/6 | 通过数未增加 |
| E1 | [audit](docs/benchmark-evidence.md#audit) | 6/6 → 6/6 | 通过数未增加 |
| E1 | [test](docs/benchmark-evidence.md#test-the-difference-and-the-correction) | 5/6 → 6/6 | **多 1 份通过回答**；BV5-23 |
| E2 | [debt](docs/benchmark-evidence.md#debt--older-case-only-baseline) | 11/15 → 12/15 | **多 1 份完整且有支持的回答**；旧基线 |
| E3 | [health](docs/benchmark-evidence.md#health--adverse-result-remains-visible) | 15/18 → 10/18 | **少 5 份通过回答**；过度弃评 |
| E3 | [sweep](docs/benchmark-evidence.md#sweep--advantage-limited-to-one-family) | 15/18 → 18/18 | **多 3 份通过回答**；同一案例族的重复 |

**只在同一实验内比较，不跨行排名。** E1：通用清单对照精简技能指导，每技能六案例、每组各一次。E2：旧的仅案例基线对照技能指导，五个 debt 案例各重复三次；统计完整且有支持的回答，不是 E1 的主要行为通过数。E3：通用清单对照完整技能指导，来自 72 份 health/sweep 回答的实验，每技能每组 18 份。sweep 的优势仅来自一个优先级路由案例族。health 后续修复有离线覆盖，但**尚无完成的修复后效果验证**。这些数字不能合成总体正确率或六技能排行榜。

**E1** — CLI 选择 `gpt-6.1-terra / low`；18 个案例 × 两组，共 **36 份回答**，每案例每组一次。E1 行统计离线复核后的主要行为通过数：诊断、契约范围、区分性见证、修复、验证诚实性五个维度全部通过，且没有遗漏预期问题或已确认的虚假声明。

**真实差异 — BV5-23：**契约要求数字字符串返回整数。技能回答指出 309 位数字会变为 `Infinity`，并展示两条现有测试遗漏的保护缺口。清单回答未满足所要求的变异对照维度；没有事后将漏掉这项新增发现计为预期问题漏报。

**公开纠错 — BV5-24：**最初否定了清单回答，随后接受其行为等价的断言失败见证。原判定和修订均保留。复用开发案例中的一个配对优势，不代表普遍优越。

### 从你的代码里选一个任务试试

以下是可直接使用的提示和预期交付，不是额外的 benchmark 胜绩。指定具体范围，采取行动前检查证据。

| 技能 | 值得先尝试的任务 |
|---|---|
| `$brooks-review` | 按契约审查这份 diff，给出能区分缺陷与受保护行为的最小输入。 |
| `$brooks-audit` | 沿模块边界追踪这条依赖，指出被违反的规则及其归属。 |
| `$brooks-debt` | 按变更影响排列这些维护问题，给出最小偿还步骤。 |
| `$brooks-test` | 展示一种现有测试会放过的错误实现，以及能区分它的断言。 |
| `$brooks-health` | 用一份发现清单评估这个范围，区分有依据的问题、无发现维度和未知项。 |
| `$brooks-sweep` | 在最多三轮内诊断并修复这个已授权范围，运行可用检查，报告剩余问题。 |

这些研究使用相关的开发自编案例和非独立评分，重复回答不是独立项目。静态提供指导不验证原生技能发现、所有模型或当前 2.0.0 的全部源码。

| 证据 | 验证什么 |
|---|---|
| 产品回归 | 安装、算分、精确交付及有界停止样例 |
| 30 份报告的解析基准 | 严重度、风险代码和 SARIF，不判断诊断真实与否 |
| 模型对照 | 特定任务、模型、指导版本与评分标准 |

[冻结方案](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/plan.json) · [原始回答与记录](https://github.com/hyhmrright/brooks-lint/tree/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live) · [带引文判定和修订](https://github.com/hyhmrright/brooks-lint/blob/17bd333/docs/research/focused-skill-recovery/results/2026-11-16-live/adjudication/README.md) · [全部六技能的证据与限制](docs/benchmark-evidence.md)

<a id="installation"></a>

## 安装与兼容性

维护者目前验证 **Codex**。其他集成继续保留，但以往的宿主验证属于历史记录；安装目录测试不代表完整运行兼容性。欢迎附带宿主版本和复现步骤的社区报告。安装器支持 13 个具名目标和通用 `agents` 目录。

`<platform> = opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · gemini · codex · claude · bob · agents`

[Codex](docs/codex-setup.md) · [OpenCode](docs/opencode-setup.md) · [Cursor](docs/cursor-setup.md) · [Windsurf](docs/windsurf-setup.md) · [Antigravity](docs/antigravity-setup.md) · [pi](docs/pi-setup.md) · [GitHub Copilot](docs/copilot-setup.md) · [Kiro](docs/kiro-setup.md) · [Factory Droid](docs/factory-droid-setup.md) · [DeepSeek Harness](docs/dsh-setup.md) · [IBM Bob](docs/bob-setup.md)

保留的 Claude Code 市场命令如下；此路径目前未经维护者持续验证：

```text
/plugin marketplace add hyhmrright/brooks-lint
/plugin install brooks-lint@brooks-lint-marketplace
```

## 配置

```yaml
version: 1
strictness: balanced
ignore:
  - "**/vendor/**"
sweep:
  max_iterations: 3
# Optional: deliberately omit a risk from this review.
# disable:
#   - T5
```

从 [`.brooks-lint.example.yaml`](.brooks-lint.example.yaml) 开始。共享约定定义严格度、严重度覆盖、忽略路径、`focus`/`disable`、自定义 `Cx` 风险和范围化抑制。禁用 T5 会主动省略其诊断；T5 不只是覆盖率百分比检查。详见[配置与报告约定](skills/_shared/common.md)。

## CI 是另一条执行路径

现有 GitHub Action 使用 **Anthropic 兼容 API**，不使用 Codex 登录额度。它只审查收集的 diff，没有交互式仓库工具或修复能力；该历史提供方路径不属于当前维护者的实时验证范围。请在对应标签发布后使用下方示例。

```yaml
- uses: hyhmrright/brooks-lint/.github/actions/brooks-lint@v2.0.0
  with:
    mode: review
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

[执行器约定](docs/runner-contracts.md)与[完整工作流模板](docs/github-action-example.yml)说明基础分支配置、fork 限制、无效报告及权限。费用取决于提供方、模型和输入，不承诺固定单次价格。

## 开发与贡献

离线验证命令：

```bash
npm run validate
npm test
npm run evals
npm run benchmark
npm run evals:codex:validate
```

实时 Codex 评测必须明确选择模型和预算；日常离线检查不要运行历史 Anthropic 评测。参见[贡献指南](CONTRIBUTING.md)、[变更记录](CHANGELOG.md)及[历史示例](docs/gallery.md)。感谢贡献者，包括在 [#44](https://github.com/hyhmrright/brooks-lint/pull/44) 提供原生 DSH 集成的 [@Sad-happy](https://github.com/Sad-happy)。

MIT — [许可证](LICENSE)。

[![Star History](assets/star-history.svg)](https://github.com/hyhmrright/brooks-lint/stargazers)
