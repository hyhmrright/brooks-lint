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
 * placeholders, an explicit `(R2)` code, and inline severity emoji.
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
const FIELD_RE = /^\s*(Symptom|Source|Consequence|Remedy)\s*[:：]\s*(.*)$/i;
const EMOJI_SEVERITY = { "🔴": "critical", "🟡": "warning", "🟢": "suggestion" };

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
const EXPLICIT_CODE_RE = new RegExp(`\\b(${CODES})\\b`);
const PARENTHESISED_CODE_RE = new RegExp(`\\((${CODES})\\)`, "i");

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
export function parseFindings(report) {
  const lines = (report ?? "").split(/\r?\n/);
  const findings = [];
  let severity = null;
  let current = null;
  let field = null;

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
      continue;
    }
    if (SECTION_HEADER_RE.test(line)) {
      // A non-severity header ends the current Findings group (e.g. ## Summary).
      commit();
      severity = null;
      continue;
    }

    const bold = severity && line.match(BOLD_TITLE_RE);
    if (bold) {
      commit();
      const emoji = line.match(/^\s*(🔴|🟡|🟢)/);
      const { namePart, title } = splitTitle(bold[1]);
      const riskCode = resolveCode(namePart);
      current = {
        severity: emoji ? EMOJI_SEVERITY[emoji[1]] : severity,
        riskCode,
        riskName: riskCode ? RISK_CATALOG[riskCode] : namePart.replace(/[[\]]/g, "").trim(),
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

    if (!current) continue;

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
  }
  return findings;
}

/** Count findings by severity. @returns {{critical, warning, suggestion}} */
export function countFindings(report) {
  const counts = { critical: 0, warning: 0, suggestion: 0 };
  for (const f of parseFindings(report)) {
    if (counts[f.severity] !== undefined) counts[f.severity] += 1;
  }
  return counts;
}
