import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import {
  parseFrontmatterBooks,
  countBookSections,
  countProductionRisks,
  countTestRisks,
  extractChangelogVersion,
  extractGuideStepLabels,
} from "./frontmatter.mjs";

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
  if (!condition) errors.push(message);
}

// ── Canonical data ─────────────────────────────────────────────────────────
// source-coverage.md frontmatter is the single source of truth for the book
// list and count. Adding a new book only requires updating that frontmatter
// (plus the narrative sections that describe it) — the validator auto-adapts.

const packageJson = readJson("package.json");
const version = packageJson.version;

const sourceCoverage = readText("skills/_shared/source-coverage.md");
const books = parseFrontmatterBooks(sourceCoverage);
const sourceCount = books?.length ?? 12;

const _countWords = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
];
const sourceWord = _countWords[sourceCount] ?? String(sourceCount);
const sourceWordCap = sourceWord.charAt(0).toUpperCase() + sourceWord.slice(1);

const evals = readJson("evals/evals.json");
const evalCount = evals.evals.length;

// Risk category counts — mirror the section counts in decay-risks.md (R1–RN)
// and test-decay-risks.md (T1–TN). Update both constants when adding a new risk category.
const PRODUCTION_RISK_COUNT = 6;
const TEST_RISK_COUNT = 6;

// ── Validation sections ────────────────────────────────────────────────────

function checkVersionConsistency() {
  const manifestVersions = [
    ["package.json", version],
    [".claude-plugin/plugin.json", readJson(".claude-plugin/plugin.json").version],
    [".claude-plugin/marketplace.json", readJson(".claude-plugin/marketplace.json").plugins[0]?.version],
    [".codex-plugin/plugin.json", readJson(".codex-plugin/plugin.json").version],
    ["gemini-extension.json", readJson("gemini-extension.json").version],
  ];
  for (const [file, foundVersion] of manifestVersions) {
    check(
      foundVersion === version,
      `${file} version ${foundVersion} does not match package.json version ${version}`,
    );
  }
}

function checkDescriptionConsistency() {
  const canonicalDesc = readJson(".claude-plugin/plugin.json").description;
  const manifestDescs = [
    [".claude-plugin/marketplace.json", readJson(".claude-plugin/marketplace.json").plugins[0]?.description],
    [".codex-plugin/plugin.json", readJson(".codex-plugin/plugin.json").description],
    ["gemini-extension.json", readJson("gemini-extension.json").description],
  ];
  for (const [file, desc] of manifestDescs) {
    check(desc === canonicalDesc, `${file} description does not match .claude-plugin/plugin.json`);
  }
}

function checkChangelog() {
  const changelog = readText("CHANGELOG.md");
  const latestVersion = extractChangelogVersion(changelog);
  check(
    latestVersion === version,
    `CHANGELOG.md latest version ${latestVersion ?? "<missing>"} does not match package.json version ${version}`,
  );
}

// Canonical Claude Code install command — must appear in README.md.
const CANONICAL_INSTALL_CMD = "/plugin marketplace add hyhmrright/brooks-lint";

function checkReadmeIntegrity() {
  const readme = readText("README.md");
  check(readme.includes(`version-${version}-blue.svg`), `README.md badge does not reference version ${version}`);
  check(readme.includes(CANONICAL_INSTALL_CMD), `README.md should contain canonical install command`);
  check(
    readme.includes(`grounded in ${sourceWord} classic engineering books`),
    `README.md should describe Brooks-Lint as grounded in ${sourceWord} classic engineering books`,
  );
  check(
    readme.includes(`## The ${sourceWordCap} Books`),
    `README.md should expose a unified The ${sourceWordCap} Books section`,
  );
  check(readme.includes("*The Art of Unit Testing*"), "README.md should list The Art of Unit Testing in the source inventory");
  check(readme.includes("*How Google Tests Software*"), "README.md should list How Google Tests Software in the source inventory");
  check(readme.includes("source-coverage.md"), "README.md should link to the source coverage matrix");
}

function checkConfigExamples() {
  const commonMd = readText("skills/_shared/common.md");
  const exampleYaml = readText(".brooks-lint.example.yaml");
  const readme = readText("README.md");
  check(commonMd.includes("- T5"), "skills/_shared/common.md should use T5 in the disable section of config examples");
  check(exampleYaml.includes("- T5"), ".brooks-lint.example.yaml should use T5 in the disable section");
  check(readme.includes("- T5"), "README.md configuration example should include T5 in the disable section");
  check(exampleYaml.includes("# suppress:"), ".brooks-lint.example.yaml should include a commented suppress example");
}

function checkSourceInventory() {
  check(
    books !== null && books.length > 0,
    "skills/_shared/source-coverage.md must have a books: frontmatter list",
  );
  if (!books) return;

  for (const title of books) {
    check(
      sourceCoverage.includes(`*${title}*`),
      `skills/_shared/source-coverage.md should include a section for ${title}`,
    );
  }

  // Verify frontmatter book count matches actual book sections in the document.
  // Book sections use the pattern: ## Author Name — *Book Title*
  const bookSections = countBookSections(sourceCoverage);
  check(
    bookSections === books.length,
    `skills/_shared/source-coverage.md frontmatter lists ${books.length} books but has ${bookSections} book sections (## Author — *Title*)`,
  );
}

function checkSharedFramework() {
  const commonMd = readText("skills/_shared/common.md");
  check(commonMd.includes("source-coverage.md"), "skills/_shared/common.md should reference source-coverage.md");

  const testDecayRisks = readText("skills/_shared/test-decay-risks.md");
  check(testDecayRisks.includes("## Risk T3: Test Duplication"), "T3 definition missing from test-decay-risks.md");
  check(testDecayRisks.includes("## Risk T5: Coverage Illusion"), "T5 definition missing from test-decay-risks.md");
  check(testDecayRisks.includes("### What Not to Flag"), "skills/_shared/test-decay-risks.md should include false-positive guidance");

  const decayRisks = readText("skills/_shared/decay-risks.md");
  check(decayRisks.includes("### What Not to Flag"), "skills/_shared/decay-risks.md should include false-positive guidance");

  // Verify risk section counts are stable
  const productionRisks = countProductionRisks(decayRisks);
  check(productionRisks === PRODUCTION_RISK_COUNT, `skills/_shared/decay-risks.md should define exactly ${PRODUCTION_RISK_COUNT} risks (found ${productionRisks})`);

  const testRisks = countTestRisks(testDecayRisks);
  check(testRisks === TEST_RISK_COUNT, `skills/_shared/test-decay-risks.md should define exactly ${TEST_RISK_COUNT} test risks (found ${testRisks})`);
}

// ── Step alignment ────────────────────────────────────────────────────────

function checkStepAlignment() {
  const modeGuides = [
    ["brooks-review", "pr-review-guide.md"],
    ["brooks-audit", "architecture-guide.md"],
    ["brooks-debt", "debt-guide.md"],
    ["brooks-test", "test-guide.md"],
    ["brooks-health", "health-guide.md"],
  ];

  for (const [mode, guide] of modeGuides) {
    const guideText = readText(`skills/${mode}/${guide}`);
    const guideLabels = extractGuideStepLabels(guideText);

    // Guard: guide must have at least 1 step
    check(
      guideLabels.length > 0,
      `skills/${mode}/${guide} has no ### Step headings — expected at least one`,
    );

    // Check for duplicate step labels within the guide
    const uniqueLabels = new Set(guideLabels);
    check(
      uniqueLabels.size === guideLabels.length,
      `skills/${mode}/${guide} has duplicate step labels: ${guideLabels.filter((l, i) => guideLabels.indexOf(l) !== i).join(", ")}`,
    );

    // Verify main step numbers are sequential (ignoring sub-step suffixes).
    // Extract the numeric base of each label: "6a" → 6, "2b" → 2, "0" → 0
    const mainSteps = [...new Set(guideLabels.map(l => parseInt(l, 10)))].sort((a, b) => a - b);
    const expectedStart = mainSteps[0]; // 0-indexed (architecture) or 1-indexed (others)
    for (let i = 0; i < mainSteps.length; i++) {
      check(
        mainSteps[i] === expectedStart + i,
        `skills/${mode}/${guide} main step sequence has a gap: expected ${expectedStart + i}, found ${mainSteps[i]}`,
      );
    }

    // SKILL.md Process section must exist and have at least one numbered item
    const skillText = readText(`skills/${mode}/SKILL.md`);
    const processMatch = skillText.match(/## Process\n([\s\S]*?)(?=\n##|$)/);
    check(
      processMatch !== null,
      `skills/${mode}/SKILL.md has no ## Process section`,
    );
    if (processMatch) {
      check(
        /^\d+\./m.test(processMatch[1]),
        `skills/${mode}/SKILL.md Process section has no numbered items`,
      );
    }
  }
}

function checkSkillsContent() {
  const modes = ["brooks-review", "brooks-audit", "brooks-debt", "brooks-test", "brooks-health"];

  // Guard: _shared/ must never contain a SKILL.md — it is a shared library directory,
  // not a skill. If one is added accidentally, Claude Code would register it as a broken skill.
  let sharedHasSkillMd = false;
  try {
    readText("skills/_shared/SKILL.md");
    sharedHasSkillMd = true;
  } catch (_) { /* expected — file should not exist */ }
  check(!sharedHasSkillMd, "skills/_shared/SKILL.md must not exist — _shared/ is a library, not a skill");

  for (const mode of modes) {
    const skillMd = readText(`skills/${mode}/SKILL.md`);
    check(skillMd.includes("## Setup"), `skills/${mode}/SKILL.md should have a ## Setup section`);
    check(skillMd.includes("## Process"), `skills/${mode}/SKILL.md should have a ## Process section`);

    // Guard: SKILL.md frontmatter description must reference the current book count.
    // Positive assertion — self-updates when sourceWord changes with the book inventory.
    // Extract frontmatter only to avoid false positives from body text ("all six decay risks").
    const frontmatterMatch = skillMd.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";
    check(
      frontmatter.includes(`${sourceWord} classic`),
      `skills/${mode}/SKILL.md frontmatter description should reference "${sourceWord} classic engineering books" — update stale book count`,
    );
  }

  const guides = [
    ["brooks-review", "pr-review-guide.md"],
    ["brooks-audit", "architecture-guide.md"],
    ["brooks-debt", "debt-guide.md"],
    ["brooks-test", "test-guide.md"],
    ["brooks-health", "health-guide.md"],
  ];

  for (const [mode, guide] of guides) {
    const content = readText(`skills/${mode}/${guide}`);
    check(
      content.includes("Iron Law"),
      `skills/${mode}/${guide} should reference the Iron Law`,
    );
  }
}

function checkEvalSuite() {
  check(
    evalCount >= 49,
    `evals/evals.json should include at least 49 benchmark scenarios (found ${evalCount})`,
  );
}

function checkContributing() {
  const contributing = readText("CONTRIBUTING.md");
  check(
    contributing.includes(`currently ${evalCount}`),
    `CONTRIBUTING.md should mention the current eval count (${evalCount})`,
  );
}

function checkAgentsDocs() {
  const agents = readText("AGENTS.md");
  check(
    agents.includes(`${sourceWord} classic engineering books`),
    `AGENTS.md should describe the repository as grounded in ${sourceWord} classic engineering books`,
  );
  check(
    agents.includes(`${evalCount} scenarios`),
    `AGENTS.md should mention the expanded eval suite (${evalCount} scenarios)`,
  );
}

function checkSecurity() {
  const security = readText("SECURITY.md");
  check(!security.includes("<!--"), "SECURITY.md still contains placeholder content");
  check(
    security.includes("Claude Code, Codex CLI, and Gemini CLI"),
    "SECURITY.md should describe the repository as multi-platform",
  );
}

function checkHookOutput() {
  function runHook(env = {}) {
    const tempHome = mkdtempSync(path.join(os.tmpdir(), "brooks-lint-hook-home-"));
    const stdout = execFileSync("bash", ["hooks/session-start"], {
      cwd: root,
      env: { ...process.env, HOME: tempHome, ...env },
      encoding: "utf8",
    });
    return JSON.parse(stdout);
  }

  const defaultOut = runHook();
  check(typeof defaultOut.additional_context === "string", "hooks/session-start default output must include additional_context");

  const claudeOut = runHook({ CLAUDE_PLUGIN_ROOT: "1" });
  check(claudeOut.hookSpecificOutput?.hookEventName === "SessionStart", "hooks/session-start Claude output must include hookSpecificOutput.hookEventName");
  check(typeof claudeOut.hookSpecificOutput?.additionalContext === "string", "hooks/session-start Claude output must include hookSpecificOutput.additionalContext");
}

// ── Run all checks ─────────────────────────────────────────────────────────

checkVersionConsistency();
checkDescriptionConsistency();
checkChangelog();
checkReadmeIntegrity();
checkConfigExamples();
checkSourceInventory();
checkSharedFramework();
checkSkillsContent();
checkStepAlignment();
checkEvalSuite();
checkContributing();
checkAgentsDocs();
checkSecurity();
checkHookOutput();

// ── Report ─────────────────────────────────────────────────────────────────

if (errors.length > 0) {
  console.error("Repository validation failed:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`Repository validation passed for version ${version}.`);
