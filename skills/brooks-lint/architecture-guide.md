# Architecture Audit Guide — Mode 2 Framework

**Core principle:** Architecture reveals intent. Before scoring, draw the dependency graph — it makes violations visible that prose descriptions hide.

---

## Step 1: Draw the Module Dependency Map

Before evaluating any dimension, map the dependencies in this text format:

```
[ModuleA] ──► [ModuleB]     (depends on)
[ModuleA] ──► [ModuleC]
[ModuleB] ──► [ModuleD]
[ModuleC] ──► [ModuleD]

Circular: [ModuleX] ──► [ModuleY] ──► [ModuleX]  ⚠️
```

Rules for the map:
- Arrows point FROM the depending module TO the dependency
- Group by layer: UI → Domain → Infrastructure (arrows should generally flow downward)
- Mark circular dependencies with ⚠️
- Count fan-out (number of arrows leaving a node) — flag any module with fan-out > 5

---

## Step 2: Module-Level Analysis

Evaluate each module against these questions:

**Boundary clarity:**
- Can you state the responsibility of this module in one sentence?
- Does the module name match what it actually does?
- Would a new developer know where to add a new feature of type X?

**Interface width:**
- How many public functions/methods/endpoints does this module expose?
- Could any of them be made private without breaking callers?
- Do callers need to know implementation details to use this module correctly?

**Cohesion:**
- Do all the things in this module belong together, or are they grouped by accident (e.g., "utils")?
- If this module were split in two, would both halves still be independently useful?

---

## Step 3: System-Level Analysis

**Dependency direction (Brooks's Law applied):**
- Does data flow in a consistent direction (e.g., UI → Domain → Infrastructure)?
- Are there any upward dependencies (low-level modules depending on high-level ones)?
- Can you trace a user request from entry to exit in a straight line, or does it bounce between layers?

**Conway's Law check:**
- Does the module structure match the team structure?
- Are there "seam" points between modules that correspond to team or service boundaries?
- If the team structure changed, which module boundaries would need to change?

**Conceptual integrity at scale:**
- Does the architecture look like it was designed by one mind or assembled by committee?
- Are there multiple approaches to the same architectural problem coexisting (e.g., two different ways to handle cross-cutting concerns like logging, auth, or errors)?
- Could you explain the architecture's philosophy in 2 sentences?

**Change propagation radius:**
- Pick a typical feature request. Count how many modules would need to change.
- If the answer is > 4, which interfaces would need to be redesigned to contain it?

---

## Step 4: Scoring Guide for Architecture Mode

For each dimension, apply these architecture-specific criteria:

**Conceptual Integrity (architecture level):**
- 5: One coherent philosophy. All modules follow the same patterns for cross-cutting concerns.
- 3: 2-3 competing patterns coexist but are at least consistent within each subsystem.
- 1: No discernible architectural philosophy. Patterns chosen module-by-module.

**Module Autonomy (architecture level):**
- 5: Every module has a clear one-sentence responsibility. No "utils" or "helpers" modules.
- 3: Most modules well-bounded. 1-2 catch-all modules with unclear responsibility.
- 1: Multiple god modules. Most modules require understanding 3+ other modules to use.

**Communication Overhead (architecture level):**
- 5: Dependency graph is a clean DAG. No circular deps. Fan-out ≤ 3 for most modules.
- 3: Some circular deps in peripheral modules. Core modules are clean. Typical change touches 3-4 modules.
- 1: Circular deps in core modules. Typical change touches 5+ modules.

**Second System Effect (architecture level):**
- 5: Architecture solves the problems the system actually has. No speculative infrastructure.
- 3: Some over-engineering at the edges (e.g., plugin system with one plugin).
- 1: More architecture than product. The system is primarily a framework.

**Documentation Completeness (architecture level):**

代码级：
- 5: 抽样公共接口均有完整说明，复杂逻辑有 why 注释，新人无需读实现即可使用任意模块
- 3: 主要接口有说明，边缘功能或复杂逻辑部分缺失
- 1: 几乎无文档，理解任意模块都必须读实现

架构级：
- 5: ADR 完整且与当前实现一致，跨团队接口有规范文档，README 描述当前架构
- 3: 有部分 ADR 但覆盖不全或有滞后，关键接口有说明
- 1: 无 ADR，无接口规范，README 描述历史架构或不存在

---

## Module Dependency Map Template

Use this when writing your audit report:

```
## Module Dependency Map

Layer: Presentation
  [ComponentA]
  [ComponentB]

Layer: Domain
  [ServiceX] ──► [RepositoryInterface]
  [ServiceY] ──► [RepositoryInterface]

Layer: Infrastructure
  [RepositoryImpl] implements [RepositoryInterface]
  [RepositoryImpl] ──► [Database]

Cross-cutting concerns:
  [Logger] ◄── all modules
  [Auth] ──► [TokenStore]

⚠️ Violations found:
  [ServiceX] ──► [Database]  (bypasses repository abstraction)
  [ComponentA] ──► [ServiceY]  (presentation depends on domain ✓)
  [ServiceX] ──► [ComponentB]  (domain depends on presentation ✗)
```

---

## Step 5: Conway's Law Check（组织结构镜像检验）

**前提：** 此节需要用户提供团队结构信息。若用户未提供，跳过本节并在报告中注明：
> "Conway 检验需要团队结构信息，本次跳过。如需执行，请描述团队划分（哪些团队负责哪些模块）。"

**若用户未主动提供，请求如下：**
> "Conway 法则检验需要了解团队划分。请简要描述：哪些团队负责哪些模块？例如：'前端团队负责 UI/，平台团队负责 core/ 和 api/'"

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
