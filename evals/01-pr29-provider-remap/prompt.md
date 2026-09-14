---
max_turns: 20
timeout_seconds: 480
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
Can you review this PR before I merge it? It lets our CI review action route requests through ExampleGW, an Anthropic-compatible model gateway, instead of calling Anthropic directly. Only the code files from the PR are included below, and I've anonymized the gateway's name, key prefix and URL in the paste.

````diff
diff --git a/.github/actions/brooks-lint/action.yml b/.github/actions/brooks-lint/action.yml
index 73977da..3f2e0b2 100644
--- a/.github/actions/brooks-lint/action.yml
+++ b/.github/actions/brooks-lint/action.yml
@@ -7,8 +7,14 @@ inputs:
     description: "Review mode: review, audit, debt, test, health, sweep"
     default: "review"
   anthropic-api-key:
-    description: "Anthropic API key"
-    required: true
+    description: "Anthropic API key (required unless provider is examplegw)"
+    default: ""
+  provider:
+    description: "Model provider: anthropic (default) or examplegw"
+    default: "anthropic"
+  examplegw-api-key:
+    description: "ExampleGW API key, sk-gw-... (required when provider is examplegw)"
+    default: ""
   fail-below:
     description: "Fail the check if Health Score is below this threshold (0 = never fail)"
     default: "0"
@@ -71,10 +77,29 @@ runs:
       shell: bash
       env:
         ANTHROPIC_API_KEY: ${{ inputs.anthropic-api-key }}
+        EXAMPLEGW_API_KEY: ${{ inputs.examplegw-api-key }}
+        PROVIDER: ${{ inputs.provider }}
         SARIF_FILE: ${{ inputs.sarif-file }}
         MODE: ${{ inputs.mode }}
         MODEL: ${{ inputs.model }}
       run: |
+        if [ "$PROVIDER" = "examplegw" ]; then
+          # ExampleGW serves an Anthropic-compatible /v1/messages endpoint. The
+          # key lives in examplegw-api-key (sk-gw-...); bare Anthropic model
+          # ids are not resolvable through the gateway, so the action's default
+          # claude-sonnet-4-6 is remapped to the ExampleGW-pinned id.
+          if [ -z "$EXAMPLEGW_API_KEY" ]; then
+            echo "provider=examplegw requires examplegw-api-key (sk-gw-...)" >&2
+            exit 1
+          fi
+          export ANTHROPIC_API_KEY="$EXAMPLEGW_API_KEY"
+          if [ "$MODEL" = "claude-sonnet-4-6" ]; then
+            MODEL="anthropic/claude-sonnet-5"
+          fi
+        elif [ -z "$ANTHROPIC_API_KEY" ]; then
+          echo "anthropic-api-key is required unless provider=examplegw" >&2
+          exit 1
+        fi
         sarif_arg=()
         if [ -n "$SARIF_FILE" ]; then
           sarif_arg=(--sarif-out "$SARIF_FILE")
@@ -82,6 +107,7 @@ runs:
         node "$BROOKS_LINT_ROOT/scripts/ci-review.mjs" \
           --mode "$MODE" \
           --model "$MODEL" \
+          --provider "$PROVIDER" \
           --skills-dir "$BROOKS_LINT_ROOT/skills" \
           --project-dir "$GITHUB_WORKSPACE" \
           "${sarif_arg[@]}" \
diff --git a/scripts/ci-review.mjs b/scripts/ci-review.mjs
index 61d67a7..91b31b6 100644
--- a/scripts/ci-review.mjs
+++ b/scripts/ci-review.mjs
@@ -13,11 +13,13 @@
  *     --model claude-sonnet-4-6 \
  *     --skills-dir ./skills \
  *     --project-dir /path/to/project \
+ *     [--provider anthropic|examplegw] \
  *     [--format json|sarif] \
  *     [--sarif-out brooks-lint.sarif]
  *
  * Environment:
- *   ANTHROPIC_API_KEY  required
+ *   ANTHROPIC_API_KEY  required (provider=anthropic)
+ *   EXAMPLEGW_API_KEY required (provider=examplegw; sk-gw-...)
  */
 
 import { execFileSync } from "node:child_process";
@@ -35,8 +37,22 @@ const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
 const args = parseArgs(process.argv.slice(2));
 
+const provider = args.provider ?? "anthropic";
+if (!["anthropic", "examplegw"].includes(provider)) {
+  console.error(`Unknown provider: ${provider}. Valid providers: anthropic, examplegw`);
+  process.exit(1);
+}
+
+// ExampleGW serves an Anthropic-compatible /v1/messages endpoint. Bare Anthropic
+// model ids (e.g. claude-sonnet-4-6) are not resolvable through the gateway, so
+// the default is pinned to the ExampleGW-prefixed id.
+const DEFAULT_MODELS = {
+  anthropic: "claude-sonnet-4-6",
+  examplegw: "anthropic/claude-sonnet-5",
+};
+
 const mode = args.mode ?? "review";
-const model = args.model ?? "claude-sonnet-4-6";
+const model = args.model ?? DEFAULT_MODELS[provider];
 const format = args.format ?? "json";
 const skillsDir = path.resolve(args["skills-dir"] ?? path.join(__dirname, "..", "skills"));
 const projectDir = path.resolve(args["project-dir"] ?? process.cwd());
@@ -79,7 +95,9 @@ function getGitDiff(projectRoot) {
 
 // ── Main ──────────────────────────────────────────────────────────────────────
 
-const client = new Anthropic();
+// ExampleGW's Anthropic-compatible endpoint — the client appends /v1/messages.
+const EXAMPLEGW_BASE_URL = "https://api.examplegw.example";
+const client = new Anthropic(provider === "examplegw" ? { baseURL: EXAMPLEGW_BASE_URL } : undefined);
 
 const { diff, scope } = getGitDiff(projectDir);
 const systemPrompt = assembleSystemPrompt(mode, skillsDir);
@@ -95,6 +113,10 @@ try {
     max_tokens: 4096,
     system: systemPrompt,
     messages: [{ role: "user", content: userMessage }],
+    // Reasoning models on ExampleGW spend the output budget on thinking blocks
+    // by default; the 4096-token budget here assumes direct text output, so the
+    // gateway path disables extended thinking to preserve that contract.
+    ...(provider === "examplegw" ? { thinking: { type: "disabled" } } : {}),
   });
 } catch (err) {
   console.error(JSON.stringify({ error: err.message, mode, scope }, null, 2));
diff --git a/scripts/run-evals-live.mjs b/scripts/run-evals-live.mjs
index cfdda01..bb64406 100644
--- a/scripts/run-evals-live.mjs
+++ b/scripts/run-evals-live.mjs
@@ -8,6 +8,7 @@
  *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --id 5
  *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --mode review
  *   ANTHROPIC_API_KEY=... node scripts/run-evals-live.mjs --model claude-opus-4-6
+ *   EXAMPLEGW_API_KEY=... node scripts/run-evals-live.mjs --provider examplegw
  */
 
 import { readFileSync } from "node:fs";
@@ -22,10 +23,24 @@ const __dirname = path.dirname(fileURLToPath(import.meta.url));
 const root = path.resolve(__dirname, "..");
 
 const args = parseArgs(process.argv.slice(2));
+const provider   = args.provider ?? "anthropic";
+if (!["anthropic", "examplegw"].includes(provider)) {
+  console.error(`Unknown provider: ${provider}. Valid providers: anthropic, examplegw`);
+  process.exit(1);
+}
+
+// ExampleGW serves an Anthropic-compatible /v1/messages endpoint. Bare Anthropic
+// model ids are not resolvable through the gateway, so the default is pinned to
+// the ExampleGW-prefixed id.
+const DEFAULT_MODELS = {
+  anthropic: "claude-sonnet-4-6",
+  examplegw: "anthropic/claude-sonnet-5",
+};
+
 const filterRisk = args.risk ?? null;
 const filterId   = args.id ? parseInt(args.id, 10) : null;
 const filterMode = args.mode ?? null;
-const model      = args.model ?? "claude-sonnet-4-6";
+const model      = args.model ?? DEFAULT_MODELS[provider];
 const skillsDir  = path.join(root, "skills");
 
 if (filterMode && !VALID_MODES.includes(filterMode)) {
@@ -59,7 +74,9 @@ function getSystemPrompt(mode) {
 
 // ── Run scenarios ─────────────────────────────────────────────────────────────
 
-const client = new Anthropic();
+// ExampleGW's Anthropic-compatible endpoint — the client appends /v1/messages.
+const EXAMPLEGW_BASE_URL = "https://api.examplegw.example";
+const client = new Anthropic(provider === "examplegw" ? { baseURL: EXAMPLEGW_BASE_URL } : undefined);
 const results = [];
 
 for (const scenario of scenarios) {
@@ -80,6 +97,10 @@ for (const scenario of scenarios) {
       max_tokens: 4096,
       system: systemPrompt,
       messages: [{ role: "user", content: userMessage }],
+      // Reasoning models on ExampleGW spend the output budget on thinking blocks
+      // by default; the 4096-token budget here assumes direct text output, so the
+      // gateway path disables extended thinking to preserve that contract.
+      ...(provider === "examplegw" ? { thinking: { type: "disabled" } } : {}),
     });
     aiText  = message.content[0]?.text ?? "";
     verdict = classify(scenario, aiText);
````
