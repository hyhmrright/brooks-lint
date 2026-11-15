/** Offline historical replay only. Never imported by registration or collection. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {snapshot} from '../health-sweep-scope-retest/archive-tests.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, '../../..');
export const scorerPath = 'skills/brooks-health/scripts/score-dashboard.mjs';
export const scorerSha256 = '96c424d416a4796ef8a942e6df873db55525481d9a3b70cb319a1d6a447baa64';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export function retainedScorer(bytes = fs.readFileSync(path.join(here, 'score-dashboard.snapshot.txt'))) {
  assert.equal(hash(bytes), scorerSha256, 'Historical scorer snapshot changed');
  return bytes;
}
export function restoreScorer(base, expected = scorerSha256) {
  assert.notEqual(fs.realpathSync(base), fs.realpathSync(root), 'Never restore into current checkout');
  assert.equal(expected, scorerSha256, 'Unknown historical scorer');
  const destination = path.join(base, scorerPath);
  assert(!fs.lstatSync(destination).isSymbolicLink(), 'Scorer destination must not be a symlink');
  fs.writeFileSync(destination, retainedScorer());
  assert.equal(hash(fs.readFileSync(destination)), expected);
}
const groups = Object.freeze({
  v3: 'evals/research/skills-benchmark-v2/campaign-v3.test.mjs',
  v4: 'evals/research/skills-benchmark-v4/campaign.test.mjs',
  v5: 'evals/research/skills-benchmark-v5/campaign.test.mjs',
  scope: 'evals/research/health-sweep-scope-retest/retest.test.mjs',
  retest: 'evals/research/health-sweep-retest/retest.test.mjs',
  recovery: 'evals/research/health-sweep-recovery/retest.test.mjs',
});
export function selectedTest(group) {
  assert(Object.hasOwn(groups, group), 'Unknown historical test group');
  return groups[group];
}
export function replay(group) {
  const testFile = selectedTest(group);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brooks-scorer-history-'));
  const current = hash(fs.readFileSync(path.join(root, scorerPath)));
  try {
    for (const name of ['evals', 'scripts', 'skills', 'docs']) {
      fs.cpSync(path.join(root, name), path.join(dir, name), {recursive: true});
    }
    fs.copyFileSync(path.join(root, 'package.json'), path.join(dir, 'package.json'));
    restoreScorer(dir);
    let frozen;
    if (['scope', 'retest', 'recovery'].includes(group)) {
      const folder = path.join(root, path.dirname(testFile));
      frozen = JSON.parse(fs.readFileSync(path.join(folder, 'freeze.json')));
      const anchor = JSON.parse(fs.readFileSync(path.join(folder, 'anchor.json'))).sha256;
      for (const [file, content] of Object.entries(snapshot(frozen, anchor))) {
        fs.writeFileSync(path.join(dir, file), content);
      }
      for (const [file, sha] of Object.entries(frozen.sources)) {
        assert.equal(hash(fs.readFileSync(path.join(dir, file))), sha, `Historical source drift: ${file}`);
      }
    }
    const result = spawnSync(process.execPath, ['--test', testFile], {
      cwd: dir, encoding: 'utf8', timeout: 900000, maxBuffer: 8 * 1024 * 1024,
    });
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `Historical suite failed: ${group}`);
    assert.equal(hash(fs.readFileSync(path.join(dir, scorerPath))), scorerSha256);
    if (frozen) for (const [file, sha] of Object.entries(frozen.sources)) {
      assert.equal(hash(fs.readFileSync(path.join(dir, file))), sha, `Historical source changed: ${file}`);
    }
    console.log(JSON.stringify({historicalOnly: true, group, scorerSha256, liveCalls: 0}));
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
    assert.equal(hash(fs.readFileSync(path.join(root, scorerPath))), current, 'Current scorer modified');
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3);
  replay(process.argv[2]);
}
