import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {randomUUID} from 'node:crypto';
import {boundedCommand} from './bounded-command.mjs';

export const image = 'sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d';
const label = 'brooks.six-skill.lease';
const output = (r, stream = 'stdout') => Buffer.from(r[stream + '_base64'], 'base64').toString();
const docker = (args, opts) => boundedCommand('docker', args, opts);

export async function probePreflight() {
  const r = await docker(['image', 'inspect', image]);
  assert.equal(r.code, 0, 'Pinned oracle image unavailable');
  const [info] = JSON.parse(output(r));
  assert.equal(info.Id, image);
  return {image, os: info.Os, architecture: info.Architecture};
}

function checkPolicy(info, name, lease, bind) {
  assert.equal(info.Name, '/' + name);
  assert.equal(info.Image, image);
  assert.equal(info.Config.Labels[label], lease);
  assert.equal(info.Config.User, '1000:1000');
  assert(!info.Config.Env.some(value => /(?:KEY|TOKEN|PROXY|CODEX_HOME)=/i.test(value)));
  const h = info.HostConfig;
  assert.equal(h.NetworkMode, 'none');
  assert.equal(h.ReadonlyRootfs, true);
  assert.equal(h.Privileged, false);
  assert.deepEqual(h.CapDrop, ['ALL']);
  assert(h.SecurityOpt.includes('no-new-privileges'));
  assert.equal(h.Memory, 134217728);
  assert.equal(h.PidsLimit, 32);
  assert.equal(h.NanoCpus, 500000000);
  assert.equal(h.PidMode, '');
  assert.equal(h.IpcMode, 'private');
  assert.equal(h.RestartPolicy.Name, 'no');
  assert.deepEqual(h.Binds, [bind + ':/payload:ro']);
  assert(info.Mounts.every(m => m.Type === 'tmpfs' ||
    (m.Type === 'bind' && m.Source === bind && m.Destination === '/payload' && m.RW === false)));
  assert.deepEqual(Object.keys(info.NetworkSettings.Networks), ['none']);
}

export async function replay(c, source, edits, phase) {
  assert(['baseline', 'final', 'reference', 'base'].includes(phase));
  for (const file of Object.keys(edits)) assert(c.writable?.includes(file), 'Unauthorized edits in replay');
  const lease = randomUUID();
  const name = 'brooks-six-' + lease;
  const stage = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'brooks-six-probe-')));
  const results = {phase, image, checkedPolicy: false, cleanupConfirmed: false, checks: null};
  let owned = false;
  const run = (args, ms = 6000) => docker(args, {timeout_ms: ms, max_output_bytes: 65536});
  try {
    fs.chmodSync(stage, 0o755);
    for (const [file, bytes] of Object.entries({...source, ...edits})) {
      assert(/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(file) &&
        file.split('/').every(part => !['.', '..'].includes(part)));
      const dest = path.join(stage, 'workspace', file);
      fs.mkdirSync(path.dirname(dest), {recursive: true, mode: 0o755});
      fs.writeFileSync(dest, bytes, {mode: 0o444});
    }
    fs.writeFileSync(path.join(stage, 'oracle.mjs'), c.oracle, {mode: 0o444});
    const created = await run(['create', '--name', name, '--label', label + '=' + lease,
      '--network', 'none', '--ipc', 'private', '--read-only', '--user', '1000:1000',
      '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--pids-limit', '32',
      '--memory', '128m', '--memory-swap', '128m', '--cpus', '0.5', '--restart', 'no',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=8m,mode=1777', '--volume', stage + ':/payload:ro',
      '--entrypoint', '/usr/local/bin/node', image, '/payload/oracle.mjs', '/payload/workspace', phase]);
    const inspected = await run(['inspect', name]);
    assert.equal(inspected.code, 0, 'Oracle container inspection failed');
    const [info] = JSON.parse(output(inspected));
    owned = info.Config.Labels[label] === lease;
    assert.equal(created.code, 0, 'Oracle container creation failed');
    checkPolicy(info, name, lease, stage);
    results.checkedPolicy = true;
    const executed = await run(['start', '--attach', name]);
    results.exitCode = executed.code;
    results.reason = executed.reason;
    results.stdout = output(executed);
    results.stderr = output(executed, 'stderr');
    if (executed.code === 0 && !executed.reason) {
      const payload = JSON.parse(results.stdout);
      assert.deepEqual(Object.keys(payload), ['checks']);
      assert(payload.checks && Object.entries(payload.checks).every(([id, value]) =>
        c.checks.some(check => check.id === id) && typeof value === 'boolean'), 'Invalid oracle checks');
      results.checks = payload.checks;
    }
  } catch (e) {
    results.error = String(e.message);
  } finally {
    try {
      if (!owned) {
        const recovered = await run(['inspect', name]);
        if (recovered.code === 0)
          owned = JSON.parse(output(recovered))[0].Config.Labels[label] === lease;
      }
      if (owned) await run(['rm', '-f', name]);
      const confirmed = await run(['inspect', name]);
      results.cleanupConfirmed = confirmed.code !== 0 && !confirmed.reason &&
        /No such (object|container)/i.test(output(confirmed, 'stderr'));
    } finally {
      fs.rmSync(stage, {recursive: true, force: true});
    }
  }
  return results;
}
