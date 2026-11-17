import assert from 'node:assert/strict';
import { finalizeDashboard, verifyDashboard } from '../../../skills/brooks-health/scripts/score-dashboard.mjs';

const fields = {
  list: ['action'], read: ['action', 'path'], diff: ['action'],
  write: ['action', 'path', 'text'], score: ['action', 'ledger', 'draft'],
};
const requiredFiles = ['report.md', 'ledger.json', 'receipt.json'];

export function createWorkspace(c, tree, base = null) {
  const original = new Map(Object.entries(tree));
  const current = new Map(original);
  const allowed = new Set(c.writable ?? []);
  const edits = new Map();
  let latest = null;
  const actions = ['list', 'read', ...(base ? ['diff'] : []), ...(allowed.size ? ['write'] : []),
    ...(['health','sweep'].includes(c.skill) ? ['score'] : [])];
  const spec = {
    name: 'benchmark_workspace',
    description: 'Inspect this task repository. list returns current paths. read accepts a path and optional revision (current or base). diff lists files changed from base. write replaces full text for a task-authorized path. score finalizes a Health draft containing the BROOKS_HEALTH_SCORE placeholder with one ledger and returns report and receipt. Tools operate only inside the virtual repository. Model-authored source is never executed here.',
    inputSchema: {type: 'object', additionalProperties: false, required: ['action'],
      properties: {action: {enum: actions}, path: {type: 'string'}, revision: {enum: ['base', 'current']},
        text: {type: 'string'}, ledger: {type: 'object'}, draft: {type: 'string'}}},
  };
  function call(args) {
    assert(args && typeof args === 'object' && !Array.isArray(args), 'Object arguments required');
    assert(Buffer.byteLength(JSON.stringify(args)) <= 65_536, 'Tool payload too large');
    const {action, path, revision, text, ledger, draft} = args;
    assert(actions.includes(action), 'Unavailable repository operation');
    assert(fields[action].every(key => Object.hasOwn(args, key)), 'Missing repository argument');
    assert(Object.keys(args).every(key => fields[action].includes(key) ||
      (action === 'read' && key === 'revision')), 'Unexpected repository argument');
    if (action === 'list') return {paths: [...current.keys()].sort()};
    if (action === 'read') {
      assert(revision === undefined || ['current', 'base'].includes(revision), 'Invalid revision');
      const contents = revision === 'base' ? (base && Object.hasOwn(base, path) ? base[path] : undefined) : current.get(path);
      assert(typeof contents === 'string', 'Repository file not found');
      return {path, revision: revision ?? 'current', text: contents};
    }
    if (action === 'diff') {
      const names = [...new Set([...Object.keys(base), ...original.keys()])].sort();
      return {changed: names.filter(p => base[p] !== original.get(p)).map(p =>
        ({path: p, status: !Object.hasOwn(base,p) ? 'added' : original.has(p) ? 'modified' : 'deleted'}))};
    }
    if (action === 'write') {
      assert(allowed.has(path), 'Write outside task authorization');
      assert(typeof text === 'string' && Buffer.byteLength(text) <= 24_000, 'Invalid file content');
      current.set(path, text);
      if (original.get(path) === text) edits.delete(path);
      else edits.set(path, text);
      return {path, written: true};
    }
    assert(typeof draft === 'string');
    const report = finalizeDashboard(ledger, draft);
    const receipt = verifyDashboard(ledger, report);
    assert.equal(receipt.valid, true);
    latest = {report, receipt, ledger: structuredClone(ledger)};
    return {report, receipt};
  }
  return {spec, call, snapshot: () => ({edits: Object.fromEntries(edits), latest})};
}

export function verifyHealth(snapshot) {
  const {edits, latest} = snapshot;
  if (!latest || !requiredFiles.every(file => Object.hasOwn(edits, file))) return false;
  try {
    assert.deepEqual(JSON.parse(edits['ledger.json']), latest.ledger);
    assert.deepEqual(JSON.parse(edits['receipt.json']), latest.receipt);
    assert.equal(edits['report.md'], latest.report);
    assert.deepEqual(verifyDashboard(latest.ledger, latest.report), latest.receipt);
    return true;
  } catch {
    return false;
  }
}
