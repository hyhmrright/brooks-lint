# Brooks Principles — Scoring Rubrics

**Core principle:** Read this file when you need the exact criteria to assign a score to any of the 7 dimensions. Each dimension has: the original Brooks insight, observable code-level symptoms, and a 1-5 rubric.

---

## 1. Conceptual Integrity

**Brooks's insight:** "I will contend that conceptual integrity is the most important consideration in system design. It is better to have a system omit certain anomalous features and improvements, but to reflect one coherent design philosophy, than to have one that contains many good but independent and uncoordinated ideas." *(Ch. 4)*

**Code-level symptoms of violation:**
- Mixed naming conventions (camelCase functions next to snake_case functions in the same module)
- Multiple error-handling strategies coexisting (exceptions + error codes + null returns)
- Inconsistent abstraction levels in one layer (raw SQL next to ORM calls)
- API style inconsistency (some endpoints return `{data: ...}`, others return raw objects)
- Comments in multiple languages

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Reads as if one person wrote the entire codebase. Every naming, error handling, and abstraction choice is consistent. A new developer could infer the style from any 10-line sample. |
| 4 | Good | One coherent style with 1-2 minor inconsistencies that don't affect readability. |
| 3 | Acceptable | 2-3 distinct style traditions coexist but are at least internally consistent within each module. |
| 2 | Needs attention | Mixed styles within the same file or function. Error handling is unpredictable. |
| 1 | Critical | No discernible design philosophy. Each function or class appears written by a different person with different conventions. |

---

## 2. Module Autonomy (Surgical Team Principle)

**Brooks's insight:** "The surgical team... the chief programmer does the design, all of the coding, writes all of the documentation." *(Ch. 3)* — Small, focused units with clear ownership and minimal interface surface area.

**Code-level symptoms of violation:**
- God classes or god functions (one class does everything)
- Functions that require reading 3+ other modules to understand
- Modules with no clear stated responsibility
- Leaky abstractions (implementation details exposed through the interface)
- "Don't touch this" comments indicating knowledge monopolies

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Each module can be read and understood independently. Interfaces expose only what callers need. A developer new to the codebase could modify any single module without reading its dependencies. |
| 4 | Good | Modules are well-bounded with minor cross-cutting concerns. |
| 3 | Acceptable | Modules have identifiable responsibilities but some leakage. Understanding one module requires some knowledge of 1-2 others. |
| 2 | Needs attention | Multiple god classes or modules where the responsibility is "everything in this area." |
| 1 | Critical | No meaningful module boundaries. Understanding any function requires understanding the whole system. |

---

## 3. Essential vs Accidental Complexity (No Silver Bullet)

**Brooks's insight:** "The complexity of software is an essential property, not an accidental one... much of the complexity that [developers] must master is arbitrary complexity, forced without rhyme or reason by the many human institutions and systems to which their interfaces must conform." *(No Silver Bullet, 1986)*

**Code-level symptoms of accidental complexity:**
- Framework choice fighting the problem domain
- Abstraction layers that add indirection without adding clarity
- Configuration systems more complex than the problems they configure
- Infrastructure code outweighing domain code
- "Magic" framework behavior that developers must memorize

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Complexity budget clearly spent on the problem domain. Framework and infrastructure are invisible. |
| 4 | Good | Minor accidental complexity present but not dominant. |
| 3 | Acceptable | Noticeable framework/infrastructure overhead but domain logic remains readable. |
| 2 | Needs attention | Accidental complexity competes with domain logic for developer attention. |
| 1 | Critical | Developers spend more time fighting infrastructure than solving the actual problem. |

---

## 4. Second System Effect

**Brooks's insight:** "The second is the most dangerous system a man ever designs... The general tendency is to over-design the second system, using all the ideas and frills that were sidetracked on the first one." *(Ch. 5)*

**Code-level symptoms:**
- Abstractions with only one concrete implementation (premature generalization)
- Config options that have never been changed from their defaults
- Plugin systems for problems that have only one known use case
- "Framework" code larger than the applications it powers
- YAGNI violations: features built for requirements that don't exist yet

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Every abstraction has ≥2 concrete uses. No unused configuration. Features match stated requirements. |
| 4 | Good | Minor over-engineering in isolated areas, not the main paths. |
| 3 | Acceptable | Some premature abstractions present but isolated. Core paths are appropriately sized. |
| 2 | Needs attention | Significant over-engineering in core paths. Multiple unused abstractions or config systems. |
| 1 | Critical | The system is a framework for a problem that has one solution. Maintaining the abstractions costs more than they save. |

---

## 5. Communication Overhead (Brooks's Law)

**Brooks's insight:** "Adding manpower to a late software project makes it later... The bearing of a child takes nine months, no matter how many women are assigned." *(Ch. 2)* — And in code: adding modules to a tangled graph makes it harder to reason about.

**Code-level symptoms:**
- Circular dependencies between modules
- High fan-out: modules that import from many others
- Changes to one module require changes in many others (high change propagation radius)
- Shared mutable state accessed across module boundaries
- Interface breadth: modules exposing dozens of public methods

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Dependency graph is a clean DAG. High-level modules depend on low-level modules, never the reverse. A typical feature change touches ≤2 modules. |
| 4 | Good | Clean dependency direction with minor coupling between sibling modules. |
| 3 | Acceptable | Some horizontal coupling. A typical change touches 3-4 modules. No circular dependencies. |
| 2 | Needs attention | Multiple circular dependencies or modules with excessive fan-out. A typical change touches 5+ modules. |
| 1 | Critical | Circular dependencies pervasive. Impossible to change anything without ripple effects across the system. |

---

## 6. Throwaway Readiness (Plan to Throw One Away)

**Brooks's insight:** "Plan to throw one away; you will, anyhow." *(Ch. 11)* — Systems that cannot be replaced in parts decay faster than systems that can.

**Code-level symptoms of low throwaway readiness:**
- Prototype or experimental code in production with no replacement plan
- Modules tightly coupled to their consumers (no interface isolation)
- Business logic embedded in infrastructure (e.g., queries in HTTP handlers)
- Missing tests on critical paths (fear to replace = can't verify replacement)
- Configuration values hardcoded inside logic instead of injected

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | Any module could be replaced with a different implementation without changing its callers. Clear interfaces everywhere. Critical paths have test coverage. |
| 4 | Good | Most modules are replaceable. Some tight coupling at the edges. |
| 3 | Acceptable | Core modules replaceable; peripheral or integration modules tightly coupled. |
| 2 | Needs attention | Key modules are practically irreplaceable without major refactoring of dependents. |
| 1 | Critical | The system cannot be meaningfully refactored because there is no safe way to verify correctness of replacements. |

---

## 7. Tar Pit Score (The Tar Pit)

**Brooks's insight:** "The tar pit of software engineering will continue to be sticky for a long time to come... it is this that makes great programming teams, over time, so easy to bog down." *(Ch. 1)*

**Code-level symptoms of tar pit accumulation:**
- TODO/FIXME/HACK markers without owner or date
- Dead code (commented-out blocks, unreachable functions)
- "Don't touch" zones documented in comments
- Documentation that describes how the code *used to* work
- Test coverage dropping over time in key modules
- Increasing time-to-merge for PRs in the module over historical trend

**Scoring rubric:**

| Score | Meaning | Observable Evidence |
|-------|---------|---------------------|
| 5 | Exemplary | No dead code. TODOs have owners and issues. Documentation matches code. Test coverage stable or growing. |
| 4 | Good | Minor TODO accumulation. No dead code. Documentation mostly current. |
| 3 | Acceptable | Some TODO/HACK accumulation. Minor documentation lag. No "untouchable" zones. |
| 2 | Needs attention | Multiple HACK markers in critical paths. Some dead code. At least one module avoided by the team. |
| 1 | Critical | Significant portions of the codebase are effectively frozen — too risky to modify without extensive archaeology. |

---

## 8. Documentation Completeness（文档完整性）

**Brooks's insight:** "The other face of a program is the documentation it needs... the program must be used — and this requires documentation." *(Ch. 15)*
And: "The Tower of Babel failed not from lack of vision, but lack of communication." *(Ch. 7)*

**两个子维度，各自独立评分。报告中显示为：`代码级 X/5 · 架构级 Y/5`，整体分取均值。**

---

### 8a. Code-Level Documentation（代码级文档）

覆盖：函数/类注释、公共 API 说明、非显而易见的实现决策。

**Symptoms of violation:**
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

**Symptoms of violation:**
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
