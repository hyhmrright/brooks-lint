import assert from "node:assert/strict";
import { test } from "node:test";
import { metadataDifferences } from "./github-metadata.mjs";

const config = { description: "Review skills", homepage: "https://example.com/", topics: ["agent-skills", "code-review"],
  labels: [{ name: "release", color: "abcdef", description: "Release preparation" }] };
const repo = { ...config, topics: [...config.topics].reverse() };

test("metadata checks ignore topic order and preserve unrelated labels", () => {
  assert.deepEqual(metadataDifferences(config, repo, [{ ...config.labels[0], color: "ABCDEF" }, { name: "user-label" }]), []);
});

test("missing and changed repository metadata and managed labels are reported", () => {
  assert.deepEqual(metadataDifferences(config, { description: "Old", homepage: "", topics: [] }, []),
    ["About description", "About homepage", "repository topics", "label: release"]);
  assert.deepEqual(metadataDifferences(config, repo, [{ ...config.labels[0], description: "Old" }]), ["label: release"]);
});
