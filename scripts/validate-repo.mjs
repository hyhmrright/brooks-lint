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
  PRODUCTION_RISK_COUNT,
  TEST_RISK_COUNT,
} from "./frontmatter.mjs";
import { GUIDE_BY_MODE, VALID_MODES } from "./assemble-prompt.mjs";
import { versionRefs } from "./version-refs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function readText(relPath) {
  return readFileSync(path.join(root, relPath), "utf8").replace(/\r\n/g, "\n");
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
const sourceCount = books?.length ?? 0;

const COUNT_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
];
const sourceWord = COUNT_WORDS[sourceCount] ?? String(sourceCount);
const sourceWordCap = sourceWord.charAt(0).toUpperCase() + sourceWord.slice(1);

const evals = readJson("evals/evals.json");
const evalCount = evals.evals.length;


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

// Version strings embedded in text files (README badges, docs JSON-LD). The
// list lives in version-refs.mjs so this check and bump-version.mjs can never
// disagree about what carries a version.
function checkVersionRefs() {
  for (const { rel, pattern, expected, required } of versionRefs(root, version)) {
    const found = readText(rel).match(pattern) ?? [];
    if (required) {
      check(found.length > 0, `${rel} is missing its version reference (expected "${expected}")`);
    }
    for (const hit of found) {
      check(hit === expected, `${rel} has stale "${hit}", expected "${expected}" (run npm run bump)`);
    }
  }
}

// Canonical Claude Code install command — must appear in README.md.
const CANONICAL_INSTALL_CMD = "/plugin marketplace add hyhmrright/brooks-lint";

function checkReadmeIntegrity() {
  const readme = readText("README.md");
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

// Derived from the canonical mode registry so a new skill only has to be
// declared once (in assemble-prompt.mjs) to be validated here.
const SKILL_GUIDES = Object.values(GUIDE_BY_MODE);

/** Steps in one guide must be present, unique, and numerically contiguous. */
function checkGuideSteps(rel) {
  const text = readText(rel);
  const labels = extractGuideStepLabels(text);

  // A step at the wrong heading level is invisible to the label extractor, so the
  // continuity check below silently skips it — that is how `## Step 7` in the PR
  // guide stayed unvalidated while SKILL.md cited it by number. Catch the level
  // itself, not just the sequence.
  for (const heading of text.match(/^#{1,6} Step \d[a-z]?\b.*$/gm) ?? []) {
    check(
      heading.startsWith("### "),
      `${rel} has a step heading at the wrong level (must be ###): "${heading.trim()}"`,
    );
  }

  check(labels.length > 0, `${rel} has no ### Step headings — expected at least one`);

  check(
    new Set(labels).size === labels.length,
    `${rel} has duplicate step labels: ${labels.filter((l, i) => labels.indexOf(l) !== i).join(", ")}`,
  );

  // Compare main step numbers only, ignoring sub-step suffixes: "6a" → 6, "0" → 0.
  const mainSteps = [...new Set(labels.map(l => parseInt(l, 10)))].sort((a, b) => a - b);
  const expectedStart = mainSteps[0]; // 0-indexed (architecture) or 1-indexed (others)
  for (let i = 0; i < mainSteps.length; i++) {
    check(
      mainSteps[i] === expectedStart + i,
      `${rel} main step sequence has a gap: expected ${expectedStart + i}, found ${mainSteps[i]}`,
    );
  }
}

function checkStepAlignment() {
  for (const [dir, ...guides] of SKILL_GUIDES) {
    for (const guide of guides) checkGuideSteps(`skills/${dir}/${guide}`);

    // SKILL.md Process section must exist and have at least one numbered item
    const skillText = readText(`skills/${dir}/SKILL.md`);
    const processMatch = skillText.match(/## Process\n([\s\S]*?)(?=\n##|$)/);
    check(
      processMatch !== null,
      `skills/${dir}/SKILL.md has no ## Process section`,
    );
    if (processMatch) {
      check(
        /^\d+\./m.test(processMatch[1]),
        `skills/${dir}/SKILL.md Process section has no numbered items`,
      );
    }
  }
}

function checkSkillsContent() {
  // Guard: _shared/ must never contain a SKILL.md — it is a shared library directory,
  // not a skill. If one is added accidentally, Claude Code would register it as a broken skill.
  let sharedHasSkillMd = false;
  try {
    readText("skills/_shared/SKILL.md");
    sharedHasSkillMd = true;
  } catch (_) { /* expected — file should not exist */ }
  check(!sharedHasSkillMd, "skills/_shared/SKILL.md must not exist — _shared/ is a library, not a skill");

  for (const [dir, ...guides] of SKILL_GUIDES) {
    const skillMd = readText(`skills/${dir}/SKILL.md`);
    check(skillMd.includes("## Setup"), `skills/${dir}/SKILL.md should have a ## Setup section`);
    check(skillMd.includes("## Process"), `skills/${dir}/SKILL.md should have a ## Process section`);

    // Guard: SKILL.md frontmatter description must reference the current book count.
    // Positive assertion — self-updates when sourceWord changes with the book inventory.
    // Extract frontmatter only to avoid false positives from body text ("all six decay risks").
    const frontmatterMatch = skillMd.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";
    check(
      frontmatter.includes(`${sourceWord} classic`),
      `skills/${dir}/SKILL.md frontmatter description should reference "${sourceWord} classic engineering books" — update stale book count`,
    );

    for (const guide of guides) {
      check(
        readText(`skills/${dir}/${guide}`).includes("Iron Law"),
        `skills/${dir}/${guide} should reference the Iron Law`,
      );
    }
  }
}

// Every shipped mode needs at least one scenario. This replaced a hardcoded
// ">= 49 scenarios" floor: that number stopped tracking reality the moment the
// suite grew past it, and run-evals.mjs already enforces per-risk-code coverage.
// Mode coverage is the invariant neither check owned.
function checkEvalSuite() {
  const modes = new Set(evals.evals.map((ev) => ev.mode));
  for (const mode of VALID_MODES) {
    check(modes.has(mode), `evals/evals.json has no scenario for mode '${mode}'`);
  }
}

function checkContributing() {
  const contributing = readText("CONTRIBUTING.md");
  check(
    contributing.includes(`currently ${evalCount}`),
    `CONTRIBUTING.md should mention the current eval count (${evalCount})`,
  );
}

// AGENTS.md and GEMINI.md are near-duplicates that Codex CLI and Gemini CLI are
// each told to prioritize, so they have to stay factually identical. Checking only
// AGENTS.md is what let GEMINI.md quietly lose the eval count and the benchmark
// corpus, and let both keep advertising balanced-only scoring after strictness
// presets shipped.
const AGENT_DOCS = ["AGENTS.md", "GEMINI.md"];
// Backticked, as the scoring table writes them. A bare "strict" would also match
// inside the word "strictness" and pass on a doc that never lists the presets.
const STRICTNESS_PRESETS = ["`strict`", "`balanced`", "`legacy-friendly`"];

function checkAgentsDocs() {
  for (const file of AGENT_DOCS) {
    const text = readText(file);
    check(
      text.includes(`${sourceWord} classic engineering books`),
      `${file} should describe the repository as grounded in ${sourceWord} classic engineering books`,
    );
    check(
      text.includes(`${evalCount} scenarios`),
      `${file} should mention the current eval suite (${evalCount} scenarios)`,
    );
    for (const preset of STRICTNESS_PRESETS) {
      check(
        text.includes(preset),
        `${file} should document the '${preset}' strictness preset — its scoring table is stale`,
      );
    }
  }
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
    // The hook branches on CLAUDE_PLUGIN_ROOT, so it must never leak in from the
    // surrounding shell: a maintainer running `npm run validate` from inside
    // Claude Code would otherwise get the plugin-shaped output for the default
    // run and fail a check that has nothing to do with their change.
    const { CLAUDE_PLUGIN_ROOT: _pluginRoot, ...baseEnv } = process.env;
    const stdout = execFileSync(process.execPath, [path.join(root, "hooks", "session-start.mjs")], {
      cwd: root,
      env: { ...baseEnv, HOME: tempHome, ...env },
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
checkVersionRefs();
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
