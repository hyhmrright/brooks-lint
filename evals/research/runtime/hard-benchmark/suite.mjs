import { createHash } from "node:crypto";
import { readFileSync, readdirSync, lstatSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = fileURLToPath(new URL(".", import.meta.url));
export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
export const readJson = (filename) =>
  JSON.parse(readFileSync(filename, "utf8"));
export function inventory(root = ROOT, relative = "") {
  const entries = [];
  for (const name of readdirSync(path.join(root, relative)).sort()) {
    const rel = relative ? `${relative}/${name}` : name;
    const stat = lstatSync(path.join(root, rel));
    if (stat.isSymbolicLink()) throw new Error(`symlink: ${rel}`);
    if (stat.isDirectory()) entries.push(...inventory(root, rel));
    else if (!stat.isFile()) throw new Error(`not regular: ${rel}`);
    else if (rel !== "freeze.json") entries.push(rel);
  }
  return entries;
}
export function checkedPath(root, relative) {
  if (
    typeof relative !== "string" ||
    relative.includes("\\") ||
    relative.startsWith("/") ||
    relative.split("/").some((p) => !p || p === "." || p === "..")
  )
    throw new Error("unsafe path");
  const base = realpathSync(root);
  const target = path.join(base, relative);
  let current = base;
  for (const component of relative.split("/")) {
    current = path.join(current, component);
    if (lstatSync(current).isSymbolicLink()) throw new Error("symlink");
  }
  if (
    !lstatSync(target).isFile() ||
    !realpathSync(target).startsWith(base + path.sep)
  )
    throw new Error("not a contained regular file");
  return target;
}
export function manifest(root = ROOT) {
  return readJson(checkedPath(root, "cases.json"));
}
// A conservative scanner for this corpus's deliberately restricted source syntax.
// It is an authoring check, not a JavaScript parser or an execution security boundary.
export function staticImports(source) {
  const tokens = [];
  for (let i = 0; i < source.length; ) {
    const c = source[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (source.startsWith("//", i)) {
      const end = source.indexOf("\n", i + 2);
      i = end < 0 ? source.length : end + 1;
      continue;
    }
    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      if (end < 0)
        throw new Error("unsupported source syntax: unclosed comment");
      i = end + 2;
      continue;
    }
    if (c === "`")
      throw new Error("unsupported source syntax: template literal");
    if (c === '"' || c === "'") {
      const quote = c;
      let value = "";
      let closed = false;
      i++;
      while (i < source.length) {
        if (source[i] === quote) {
          i++;
          closed = true;
          break;
        }
        if (source[i] === "\n" || source[i] === "\r")
          throw new Error("unsupported source syntax: multiline string");
        if (source[i] === "\\") {
          value += source[i++];
          if (i === source.length) break;
        }
        value += source[i++];
      }
      if (!closed)
        throw new Error("unsupported source syntax: unclosed string");
      tokens.push({ kind: "string", value });
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(source.slice(i));
    if (word) {
      tokens.push({ kind: "word", value: word[0] });
      i += word[0].length;
      continue;
    }
    tokens.push({ kind: "punctuation", value: c });
    i++;
  }
  const imports = [];
  const isWord = (token) => token?.kind === "word";
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].kind !== "word") continue;
    if (
      tokens[i].value === "export" &&
      !["class", "function", "const", "let", "var", "async"].includes(
        tokens[i + 1]?.value,
      )
    ) {
      throw new Error(
        "unsupported import syntax: re-exports/default exports are outside the fixture grammar",
      );
    }
    if (tokens[i].value !== "import") continue;
    let cursor = i + 1;
    const need = (value) => {
      if (tokens[cursor]?.value !== value)
        throw new Error("unsupported import syntax");
      cursor++;
    };
    if (tokens[cursor]?.kind !== "string") {
      // Optional default binding, followed by a named or namespace clause.
      let defaultBinding = false;
      if (isWord(tokens[cursor]) && tokens[cursor].value !== "from") {
        defaultBinding = true;
        cursor++;
        if (tokens[cursor]?.value === ",") {
          cursor++;
          if (!["{", "*"].includes(tokens[cursor]?.value))
            throw new Error("unsupported import syntax");
        } else if (tokens[cursor]?.value !== "from")
          throw new Error("unsupported import syntax");
      }
      if (tokens[cursor]?.value === "*") {
        cursor++;
        need("as");
        if (!isWord(tokens[cursor]))
          throw new Error("unsupported import syntax");
        cursor++;
      } else if (tokens[cursor]?.value === "{") {
        cursor++;
        while (tokens[cursor]?.value !== "}") {
          if (!isWord(tokens[cursor]))
            throw new Error("unsupported import syntax");
          cursor++;
          if (tokens[cursor]?.value === "as") {
            cursor++;
            if (!isWord(tokens[cursor]))
              throw new Error("unsupported import syntax");
            cursor++;
          }
          if (tokens[cursor]?.value !== ",") break;
          cursor++;
        }
        need("}");
      } else if (!defaultBinding) throw new Error("unsupported import syntax");
      need("from");
    }
    if (
      tokens[cursor]?.kind !== "string" ||
      tokens[cursor].value.includes("\\")
    )
      throw new Error("unsupported import syntax: literal specifier required");
    imports.push(tokens[cursor++].value);
    need(";"); // No attributes, assertions, ASI or trailing unsupported import clauses.
    i = cursor - 1;
  }
  return imports;
}

export function checkStructure(root = ROOT) {
  const m = manifest(root);
  if (
    m.revision !== 1 ||
    m.status !== "public-development-hard-candidates" ||
    m.independent !== false ||
    m.privateCustody !== false ||
    m.humanReview !== "pending" ||
    m.bookMapping !== "unverified" ||
    m.difficultyMultiplier !== null ||
    m.liveRunnerIntegration !== false
  )
    throw new Error("unsupported research status");
  if (m.families.length !== 12 || m.cases.length !== 36)
    throw new Error("expected 12 families and 36 cases");
  const familyIds = new Set(m.families.map((f) => f.id));
  if (
    familyIds.size !== 12 ||
    m.families.filter((f) => f.split === "calibration").length !== 4 ||
    m.families.filter((f) => f.split === "development-reserved").length !== 8
  )
    throw new Error("family split");
  const ids = new Set();
  for (const item of m.cases) {
    if (!/^HB-\d{2}$/.test(item.id) || ids.has(item.id))
      throw new Error("case ID");
    ids.add(item.id);
    const family = m.families.find((f) => f.id === item.family);
    if (
      !family ||
      item.split !== family.split ||
      !["defect", "protected", "unresolved"].includes(item.kind)
    )
      throw new Error("case classification");
    const prefix = `cases/${item.id}/`;
    const allowed = new Set([
      "clock.mjs",
      "transport.mjs",
      "service.mjs",
      "budget.mjs",
      "pool.mjs",
      "lease.mjs",
      "store.mjs",
      "queue.mjs",
      "flight.mjs",
      "adapter.mjs",
      "scheduler.mjs",
      "breaker.mjs",
      "credits.mjs",
      "sink.mjs",
      "ledger.mjs",
      "dedupe.mjs",
      "connection.mjs",
      "policy.mjs",
      "context.md",
      "task.md",
    ]);
    if (
      item.inputs.length < 5 ||
      item.inputs.length > 6 ||
      new Set(item.inputs).size !== item.inputs.length ||
      !item.inputs.includes(prefix + "task.md") ||
      !item.inputs.includes(prefix + "context.md")
    )
      throw new Error("input count");
    for (const input of item.inputs) {
      if (!input.startsWith(prefix) || !allowed.has(input.slice(prefix.length)))
        throw new Error("input whitelist");
      const text = readFileSync(checkedPath(root, input), "utf8");
      if (
        /rubric\.json|oracles\.mjs|cases\.json|freeze\.json|offline-evidence\.json|development-reserved|expectedFindings|HB-\d\d/.test(
          text,
        )
      )
        throw new Error("evaluator leakage");
      if (input.endsWith(".mjs")) {
        if (
          /import\s*\(|\b(?:fetch|setTimeout|setInterval|process|Date)\b/.test(
            text,
          )
        )
          throw new Error("non-offline fixture");
        for (const specifier of staticImports(text)) {
          if (
            !/^\.\/[^/]+\.mjs$/.test(specifier) ||
            !item.inputs.includes(prefix + specifier.slice(2))
          )
            throw new Error("input import closure");
        }
      }
    }
    if (
      item.rubric !== prefix + "rubric.json" ||
      item.driver !== `drivers/${family.id}.mjs`
    )
      throw new Error("evaluator path");
    checkedPath(root, item.driver);
    const rubric = readJson(checkedPath(root, item.rubric));
    if (
      rubric.caseId !== item.id ||
      rubric.assessment !== item.kind ||
      rubric.expectedFindings.length !== (item.kind === "defect" ? 1 : 0)
    )
      throw new Error("rubric classification");
    const required = rubric.evidenceRequirements.map((e) => e.id);
    if (
      new Set(required).size !== required.length ||
      !required.includes("causal-trace") ||
      !required.includes("boundary-control") ||
      (item.kind === "unresolved" &&
        (!required.includes("missing-artifact") ||
          !required.includes("explicit-alternative-judgments")))
    )
      throw new Error("evidence requirements");
  }
  for (const family of m.families) {
    const rows = m.cases.filter((c) => c.family === family.id);
    if (rows.length !== 3 || new Set(rows.map((c) => c.kind)).size !== 3)
      throw new Error("family coverage");
  }
  return m;
}
export function freezeData(root = ROOT) {
  checkStructure(root);
  return {
    revision: 1,
    algorithm: "sha256",
    status: "public-development-freeze-not-independent",
    files: Object.fromEntries(
      inventory(root).map((rel) => [
        rel,
        sha256(readFileSync(checkedPath(root, rel))),
      ]),
    ),
  };
}
export function validate(root = ROOT) {
  const m = checkStructure(root);
  const expected = readJson(checkedPath(root, "freeze.json"));
  if (JSON.stringify(expected) !== JSON.stringify(freezeData(root)))
    throw new Error("frozen inventory drift");
  return m;
}
export function exportInputs(caseId, root = ROOT) {
  const m = validate(root),
    item = m.cases.find((c) => c.id === caseId);
  if (!item) throw new Error("unknown case");
  // No case/family/arm/kind/split metadata is placed in the responding model payload.
  return {
    files: item.inputs.map((input) => ({
      path: path.basename(input),
      content: readFileSync(checkedPath(root, input), "utf8"),
    })),
  };
}
export async function exerciseCase(item, root = ROOT) {
  const driver = await import(
    pathToFileURL(checkedPath(root, item.driver)).href
  );
  const directory = pathToFileURL(
    path.join(root, "cases", item.id) + path.sep,
  ).href;
  return driver.exercise(directory);
}
export async function reproduce(root = ROOT) {
  const m = checkStructure(root),
    observations = [];
  for (const item of m.cases)
    observations.push({
      caseId: item.id,
      family: item.family,
      kind: item.kind,
      observations: await exerciseCase(item, root),
    });
  return {
    revision: 1,
    source:
      "deterministic execution of supplied fixture modules; no model responses",
    observations,
  };
}
