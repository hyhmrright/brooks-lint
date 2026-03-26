# Brooks-Lint v0.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 brooks-lint 添加第 8 维度（文档完整性）、Conway 法则检验和 ADR 健康度，面向多团队工程组织。

**Architecture:** 零新文件，扩展四个现有 skill 文件。`brooks-principles.md` 新增第 8 维度 rubric，三个 guide 文件各自新增 Dimension 8 检查清单，`architecture-guide.md` 额外新增 Conway 检验节，`debt-guide.md` 额外扩展 ADR 子类，`SKILL.md` 更新权重和示例。

**Tech Stack:** Markdown（纯文本编辑，无代码执行）

---

### Task 1: `brooks-principles.md` — 新增第 8 维度定义

**Files:**
- Modify: `skills/brooks-lint/brooks-principles.md`（在文件末尾追加）

- [ ] **Step 1: 确认当前文件末尾**

  运行：`tail -8 skills/brooks-lint/brooks-principles.md`

  预期末尾为 Tar Pit Score 第 1 分描述行，无多余内容。

- [ ] **Step 2: 追加第 8 维度内容**

  在文件末尾追加以下内容（注意保留末尾空行）：

  ```markdown

  ---

  ## 8. Documentation Completeness（文档完整性）

  **Brooks's insight:** "The other face of a program is the documentation it needs...
  the program must be used — and this requires documentation." *(Ch. 15)*
  And: "The Tower of Babel failed not from lack of vision, but lack of communication." *(Ch. 7)*

  **两个子维度，各自独立评分。报告中显示为：`代码级 X/5 · 架构级 Y/5`，整体分取均值。**

  ---

  ### 8a. Code-Level Documentation（代码级文档）

  覆盖：函数/类注释、公共 API 说明、非显而易见的实现决策。

  **Code-level symptoms of violation:**
  - 公共函数无注释，调用者必须读实现才能理解行为
  - 复杂算法或业务规则无任何解释
  - 参数含义依赖命名猜测（`processData(x, y, flag)`）
  - 注释描述 what（代码本身已说清楚），而非 why

  **Scoring rubric:**

  | Score | Meaning | Observable Evidence |
  |-------|---------|---------------------|
  | 5 | Exemplary | 每个公共接口有完整说明。复杂逻辑有 why 注释。新开发者无需追溯实现即可使用任意模块 |
  | 4 | Good | 主要公共接口有说明，1-2 处非关键路径缺失 |
  | 3 | Acceptable | 核心接口有说明，边缘功能缺失。复杂逻辑部分有解释 |
  | 2 | Needs attention | 公共接口普遍缺乏说明。理解模块必须读实现 |
  | 1 | Critical | 几乎无文档。代码库对新人不可访问 |

  ---

  ### 8b. Architecture-Level Documentation（架构级文档）

  覆盖：ADR、设计文档、跨团队接口规范、系统级 README。

  **Architecture-level symptoms of violation:**
  - 架构决策无记录（"为什么用这个框架？" 无人能答）
  - 跨团队接口无规范文档，只靠口头协议
  - 系统级 README 不存在或描述过时架构
  - 重要决策只存在于某人的 Slack 消息里

  **Scoring rubric:**

  | Score | Meaning | Observable Evidence |
  |-------|---------|---------------------|
  | 5 | Exemplary | ADR 存在且与当前实现一致。跨团队接口有规范文档。新团队成员可通过文档理解系统，无需访谈原作者 |
  | 4 | Good | 主要架构决策有记录，1-2 个重要决策缺失 ADR |
  | 3 | Acceptable | 有部分设计文档但不完整或有滞后。关键接口有说明 |
  | 2 | Needs attention | 架构文档几乎不存在。跨团队接口靠约定俗成 |
  | 1 | Critical | 无任何架构级文档。系统知识完全在人脑中 |
  ```

- [ ] **Step 3: 验证追加内容格式正确**

  运行：`grep -c "^##" skills/brooks-lint/brooks-principles.md`

  预期输出：`8`（原 7 个维度 + 新第 8 维度）

- [ ] **Step 4: 提交**

  ```bash
  git add skills/brooks-lint/brooks-principles.md
  git commit -m "feat: add Dimension 8 (Documentation Completeness) to brooks-principles"
  ```

---

### Task 2: `pr-review-guide.md` — 新增 Dimension 8 检查清单

**Files:**
- Modify: `skills/brooks-lint/pr-review-guide.md`（在文件末尾追加）

- [ ] **Step 1: 确认当前文件末尾**

  运行：`tail -6 skills/brooks-lint/pr-review-guide.md`

  预期末尾为 Tar Pit Score 的 Score 1 描述行。

- [ ] **Step 2: 追加 Dimension 8 节**

  在文件末尾追加以下内容：

  ```markdown

  ---

  ## Dimension 8: Documentation Completeness

  **Quick skip（代码级）：** PR 新增的所有公共函数/接口都有说明？复杂逻辑有 why 注释？两者皆是 → ✅ 代码级跳过。

  **Quick skip（架构级）：** PR 不涉及架构决策或跨团队接口变更？→ ✅ 架构级 N/A。

  代码级检查问题：
  - 新增的公共函数/方法是否有说明调用者行为的注释？
  - 复杂逻辑或非显而易见的实现是否有 why 注释（而非 what）？
  - 修改了已有公共接口，是否同步更新了对应文档？
  - 新增参数名称是否自解释，或是否有说明？

  架构级检查问题（仅当 PR 涉及重要架构决策时）：
  - 是否需要新建或更新 ADR？
  - 跨团队接口变更是否有对应的接口规范更新？

  **Score 4-5:** 新增公共接口有完整说明，复杂逻辑有 why 注释。架构变更无或已同步 ADR。
  **Score 3:** 1-2 处公共接口缺失说明，或架构变更无 ADR 但影响有限。
  **Score 2:** 多处公共接口无文档，或重要架构变更未更新 ADR。
  **Score 1:** 大量新接口无文档，或重大架构决策无任何记录。
  ```

- [ ] **Step 3: 验证节数**

  运行：`grep -c "^## Dimension" skills/brooks-lint/pr-review-guide.md`

  预期输出：`8`

- [ ] **Step 4: 提交**

  ```bash
  git add skills/brooks-lint/pr-review-guide.md
  git commit -m "feat: add Dimension 8 checklist to pr-review-guide (Mode 1)"
  ```

---

### Task 3: `architecture-guide.md` — 新增 Dimension 8 + Conway 检验

**Files:**
- Modify: `skills/brooks-lint/architecture-guide.md`

本任务分两步：先在 Step 4 中追加 Dimension 8 评分标准，再在文件末尾追加 Step 5 Conway 检验。

- [ ] **Step 1: 在 Step 4 末尾追加 Dimension 8 评分标准**

  找到文件中 `**Second System Effect (architecture level):**` 一节末尾（`- 1: More architecture than product. The system is primarily a framework.` 这行之后，`---` 之前），插入以下内容：

  ```markdown

  **Documentation Completeness (architecture level):**

  代码级：
  - 5: 抽样公共接口均有完整说明，复杂逻辑有 why 注释，新人无需读实现即可使用任意模块
  - 3: 主要接口有说明，边缘功能或复杂逻辑部分缺失
  - 1: 几乎无文档，理解任意模块都必须读实现

  架构级：
  - 5: ADR 完整且与当前实现一致，跨团队接口有规范文档，README 描述当前架构
  - 3: 有部分 ADR 但覆盖不全或有滞后，关键接口有说明
  - 1: 无 ADR，无接口规范，README 描述历史架构或不存在
  ```

- [ ] **Step 2: 验证 Step 4 内容**

  运行：`grep -n "Documentation Completeness" skills/brooks-lint/architecture-guide.md`

  预期：输出包含该行及其行号。

- [ ] **Step 3: 在文件末尾追加 Step 5 Conway 检验**

  在文件末尾（Module Dependency Map Template 代码块结束后）追加：

  ```markdown

  ---

  ## Step 5: Conway's Law Check（组织结构镜像检验）

  **前提：** 此节需要用户提供团队结构信息。若用户未提供，跳过本节并在报告中注明：
  > "Conway 检验需要团队结构信息，本次跳过。如需执行，请描述团队划分（哪些团队负责哪些模块）。"

  **若用户未主动提供，请求如下：**
  > "Conway 法则检验需要了解团队划分。请简要描述：哪些团队负责哪些模块？
  > 例如：'前端团队负责 UI/，平台团队负责 core/ 和 api/'"

  ---

  ### 5a. 结构吻合度

  将用户描述的团队边界与代码模块边界对照：

  - 团队边界与模块边界是否吻合？
    - ✅ 吻合：每个团队拥有清晰独立的模块集合
    - ⚠️ 部分吻合：某些模块跨团队共同维护
    - ❌ 不吻合：核心模块被多个团队交叉修改

  - 跨团队依赖方向是否合理？
    - ✅ 单向依赖（A 团队模块依赖 B 团队模块，反向无依赖）
    - ❌ 双向依赖（A 依赖 B，B 也依赖 A → 暗示团队间沟通成本极高）

  ### 5b. 巴别塔风险识别

  Brooks 在 Ch.7 指出巴别塔失败的两个根本原因：

  **1. 没有公共语言**（在代码中表现为）：
  - 跨团队接口是否有统一的数据格式/协议规范？
  - 不同团队的模块是否使用不同的命名约定、错误处理策略？
  - 是否存在"接口由一个团队定义，另一个团队按自己理解实现"的情况？

  **2. 没有组织**（在代码中表现为）：
  - 是否存在"无主模块"（没有团队明确负责的共享代码）？
  - 跨团队变更是否需要协调多个团队才能完成一个功能？
  - 是否有模块因为"不知道该找谁"而长期无人维护？

  ### 5c. 报告输出格式

  在 Architecture Audit 报告末尾追加：

  ```
  ## Conway's Law Check

  **团队结构：** [用户提供的描述]
  **结构吻合度：** ✅ 良好 / ⚠️ 部分问题 / ❌ 严重错位

  | 检验项 | 状态 | 发现 |
  |--------|------|------|
  | 团队边界 ↔ 模块边界吻合 | ✅/⚠️/❌ | [一行描述] |
  | 跨团队依赖方向 | ✅/⚠️/❌ | [一行描述] |
  | 公共语言（接口规范） | ✅/⚠️/❌ | [一行描述] |
  | 无主模块风险 | ✅/⚠️/❌ | [一行描述] |

  **巴别塔风险等级：** 低 / 中 / 高
  [2-3 句总结最关键的发现]
  ```
  ```

- [ ] **Step 4: 验证 Step 5 存在**

  运行：`grep -c "^## Step" skills/brooks-lint/architecture-guide.md`

  预期输出：`5`（原 Step 1-4 + 新 Step 5）

- [ ] **Step 5: 提交**

  ```bash
  git add skills/brooks-lint/architecture-guide.md
  git commit -m "feat: add Dimension 8 checklist and Conway's Law Check to architecture-guide (Mode 2)"
  ```

---

### Task 4: `debt-guide.md` — 新增 Dimension 8 + ADR 子类

**Files:**
- Modify: `skills/brooks-lint/debt-guide.md`

本任务分两步：扩展 Category 4（Knowledge Debt）加入 ADR 子类，再追加 Dimension 8 节。

- [ ] **Step 1: 在 Category 4 末尾插入 ADR 子类**

  找到 `debt-guide.md` 中 Category 4 的偿还方式段落末尾（`Knowledge debt is repaid by spreading, not by refactoring.` 这行之后），插入以下内容：

  ```markdown

  **子类：ADR 健康度**

  什么是 ADR：Architecture Decision Record，记录"为什么做出这个决策"的简短文档。
  Brooks 在 Ch.10 称之为"项目手册"——团队间共享的唯一事实来源。

  识别特征（ADR 债务）：
  - 代码库中不存在任何 ADR 或等价文档（`docs/decisions/`、`docs/adr/`、`docs/rfcs/` 均不存在）
  - ADR 存在但与当前实现不一致（记录的决策已被推翻，文档未更新）
  - 重要的架构转折点无对应 ADR（如：从单体迁移到微服务、更换核心框架）
  - ADR 只记录"做什么"，未记录"为什么"和"放弃了哪些替代方案"

  如何检测：
  1. 查找 `docs/`、`RFC`、`decisions/`、`adr/` 等目录是否存在
  2. 若存在，抽查 2-3 个 ADR：内容是否与当前代码一致？
  3. 识别代码中的重大架构特征，检验是否有对应 ADR 解释决策背景

  ADR 偿还方式：
  - 不要补写历史 ADR（成本高、准确性低）
  - 从当下开始：下一个重要决策必须配套 ADR
  - 对"无人敢动"的模块写"反向 ADR"——记录当前理解，哪怕不完整
  - ADR 最小可行模板：
    - **背景：** 当时面对什么问题
    - **决策：** 我们选择了什么
    - **放弃了什么：** 考虑过但未选的替代方案
    - **后果：** 预期的权衡与影响
  ```

- [ ] **Step 2: 验证 ADR 内容插入**

  运行：`grep -n "ADR 健康度" skills/brooks-lint/debt-guide.md`

  预期：输出包含该行及行号，行号应在 Category 4 节内。

- [ ] **Step 3: 在 Debt Report Template 之前插入 Dimension 8 评估节**

  找到 `## Debt Report Template` 这行，在其之前插入：

  ```markdown
  ---

  ### Dimension 8 in Tech Debt Context

  在 Tech Debt 评估中，Documentation Completeness 的评估方式：

  代码级识别特征：
  - 公共接口无文档，理解模块必须读实现
  - 复杂业务规则内嵌于代码，无任何说明 why 的注释
  - 注释与代码不一致（描述旧行为）

  架构级识别特征：
  - 架构决策无 ADR，只活在原作者记忆中
  - 跨团队接口文档缺失或过时
  - 系统 README 描述的架构已被重构，文档未更新

  严重度：
  - **高：** 核心业务逻辑无文档 + 无 ADR → 新人上手成本极高，修改风险无法评估
  - **中：** 有部分文档但覆盖不均，架构级文档有明显滞后
  - **低：** 仅工具/脚本类代码缺文档，核心路径覆盖良好

  报告中 Knowledge Debt 行可细化显示：

  | Category | Severity | Key Evidence | Estimated Impact |
  |----------|----------|-------------|-----------------|
  | Knowledge Debt — ADR | High | 零 ADR，3 次明显架构演化无记录 | 新团队上手需 2-3 周访谈 |
  | Knowledge Debt — 人员 | Medium | 支付模块仅一人理解 | Bus factor = 1 |

  ---

  ```

- [ ] **Step 4: 验证插入位置**

  运行：`grep -n "Dimension 8 in Tech Debt\|## Debt Report Template" skills/brooks-lint/debt-guide.md`

  预期：`Dimension 8 in Tech Debt` 的行号小于 `## Debt Report Template` 的行号。

- [ ] **Step 5: 提交**

  ```bash
  git add skills/brooks-lint/debt-guide.md
  git commit -m "feat: add ADR sub-category to Knowledge Debt and Dimension 8 section to debt-guide (Mode 3)"
  ```

---

### Task 5: `SKILL.md` — 更新权重说明和报告模板

**Files:**
- Modify: `skills/brooks-lint/SKILL.md`

三处修改：评分表示例新增 Documentation 行、触发词新增、权重说明更新。

- [ ] **Step 1: 在评分表示例中 Tar Pit Score 行后新增 Documentation 行**

  找到：
  ```
  | Tar Pit Score | ⬛⬛⬛⬛⬜ 4/5 | ✅ |
  ```

  改为：
  ```
  | Tar Pit Score | ⬛⬛⬛⬛⬜ 4/5 | ✅ |
  | Documentation | ⬛⬛⬜⬜⬜ 2/5 | 代码级 2/5 · 架构级 1/5 |
  ```

- [ ] **Step 2: 更新 Overall Health 权重说明**

  找到：
  ```
  - Overall health: weighted mean where Conceptual Integrity and Communication Overhead count double
  ```

  改为：
  ```
  - Overall health: weighted mean where Conceptual Integrity and Communication Overhead count double (denominator = 10)
  ```

- [ ] **Step 3: 在 Auto-triggers 列表中新增触发词**

  找到：
  ```
  - User mentions: Brooks's Law, Mythical Man-Month, conceptual integrity, second system effect, no silver bullet, tar pit, surgical team
  ```

  改为：
  ```
  - User mentions: Brooks's Law, Mythical Man-Month, conceptual integrity, second system effect, no silver bullet, tar pit, surgical team, Conway's Law, ADR, architecture decision record, 团队边界, documentation coverage
  ```

- [ ] **Step 4: 验证三处修改**

  运行：
  ```bash
  grep -n "Documentation\|denominator\|Conway" skills/brooks-lint/SKILL.md
  ```

  预期：输出三行，分别对应评分表、权重说明、触发词。

- [ ] **Step 5: 提交**

  ```bash
  git add skills/brooks-lint/SKILL.md
  git commit -m "feat: update SKILL.md — add Documentation dimension to report template, update weights and trigger words"
  ```

---

### Task 6: 整体验证

- [ ] **Step 1: 检查所有文件的维度数量一致**

  ```bash
  echo "=== brooks-principles.md 维度数 ===" && grep -c "^## [0-9]" skills/brooks-lint/brooks-principles.md
  echo "=== pr-review-guide.md 维度数 ===" && grep -c "^## Dimension" skills/brooks-lint/pr-review-guide.md
  echo "=== architecture-guide.md Step 数 ===" && grep -c "^## Step" skills/brooks-lint/architecture-guide.md
  echo "=== SKILL.md 报告表行数 ===" && grep -c "^| .* | ⬛" skills/brooks-lint/SKILL.md
  ```

  预期输出：
  ```
  === brooks-principles.md 维度数 ===
  8
  === pr-review-guide.md 维度数 ===
  8
  === architecture-guide.md Step 数 ===
  5
  === SKILL.md 报告表行数 ===
  8
  ```

- [ ] **Step 2: 检查 hook 脚本仍可正常运行**

  ```bash
  bash hooks/session-start
  ```

  预期：输出合法 JSON，无报错。

- [ ] **Step 3: 最终提交（若 Task 1-5 已各自提交则跳过）**

  确认 `git log --oneline -6` 显示 Task 1-5 的五个 commit 均已存在。

- [ ] **Step 4: 推送**

  ```bash
  git push origin main
  ```
