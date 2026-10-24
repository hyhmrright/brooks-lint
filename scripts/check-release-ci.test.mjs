import assert from "node:assert/strict";
import { test } from "node:test";
import { successfulRun } from "./check-release-ci.mjs";

const sha = "release-commit";
const success = { headSha: sha, status: "completed", conclusion: "success", url: "https://github.com/example/actions/runs/1" };

test("a completed successful run for the exact release commit permits publication", () => {
  assert.equal(successfulRun([success], sha), success);
});

test("a green different commit, missing CI, and incomplete or unsuccessful CI block publication", () => {
  for (const runs of [[], [{ ...success, headSha: "previous-commit" }],
    [{ ...success, status: "queued", conclusion: null }],
    [{ ...success, status: "in_progress", conclusion: null }],
    [{ ...success, conclusion: "cancelled" }], [{ ...success, conclusion: "failure" }]]) {
    assert.throws(() => successfulRun(runs, sha), /Release blocked/);
  }
});

test("an older green run cannot override the latest failed run for the same commit", () => {
  assert.throws(() => successfulRun([{ ...success, conclusion: "failure" }, success], sha), /Release blocked/);
});
