import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { apply } from "../lib/index.js";

function provider(config) {
  let registered;
  apply({ skills: { registerProvider(factory) { registered = factory(); } } }, config);
  return registered;
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "brooks-dsh-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function skill(root, name, raw) {
  const directory = join(root, name);
  await mkdir(directory, { recursive: true });
  const locator = join(directory, "SKILL.md");
  await writeFile(locator, raw);
  return locator;
}

test("bundled provider discovers all six skills and loads their bodies and shared resources", async () => {
  const source = provider();
  const candidates = await source.list();
  assert.deepEqual(candidates.map((item) => item.name), [
    "brooks-audit", "brooks-debt", "brooks-health", "brooks-review", "brooks-sweep", "brooks-test",
  ]);
  const root = fileURLToPath(new URL("../skills/", import.meta.url));
  for (const candidate of candidates) {
    assert.equal(candidate.provider, "brooks-lint");
    assert.equal(candidate.rank, 600);
    assert.equal(candidate.source, "bundled");
    assert.deepEqual(candidate.invocation, { modelInvocable: true, userInvocable: true });
    assert(candidate.description.includes("Do NOT trigger for:"));
    assert.deepEqual(candidate.resourceBase, {
      kind: "directory", path: join(root, candidate.name).split(sep).join("/"),
    });
    const loaded = await source.get(candidate);
    const raw = await readFile(join(root, candidate.name, "SKILL.md"), "utf8");
    assert.equal(loaded.content, raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, "").trim());
    assert.deepEqual(loaded.resourceBase, candidate.resourceBase);
    const shared = await readFile(resolve(loaded.resourceBase.path, "../_shared/common.md"), "utf8");
    assert(shared.includes("The Iron Law"));
  }
});

test("custom roots skip directories without SKILL.md and non-directory entries", async (t) => {
  const root = await fixture(t);
  await mkdir(join(root, "_shared"));
  await writeFile(join(root, "README.md"), "Not a skill");
  await skill(root, "custom", "---\ndescription: Custom workflow\n---\nBody\n");
  const source = provider({ assetRoot: root });
  const candidates = await source.list();
  assert.deepEqual(candidates.map((item) => item.name), ["custom"]);
  assert.equal((await source.get(candidates[0])).content, "Body");
});

test("description formats used by skills load through the public provider", async (t) => {
  const root = await fixture(t);
  for (const [name, yaml, expected] of [
    ["plain", "description: Plain description", "Plain description"],
    ["quoted", 'description: "Quoted description"', "Quoted description"],
    ["single", "description: 'Single quoted'", "Single quoted"],
    ["folded", "description: >\n  First line\n  second line", "First line second line"],
    ["literal", "description: |\n  First line\n  second line", "First line second line"],
  ]) {
    await skill(root, name, `---\r\n${yaml.replaceAll("\n", "\r\n")}\r\n---\r\nBody\r\n`);
    const source = provider({ assetRoot: root });
    const candidate = (await source.list()).find((item) => item.name === name);
    assert.equal(candidate.description, expected);
    assert.equal((await source.get(candidate)).content, "Body");
  }
});

test("invalid frontmatter fails discovery with the affected file path", async (t) => {
  for (const raw of ["No frontmatter", "---\nname: custom\n---\nBody", "---\ndescription: >\n---\nBody"]) {
    const root = await fixture(t);
    const locator = await skill(root, "custom", raw);
    await assert.rejects(provider({ assetRoot: root }).list(), (error) => error.message.includes(locator));
  }
});

test("unexpected read failures are reported with file path and original cause", async (t) => {
  const root = await fixture(t);
  const locator = join(root, "broken", "SKILL.md");
  // A directory reliably causes EISDIR, including when tests run with elevated permissions.
  await mkdir(locator, { recursive: true });
  await assert.rejects(provider({ assetRoot: root }).list(), (error) => {
    assert.equal(error.message, `brooks-lint: failed to read ${locator}`);
    assert.equal(error.cause.code, "EISDIR");
    return true;
  });
});

test("loading a candidate reports a file removed after discovery", async (t) => {
  const root = await fixture(t);
  const locator = await skill(root, "custom", "---\ndescription: Custom\n---\nBody");
  const source = provider({ assetRoot: root });
  const [candidate] = await source.list();
  await rm(locator);
  await assert.rejects(source.get(candidate), { code: "ENOENT" });
});
