import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const cli = path.join(root, 'bin/brooks-lint.mjs');
const platforms = {
  opencode: ['.config/opencode/skills', '.opencode/skills'], cursor: ['.cursor/skills', '.cursor/skills'],
  windsurf: ['.codeium/windsurf/skills', '.windsurf/skills'], antigravity: ['.gemini/skills', '.agent/skills'],
  pi: ['.pi/agent/skills', '.pi/skills'], kiro: ['.kiro/skills', '.kiro/skills'],
  copilot: ['.copilot/skills', '.github/skills'], droid: ['.factory/skills', '.factory/skills'],
  dsh: ['.dsh/skills', '.dsh/skills'], gemini: ['.gemini/skills', '.gemini/skills'],
  codex: ['.codex/skills', '.codex/skills'], claude: ['.claude/skills', '.claude/skills'],
  agents: ['.agents/skills', '.agents/skills'], bob: ['.bob/skills', '.bob/skills'],
};
async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'brooks-npm-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const home = path.join(dir, 'home'), cwd = path.join(dir, 'project');
  await mkdir(home); await mkdir(cwd);
  const env = { ...process.env, HOME: home, USERPROFILE: home, DSH_HOME: '' };
  return { dir, home, cwd, env, run: (...args) => spawnSync(process.execPath, [cli, ...args], { cwd, env, encoding: 'utf8' }) };
}
async function verifySkills(dest) {
  const sourceEntries = await readdir(path.join(root, 'skills'));
  for (const entry of sourceEntries) {
    const file = entry === '_shared' ? 'common.md' : 'SKILL.md';
    assert.equal(await readFile(path.join(dest, entry, file), 'utf8'), await readFile(path.join(root, 'skills', entry, file), 'utf8'));
  }
  assert.ok((await readFile(path.join(dest, '_shared/common.md'), 'utf8')).length);
}
test('every canonical global and project mapping installs flat bundled skills', async t => {
  const f = await fixture(t);
  const list = f.run('--list'); assert.equal(list.status, 0, list.stderr);
  assert.deepEqual(list.stdout.trim().replace('Supported platforms: ', '').split(' '), Object.keys(platforms));
  for (const [platform, mapping] of Object.entries(platforms)) {
    for (const [scope, base] of [[0, f.home], [1, f.cwd]]) {
      const result = f.run('install', platform, ...(scope ? ['--project'] : []));
      assert.equal(result.status, 0, `${platform}: ${result.stderr}`);
      await verifySkills(path.join(base, mapping[scope]));
    }
  }
});
test('DSH_HOME override and custom destination preserve unrelated files', async t => {
  const f = await fixture(t); f.env.DSH_HOME = path.join(f.dir, 'custom-dsh');
  assert.equal(f.run('install', 'dsh').status, 0); await verifySkills(path.join(f.env.DSH_HOME, 'skills'));
  const custom = path.join(f.dir, 'custom'); await mkdir(custom); await writeFile(path.join(custom, 'mine.txt'), 'preserve');
  assert.equal(f.run('install', '--dir', custom).status, 0); await verifySkills(custom);
  assert.equal(await readFile(path.join(custom, 'mine.txt'), 'utf8'), 'preserve');
  assert.equal(f.run('install', 'cursor', '--project', '--dir', '../relative').status, 0);
  await verifySkills(path.join(f.dir, 'relative'));
});
test('help, list and version do not install anything', async t => {
  const f = await fixture(t);
  for (const args of [[], ['--help'], ['-h'], ['list'], ['--list'], ['install', '--list'], ['install', '--help'], ['install', '-h'], ['--version'], ['-v']]) {
    const result = f.run(...args); assert.equal(result.status, 0, result.stderr);
  }
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(f.run('--version').stdout.trim(), pkg.version);
  assert.deepEqual(await readdir(f.home), []); assert.deepEqual(await readdir(f.cwd), []);
});
test('invalid arguments fail before writing', async t => {
  const f = await fixture(t); const dest = path.join(f.dir, 'must-not-exist');
  for (const args of [['install'], ['install', 'bogus'], ['install', '--dir'], ['install', '--dir', '--project'], ['install', 'cursor', 'codex'], ['install', 'cursor', '--unknown'], ['install', '--dir', dest, '--bad'], ['install', 'bogus', '--dir', dest], ['list', '--project'], ['install', 'cursor', '--project', '--project']]) {
    assert.notEqual(f.run(...args).status, 0, JSON.stringify(args));
  }
  assert.deepEqual((await readdir(f.dir)).sort(), ['home', 'project']);
  assert.deepEqual(await readdir(f.home), []); assert.deepEqual(await readdir(f.cwd), []);
});
test('source overlap and symlink aliases are rejected', async t => {
  const f = await fixture(t); const source = path.join(root, 'skills');
  for (const dest of [source, path.join(source, 'child'), root]) assert.notEqual(f.run('install', '--dir', dest).status, 0);
  const alias = path.join(f.dir, 'alias'); await symlink(source, alias, 'dir');
  assert.notEqual(f.run('install', '--dir', path.join(alias, 'child')).status, 0);
  const dest = path.join(f.dir, 'dest'); await mkdir(dest); await symlink(path.join(source, 'brooks-review'), path.join(dest, 'brooks-review'), 'dir');
  assert.notEqual(f.run('install', '--dir', dest).status, 0);
});
test('npm packed artifact can install without repository files or network', async t => {
  const f = await fixture(t);
  const packed = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', f.dir], { cwd: root, encoding: 'utf8' }));
  const unpack = path.join(f.dir, 'unpack'); await mkdir(unpack);
  execFileSync('tar', ['-xzf', path.join(f.dir, packed[0].filename), '-C', unpack]);
  const result = spawnSync(process.execPath, [path.join(unpack, 'package/bin/brooks-lint.mjs'), 'install', 'agents'], { cwd: f.cwd, env: f.env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); await verifySkills(path.join(f.home, '.agents/skills'));
});
