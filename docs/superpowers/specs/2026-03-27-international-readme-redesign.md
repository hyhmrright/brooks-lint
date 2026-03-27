# brooks-lint International README Redesign

## Goal

Rewrite README.md and add CONTRIBUTING.md to maximize GitHub visibility and adoption
among the international Claude Code developer community, with a path to broader developer
audiences via Roadmap.

## Audience

**Primary:** Claude Code plugin users (developers already using Claude Code who discover
the plugin via marketplace or GitHub search).

**Secondary (future):** All developers — addressed via Roadmap items (GitHub Action, VS Code
extension) but not the focus of this change.

## Files to Change

| File | Action |
|------|--------|
| `README.md` | Full restructure + new sections |
| `CONTRIBUTING.md` | New file |

No other files change in this spec.

---

## README.md Design

### Structure (top to bottom)

1. **Header** — logo, title, badges (keep existing; add version badge)
2. **One-liner + benchmark hook** — lead with data, not description
3. **Six Decay Risks table** — move up, before installation
4. **Real output showcase** — PR Review eval output (UserService scenario)
5. **Benchmark section** — 94% vs 16% comparison table with interpretation
6. **How It Compares** — vs ESLint/Pylint, Copilot Review, Plain Claude
7. **Installation** — simplified, two methods
8. **Usage** — three slash commands
9. **Why These Books** — moved down (for the already-interested reader)
10. **Project Structure** — keep
11. **Roadmap** — update: mark v0.4 done, add contribution hooks
12. **Contributing** — short section pointing to CONTRIBUTING.md
13. **License + Acknowledgments** — keep

### Section 2: One-liner + hook

```
Code quality reviews grounded in six classic engineering books —
with benchmark-verified consistency.

94% structured finding rate. 16% without. The difference is a framework
your team can trust every time.
```

### Section 4: Real Output Showcase

Use the UserService PR Review eval output. Show:
- The input code snippet (the vulnerable update_profile method)
- Health Score: 28/100
- Two 🔴 Critical findings in full (Change Propagation + Domain Model Distortion)
- Note "(+ 6 more findings)" to signal depth without overwhelming

### Section 5: Benchmark Table

```
| Criterion | brooks-lint | Claude alone |
|-----------|:-----------:|:------------:|
| Structured findings (Symptom → Source → Consequence → Remedy) | ✅ 100% | ❌ 0% |
| Book citations per finding | ✅ 100% | ❌ 0% |
| Severity labels (🔴/🟡/🟢) | ✅ 100% | ❌ 0% |
| Health Score (0–100) | ✅ 100% | ❌ 0% |
| Detects Change Propagation | ✅ 100% | ✅ 100% |
| Overall pass rate | 94% | 16% |
```

Caption: "The gap isn't what Claude *can* find — it's what it *consistently* finds,
with traceable evidence and actionable remedies every time."

### Section 6: Comparison Table

Columns: brooks-lint | ESLint/Pylint | GitHub Copilot Review | Plain Claude

Rows:
- Detects syntax & style issues: — | ✅ | ✅ | ~
- Structured diagnosis chain: ✅ | ❌ | ❌ | ❌
- Traces findings to classic books: ✅ | ❌ | ❌ | ❌
- Consistent severity labels: ✅ | ✅ | ~ | ❌
- Architecture-level insights: ✅ | ❌ | ~ | ~
- Domain model analysis: ✅ | ❌ | ❌ | ~
- Zero config: ✅ | ❌ | ✅ | ✅
- Works with any language: ✅ | ❌ | ✅ | ✅

Footer: "brooks-lint doesn't replace your linter. It catches what linters can't:
architectural drift, knowledge silos, and domain model distortion —
the problems that slow teams down for months before anyone notices."

---

## CONTRIBUTING.md Design

### Structure

1. **Welcome** — one paragraph on what contributions are valued
2. **Three ways to contribute** — with explicit effort levels
   - Add a finding/citation to decay-risks.md (no code)
   - Improve a guide file (no code)
   - Add an eval test case (requires running skill-creator workflow)
3. **Local testing** — how to verify hook output, how to test the skill
4. **Eval workflow** — brief explanation of evals/evals.json + how to run
5. **PR conventions** — use brooks-lint to self-review, what reviewers look for
6. **Code of conduct** — one sentence (be excellent to each other)

### Three contribution types (detail)

**Type 1: Add a finding**
- Edit `skills/brooks-lint/decay-risks.md`
- Add a symptom pattern or book citation to an existing risk
- No code required, no tests required

**Type 2: Improve a guide**
- Edit `pr-review-guide.md`, `architecture-guide.md`, or `debt-guide.md`
- Better heuristics = better reviews for every user

**Type 3: Add an eval**
- Add a test case to `evals/evals.json`
- Run through skill-creator workflow, show before/after pass rates in PR
- This is how the 94% benchmark was produced

### Local testing commands

```bash
# Verify session-start hook output
bash hooks/session-start

# On Claude Code platform install path
CLAUDE_PLUGIN_ROOT=1 bash hooks/session-start
```

---

## Out of Scope

- Multi-language README (README.zh.md etc.) — deferred to later
- GitHub issue / discussion templates — deferred to later
- Translation of skill content — deferred to later
