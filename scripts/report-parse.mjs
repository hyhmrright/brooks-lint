/**
 * Parse a brooks-lint Markdown report into structured findings.
 *
 * The report format is defined by the Report Template in skills/_shared/common.md:
 * findings live under severity sub-headers (### 🔴 Critical / 🟡 Warning /
 * 🟢 Suggestion), each finding is a bold title line `**Risk Name — title**`
 * followed by Symptom / Source / Consequence / Remedy fields.
 *
 * Consumed by sarif.mjs (SARIF export) and ci-review.mjs (severity gates).
 * Best-effort: the report is LLM-authored, so the parser tolerates bracket
 * placeholders, an explicit `(R2)` code, inline severity emoji, and a literal
 * severity suffix such as `(Warning)` in each finding title.
 */

/** Canonical risk code → display name (decay-risks.md + test-decay-risks.md). */
export const RISK_CATALOG = {
  R1: "Cognitive Overload",
  R2: "Change Propagation",
  R3: "Knowledge Duplication",
  R4: "Accidental Complexity",
  R5: "Dependency Disorder",
  R6: "Domain Model Distortion",
  T1: "Test Obscurity",
  T2: "Test Brittleness",
  T3: "Test Duplication",
  T4: "Mock Abuse",
  T5: "Coverage Illusion",
  T6: "Architecture Mismatch",
};

const NAME_TO_CODE = Object.fromEntries(
  Object.entries(RISK_CATALOG).map(([code, name]) => [name.toLowerCase(), code]),
);

// The template prescribes a bare `### 🔴 Critical`, but LLM output drifts —
// tolerate a plural and a trailing "Issues"/"Findings"/"Items" qualifier while
// still anchoring on the line so section headers like `## Findings` never match.
const SEVERITY_HEADER_RE =
  /^#{2,6}\s*(?:🔴|🟡|🟢|⚠️?|❗)?\s*(Critical|Warning|Suggestion)s?(?:\s+(?:Issues?|Findings?|Items?))?\s*:?\s*$/i;
const SECTION_HEADER_RE = /^#{1,6}\s/;
const BOLD_TITLE_RE = /^\s*(?:🔴|🟡|🟢)?\s*\*\*(.+?)\*\*\s*$/;
const TITLE_SEVERITY_RE = /\s+\((Critical|Warning|Suggestion)\)\s*$/i;
const FIELD_RE = /^\s*(?:\*\*)?(Symptom|Source|Consequence|Remedy)(?:\*\*)?\s*[:：](?:\*\*)?\s*(.*)$/i;
const EMOJI_SEVERITY = { "🔴": "critical", "🟡": "warning", "🟢": "suggestion" };

/** Exclude examples and explicitly suppressed findings from every machine view. */
function reportContent(report) {
  let fence = null;
  const errors = [];
  const lines = (report ?? "").split(/\r?\n/).filter((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      return false;
    }
    return !fence;
  });
  if (fence) errors.push("Unclosed code fence in report");
  const suppressedStart = /<details\b[^>]*>\s*<summary\b[^>]*>\s*Suppressed(?:\s*\(\d+\))?\s*<\/summary\s*>/i;
  const text = lines.join("\n").replace(/<details\b[^>]*>[\s\S]*?<\/details\s*>/gi, (block) => {
    if (!suppressedStart.test(block)) return block;
    if ((block.match(/<details\b/gi) ?? []).length !== 1) {
      errors.push("Nested or malformed Suppressed section");
      return block;
    }
    // A boundary prevents the next active finding from inheriting an old tier.
    return "\n## Suppressed\n";
  });
  if (suppressedStart.test(text)) errors.push("Unclosed or malformed Suppressed section");
  return { lines: text.split("\n"), errors };
}

// A path with a directory separator, or a bare filename with a known source
// extension — optionally followed by `:line`. The extension allowlist keeps
// prose like "e.g." or "i.e." from being mistaken for a file reference.
//
// ORDERING IS LOAD-BEARING: JS alternation is first-match, not longest-match, so
// within a shared prefix the LONGER extension must come first (`tsx` before `ts`,
// `hpp` before `h`, `exs` before `ex`). Getting this backwards silently truncates
// the filename — `App.tsx:12` parsed as `App.ts` with no line number — and the
// resulting SARIF location points at a file that does not exist.
// Sorting the list longest-first enforces the rule mechanically; the extensions
// are grouped alphabetically within each length only for readability.
export const SOURCE_EXTENSIONS = [
  "astro", "cljc", "cljs", "clj", "cpp", "cxx", "cjs", "cr", "cs", "cc", "c",
  "dart", "elm", "erl", "exs", "ex", "fsx", "fs", "gradle", "groovy", "hpp",
  "hs", "h", "java", "jl", "jsx", "js", "kts", "kt", "lua", "mjs", "mli", "ml",
  "mm", "m", "nim", "php", "pl", "pm", "proto", "py", "rb", "rs", "rsx", "scala",
  "sol", "sql", "svelte", "tf", "tsx", "ts", "vue", "zig",
];

const LOCATION_RE = new RegExp(
  "([\\w.-]*\\/[\\w./-]*\\.\\w+|[\\w.-]+\\.(?:" +
    [...SOURCE_EXTENSIONS].sort((a, b) => b.length - a.length).join("|") +
    "))(?::(\\d+))?",
);

function splitTitle(bold) {
  // Dash is the template separator; a colon is a common LLM variant. `.match`
  // returns the leftmost hit, so a dash still wins when both are present.
  const sep = bold.match(/\s*[—–]\s*|\s+--\s+|\s+-\s+|\s*:\s*/);
  if (!sep) return { namePart: bold.trim(), title: "" };
  return {
    namePart: bold.slice(0, sep.index).trim(),
    title: bold.slice(sep.index + sep[0].length).trim(),
  };
}

// Built from RISK_CATALOG so a newly catalogued code is recognised here too —
// a hardcoded `[RT][1-6]` range silently dropped anything outside it.
const CODES = Object.keys(RISK_CATALOG).join("|");
// Case-sensitive on purpose: a lowercase `r1` in prose is not a risk citation.
const EXPLICIT_CODE_RE = new RegExp(`\\b(${CODES}|C\\d+)\\b`);
const PARENTHESISED_CODE_RE = new RegExp(`\\((${CODES}|C\\d+)\\)`, "i");

function resolveCode(namePart) {
  const explicit = namePart.match(EXPLICIT_CODE_RE);
  if (explicit) return explicit[1].toUpperCase();
  const cleaned = namePart
    .replace(PARENTHESISED_CODE_RE, "")
    .replace(/[[\]]/g, "")
    .trim()
    .toLowerCase();
  if (NAME_TO_CODE[cleaned]) return NAME_TO_CODE[cleaned];
  // Fallback: a missed separator can leave trailing words on the name, so match
  // the longest known risk name the cleaned string starts with.
  const prefix = Object.keys(NAME_TO_CODE)
    .filter((name) => cleaned.startsWith(name))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? NAME_TO_CODE[prefix] : null;
}

/** Extract `{ file, line }` from text, or `{ file: null, line: null }`. */
export function extractLocation(text) {
  const m = (text ?? "").match(LOCATION_RE);
  if (!m) return { file: null, line: null };
  // Group 1 is the path; group 2 is the optional `:line` (the extension list is
  // a non-capturing group, so the line digits are m[2], not m[3]).
  return { file: m[1], line: m[2] ? parseInt(m[2], 10) : null };
}

/**
 * Parse a report into an array of findings.
 * @returns {Array<{severity, riskCode, riskName, title, symptom, source,
 *   consequence, remedy, file, line}>}
 */
function readFindings(report) {
  const { lines, errors } = reportContent(report);
  const findings = [];
  let severity = null;
  let current = null;
  let field = null;
  let customSection = false;

  const commit = () => {
    if (!current) return;
    // Keep only blocks that look like real findings (a known risk or a symptom).
    if (current.riskCode || current.symptom) findings.push(current);
    current = null;
    field = null;
  };

  for (const line of lines) {
    const sevHeader = line.match(SEVERITY_HEADER_RE);
    if (sevHeader) {
      commit();
      severity = sevHeader[1].toLowerCase();
      const emoji = line.match(/(🔴|🟡|🟢)/)?.[1];
      if (emoji && EMOJI_SEVERITY[emoji] !== severity) errors.push(`Conflicting severity in heading: ${line.trim()}`);
      continue;
    }
    if (SECTION_HEADER_RE.test(line)) {
      if (/^#{2,6}\s+Project-Specific Risks\s*$/i.test(line)) {
        commit();
        customSection = true;
        severity = null;
        // This heading supplies no severity; require a nested tier or title signal.
        continue;
      }
      // A non-severity header ends the current Findings group (e.g. ## Summary).
      commit();
      severity = null;
      customSection = false;
      continue;
    }

    const titleLine = line.match(BOLD_TITLE_RE);
    const inlineSeverity = line.match(/^\s*(🔴|🟡|🟢)/);
    const titleSeverity = titleLine?.[1].match(TITLE_SEVERITY_RE)?.[1].toLowerCase();
    const bold = (severity || customSection || inlineSeverity || titleSeverity) && titleLine;
    if (titleLine && !bold && resolveCode(splitTitle(titleLine[1]).namePart)) {
      errors.push(`Finding outside a severity group: ${titleLine[1]}`);
    }
    if (bold) {
      commit();
      const emoji = line.match(/^\s*(🔴|🟡|🟢)/);
      const signals = [severity, emoji && EMOJI_SEVERITY[emoji[1]], titleSeverity].filter(Boolean);
      if (new Set(signals).size > 1) errors.push(`Conflicting severity for finding: ${bold[1]}`);
      const { namePart, title } = splitTitle(bold[1].replace(TITLE_SEVERITY_RE, ''));
      const riskCode = resolveCode(namePart);
      current = {
        severity: emoji ? EMOJI_SEVERITY[emoji[1]] : titleSeverity ?? severity,
        riskCode,
        riskName: RISK_CATALOG[riskCode] ?? namePart.replace(/[[\]]/g, "").trim(),
        title,
        symptom: "",
        source: "",
        consequence: "",
        remedy: "",
        file: null,
        line: null,
      };
      field = null;
      continue;
    }

    if (!current) {
      if (FIELD_RE.test(line)) errors.push(`Unparsed finding field: ${line.trim()}`);
      continue;
    }

    const fieldMatch = line.match(FIELD_RE);
    if (fieldMatch) {
      field = fieldMatch[1].toLowerCase();
      current[field] = fieldMatch[2].trim();
      continue;
    }
    // Continuation line for the field in progress.
    if (field && line.trim()) {
      current[field] = `${current[field]} ${line.trim()}`.trim();
    }
  }
  commit();

  for (const f of findings) {
    // Location belongs in the Symptom, but fall back to Source/Consequence when
    // it's absent. Remedy is excluded — it often names a destination, not the
    // site of the finding.
    const fromSymptom = extractLocation(f.symptom);
    const loc = fromSymptom.file ? fromSymptom : extractLocation(`${f.source} ${f.consequence}`);
    f.file = loc.file;
    f.line = loc.line;
    if (!f.severity) errors.push(`Missing severity for finding: ${f.riskName} — ${f.title}`);
  }
  return { findings, errors };
}

export function parseFindings(report) {
  return readFindings(report).findings;
}

/** Read score labels, not incidental numbers in prose or fenced examples. */
export function readScore(report, mode) {
  const scores = [];
  const { lines, errors } = reportContent(report);
  let present = false;
  for (const line of lines) {
    const plain = line.replace(/\*\*/g, "").replace(/^\s*#{1,6}\s+/, "").trim();
    let match = plain.match(/^(Health Score|Composite Score)(?:\s*[:：]\s*|\s+(?=[+-]?\d))(.*)$/i);
    if (mode === "sweep" && !match) {
      const after = plain.match(/(?:^|[→>])\s*After\s*:\s*(.*)$/i);
      if (after) match = [after[0], "After", after[1]];
    }
    if (!match) continue;
    present = true;
    const value = match[2].match(/^(\d{1,3})(?:\s*\/\s*100)?\s*$/);
    if (!value || Number(value[1]) > 100) errors.push(`Invalid ${match[1]}: ${match[2]}`);
    else scores.push(Number(value[1]));
  }
  if (new Set(scores).size > 1) errors.push("Conflicting report scores");
  return { score: scores.length && !errors.length ? scores[0] : null, present, errors };
}

/** Strict boundary for machine consumers; tolerant parsing remains available for legacy SARIF. */
export function parseReport(report, { mode, requireScore = true } = {}) {
  const { findings, errors } = readFindings(report);
  const result = readScore(report, mode);
  errors.push(...result.errors);
  if (!report?.trim()) errors.push("Empty report");
  if (requireScore && result.score === null) errors.push("Missing or invalid report score");
  if (requireScore) {
    // A score alone is not evidence that a review ran. The shared templates all
    // identify the mode and the actual scope, including the one-line sweep form.
    const envelope = reportContent(report).lines.join("\n").replace(/\*\*/g, "");
    if (!/^\s*Mode\s*:\s*\S/m.test(envelope)) errors.push("Missing report Mode");
    if (!/(?:^|\|)\s*Scope\s*:\s*\S/m.test(envelope)) errors.push("Missing report Scope");
  }
  for (const f of findings) {
    if (!f.riskCode) errors.push(`Missing or unknown risk code for finding: ${f.riskName} — ${f.title}`);
    for (const field of ["symptom", "source", "consequence", "remedy"]) {
      if (!f[field]) errors.push(`Missing ${field} for finding: ${f.riskName} — ${f.title}`);
    }
  }
  if (result.score !== null && result.score < 100 && findings.length === 0) {
    errors.push("A deducted score requires parsed findings");
  }
  return { score: result.score, findings, errors, valid: errors.length === 0 };
}

/** Count findings by severity. @returns {{critical, warning, suggestion}} */
export function countFindings(report) {
  const counts = { critical: 0, warning: 0, suggestion: 0 };
  for (const f of parseFindings(report)) {
    if (counts[f.severity] !== undefined) counts[f.severity] += 1;
  }
  return counts;
}
