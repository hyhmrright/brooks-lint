import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMarket } from "./gen-dsh-market.mjs";

const local = { name: "brooks-lint", version: "1.9.0" };
const published = { ...local, description: "Review skills", keywords: ["dsh-plugin"], dsh: { bundle: { patch: "./cordis.patch.yml" } } };
const registry = {
  name: local.name,
  versions: { [local.version]: published },
  time: { [local.version]: "2026-10-24T02:00:00.000Z" },
};

test("market pins the published npm version and its registry publication time", () => {
  const index = buildMarket(local, registry);
  assert.equal(index.format, 1);
  assert.equal(index.plugins[0].name, local.name);
  assert.deepEqual(index.plugins[0].versions, [{
    version: local.version,
    publishTimestamp: 1792807200,
    source: { type: "npm", registry: "https://registry.npmjs.org/" },
  }]);
});

test("unpublished or invalid releases cannot produce installable market entries", () => {
  for (const invalid of [
    { ...registry, versions: {} },
    { ...registry, name: "another-package" },
    { ...registry, time: {} },
    { ...registry, versions: { [local.version]: { ...published, dsh: {} } } },
  ]) assert.throws(() => buildMarket(local, invalid));
});
