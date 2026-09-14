---
max_turns: 20
timeout_seconds: 480
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
帮我看看这个 PR 能不能合？贡献者给安装脚本加了 IBM Bob 平台支持，下面是安装脚本和文档部分的 diff（README 的多语言同步改动省略了）。

````diff
diff --git a/docs/bob-setup.md b/docs/bob-setup.md
new file mode 100644
index 0000000..bc7683b
--- /dev/null
+++ b/docs/bob-setup.md
@@ -0,0 +1,51 @@
+# IBM Bob Setup
+
+[IBM Bob](https://bob.ibm.com) (`bob`) is IBM's AI-powered developer agent — an "everything is a
+skill" architecture with a chat interface and IDE integrations. It natively loads
+[Agent Skills](https://agentskills.io) and reads `AGENTS.md`, so all six brooks-lint modes run with
+no conversion.
+
+## Install
+
+```bash
+# simplest — one command (global)
+curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- bob
+
+# from a clone
+./scripts/install.sh bob            # global: ~/.bob/skills (or $BOB_HOME/skills)
+./scripts/install.sh bob --project  # this repo: ./.bob/skills
+```
+
+Prefer a manual copy? Clone the repo and `cp -r skills/* ~/.bob/skills/` — the contents, not the
+`skills/` folder itself, so `_shared/` lands as a sibling of the `brooks-*` folders.
+
+Bob scans these skill roots, highest priority first, so an existing vendor-neutral install is picked
+up automatically:
+
+| Root | Notes |
+|---|---|
+| `<projectRoot>/.bob/skills` | what `--project` writes |
+| `<bob_home>/skills` (default `~/.bob/skills`) | what the global install writes |
+
+When the same skill name appears in two roots, the project-level skill takes precedence.
+
+## Invoke
+
+Just ask — Bob routes to a skill from its `description`:
+
+- "review this PR" → `brooks-review`
+- "audit the architecture" → `brooks-audit`
+- "where's our worst tech debt?" → `brooks-debt`
+
+For explicit invocation, type `/` followed by the skill token in the chat prompt, or type it by
+hand: `/brooks-review`, `/brooks-audit`, `/brooks-debt`, `/brooks-test`, `/brooks-health`,
+`/brooks-sweep`. The repo's `AGENTS.md` carries the Iron Law (Symptom → Source →
+Consequence → Remedy) and the Health Score rules; Bob also loads `$BOB_HOME/AGENTS.md` plus every
+`AGENTS.md` from the project root down to your working directory.
+
+## Notes
+
+- IBM Bob is available at [bob.ibm.com](https://bob.ibm.com); download and sign-in instructions
+  are on that page.
+- 🧪 Documented per the Agent Skills subsystem contract; community end-to-end verification welcome —
+  [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new).
diff --git a/docs/getting-started.md b/docs/getting-started.md
index 665f91f..8a91817 100644
--- a/docs/getting-started.md
+++ b/docs/getting-started.md
@@ -33,7 +33,7 @@ layout wrong:
 curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- <platform>
 ```
 
-`<platform>` ∈ `opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh ·
+`<platform>` ∈ `opencode · cursor · windsurf · antigravity · pi · kiro · copilot · droid · dsh · bob ·
 gemini · codex · claude · agents`. Add `--project` to install into the current repo instead of your
 global config. `agents` targets the vendor-neutral `~/.agents/skills` folder that Cursor, Copilot, pi,
 Gemini, Codex, and DeepSeek Harness all read.
@@ -51,6 +51,7 @@ Gemini, Codex, and DeepSeek Harness all read.
 | Kiro | [kiro-setup.md](kiro-setup.md) | `.kiro/skills`, `~/.kiro/skills` | ✅ |
 | Factory Droid | [factory-droid-setup.md](factory-droid-setup.md) | `~/.factory/skills`, `.factory/skills`, `.agent/skills` | ✅ |
 | DeepSeek Harness | [dsh-setup.md](dsh-setup.md) | `.dsh/skills`, `.agents/skills`, `~/.dsh/skills`, `~/.agents/skills` | ✅ |
+| IBM Bob | [bob-setup.md](bob-setup.md) | `.bob/skills`, `~/.bob/skills` | ✅ |
 
 For Claude Code, Gemini CLI, and Codex CLI, see the [README install section](../README.md#installation).
 `./scripts/install.sh gemini` and `./scripts/install.sh codex` also work and use the flat layout these
@@ -69,7 +70,7 @@ If your agent accepts a skills folder or an instruction file, brooks-lint works:
 ## Verification status
 
 The marketplace-installed platforms (Claude Code, Gemini CLI, Codex CLI) are maintainer-verified. The
-nine Agent-Skills platforms above are documented from each tool's official skill spec and verified at
+ten Agent-Skills platforms above are documented from each tool's official skill spec and verified at
 the file-layout level (the installer is tested), but not yet end-to-end run by the maintainer on every
 platform. **Tried one? Tell us** — [open an issue](https://github.com/hyhmrright/brooks-lint/issues/new)
 with the platform, version, and what you saw, working or broken.
diff --git a/scripts/install.sh b/scripts/install.sh
index 90270ef..0391864 100755
--- a/scripts/install.sh
+++ b/scripts/install.sh
@@ -13,7 +13,7 @@
 #   ./scripts/install.sh <platform> [--project]
 #   curl -fsSL https://raw.githubusercontent.com/hyhmrright/brooks-lint/main/scripts/install.sh | bash -s -- <platform>
 #
-# Platforms: opencode cursor windsurf antigravity pi kiro copilot droid dsh gemini codex claude agents
+# Platforms: opencode cursor windsurf antigravity pi kiro copilot droid dsh gemini codex claude agents bob
 #   agents = the vendor-neutral ~/.agents/skills folder (read by Cursor, Copilot, pi, Gemini,
 #            Codex, and DeepSeek Harness)
 #
@@ -25,7 +25,7 @@
 set -euo pipefail
 
 REPO_URL="https://github.com/hyhmrright/brooks-lint.git"
-PLATFORMS="opencode cursor windsurf antigravity pi kiro copilot droid dsh gemini codex claude agents"
+PLATFORMS="opencode cursor windsurf antigravity pi kiro copilot droid dsh gemini codex claude agents bob"
 
 err()  { printf '\033[31merror:\033[0m %s\n' "$*" >&2; }
 info() { printf '\033[36m›\033[0m %s\n' "$*"; }
@@ -66,6 +66,7 @@ global_dir() {
     codex)       printf '%s' "$HOME/.codex/skills" ;;
     claude)      printf '%s' "$HOME/.claude/skills" ;;
     agents)      printf '%s' "$HOME/.agents/skills" ;;
+    bob)         printf '%s' "$HOME/.bob/skills" ;;
     *)           return 1 ;;
   esac
 }
@@ -85,6 +86,7 @@ project_dir() {
     codex)       printf '%s' "$PWD/.codex/skills" ;;
     claude)      printf '%s' "$PWD/.claude/skills" ;;
     agents)      printf '%s' "$PWD/.agents/skills" ;;
+    bob)         printf '%s' "$PWD/.bob/skills" ;;
     *)           return 1 ;;
   esac
 }
````
