import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readText(relPath) {
  return readFileSync(path.join(root, relPath), "utf8");
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

const packageJson = readJson("package.json");
const version = packageJson.version;

const manifestVersions = [
  ["package.json", version],
  [".claude-plugin/plugin.json", readJson(".claude-plugin/plugin.json").version],
  [
    ".claude-plugin/marketplace.json",
    readJson(".claude-plugin/marketplace.json").plugins[0]?.version,
  ],
  [".codex-plugin/plugin.json", readJson(".codex-plugin/plugin.json").version],
  ["gemini-extension.json", readJson("gemini-extension.json").version],
];

for (const [file, foundVersion] of manifestVersions) {
  check(foundVersion === version, `${file} version ${foundVersion} does not match package.json version ${version}`);
}

const readme = readText("README.md");
check(
  readme.includes(`version-${version}-blue.svg`),
  `README.md badge does not reference version ${version}`,
);

const changelog = readText("CHANGELOG.md");
const latestChangelogVersion = changelog.match(/^## \[(.+?)\] - /m)?.[1];
check(
  latestChangelogVersion === version,
  `CHANGELOG.md latest version ${latestChangelogVersion ?? "<missing>"} does not match package.json version ${version}`,
);

const commonMd = readText("skills/_shared/common.md");
const exampleYaml = readText(".brooks-lint.example.yaml");

check(
  commonMd.includes("T5   # no coverage metrics enforced on this project"),
  "skills/_shared/common.md should use T5 for coverage-related config examples",
);
check(
  exampleYaml.includes("T5   # Coverage Illusion — we don't enforce coverage metrics"),
  ".brooks-lint.example.yaml should use T5 for coverage-related config examples",
);
check(
  readme.includes("T5   # skip coverage metrics check — we don't enforce coverage"),
  "README.md configuration example should use T5 for coverage-related config examples",
);

const testDecayRisks = readText("skills/_shared/test-decay-risks.md");
check(testDecayRisks.includes("## Risk T3: Test Duplication"), "T3 definition missing from test-decay-risks.md");
check(testDecayRisks.includes("## Risk T5: Coverage Illusion"), "T5 definition missing from test-decay-risks.md");

const security = readText("SECURITY.md");
check(!security.includes("<!--"), "SECURITY.md still contains placeholder content");
check(
  security.includes("Claude Code, Codex CLI, and Gemini CLI"),
  "SECURITY.md should describe the repository as multi-platform",
);

function runHook(env = {}) {
  const tempHome = mkdtempSync(path.join(os.tmpdir(), "brooks-lint-hook-home-"));
  const stdout = execFileSync("bash", ["hooks/session-start"], {
    cwd: root,
    env: { ...process.env, HOME: tempHome, ...env },
    encoding: "utf8",
  });

  return JSON.parse(stdout);
}

const defaultHookOutput = runHook();
check(
  typeof defaultHookOutput.additional_context === "string",
  "hooks/session-start default output must include additional_context",
);

const claudeHookOutput = runHook({ CLAUDE_PLUGIN_ROOT: "1" });
check(
  claudeHookOutput.hookSpecificOutput?.hookEventName === "SessionStart",
  "hooks/session-start Claude output must include hookSpecificOutput.hookEventName",
);
check(
  typeof claudeHookOutput.hookSpecificOutput?.additionalContext === "string",
  "hooks/session-start Claude output must include hookSpecificOutput.additionalContext",
);

if (errors.length > 0) {
  console.error("Repository validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Repository validation passed for version ${version}.`);
