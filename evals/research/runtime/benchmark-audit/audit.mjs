import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = file => JSON.parse(readFileSync(file, 'utf8'));
export function audit() {
  const root = path.join(here, '../hard-benchmark');
  const manifest = json(path.join(root, 'cases.json'));
  const cases = manifest.cases.map(c => {
    const sources = c.inputs.filter(p => p.endsWith('.mjs'));
    const rubric = json(path.join(root, c.rubric));
    return { id: c.id, family: c.family, kind: c.kind, split: c.split,
      sourceFiles: sources.length,
      sourceLines: sources.reduce((n, p) => n + readFileSync(path.join(root, p), 'utf8').trimEnd().split('\n').length, 0),
      inputBytes: c.inputs.reduce((n, p) => n + readFileSync(path.join(root, p)).length, 0),
      expectedIssues: rubric.expectedFindings.length,
      humanReview: rubric.humanReview, bookMapping: rubric.bookMapping };
  });
  const upstream = path.join(here, 'upstream');
  const external = [];
  const files = readdirSync(upstream).sort().map(name => {
    const bytes = readFileSync(path.join(upstream, name));
    if (name.endsWith('.json')) {
      for (const [index, row] of JSON.parse(bytes).entries()) {
        external.push({ id: `${name.slice(0, -5)}-${index + 1}`, project: name.slice(0, -5),
          url: row.url, originalUrl: row.original_url ?? null,
          upstreamNote: row.az_comment ?? null,
          labels: row.comments.map(c => ({ category: c.category, severity: c.severity })),
          status: 'quarantined-candidate', runnable: false,
          missing: ['verified-reviewed-revision', 'licensed-input-bundle', 'contract-and-label-review', 'reproduction-or-independent-adjudication'] });
      }
    }
    return { path: `upstream/${name}`, sha256: hash(bytes), bytes: bytes.length };
  });
  const counts = values => Object.fromEntries([...new Set(values)].sort().map(v => [v, values.filter(x => x === v).length]));
  return { revision: 1, date: '2026-11-10', liveModelsRun: false,
    existing: { freezeSha256: hash(readFileSync(path.join(root, 'freeze.json'))),
      familyCount: manifest.families.length, cases,
      totals: { cases: cases.length, kinds: counts(cases.map(c => c.kind)),
        minSourceLines: Math.min(...cases.map(c => c.sourceLines)), maxSourceLines: Math.max(...cases.map(c => c.sourceLines)),
        defectsWithMultipleIssues: cases.filter(c => c.kind === 'defect' && c.expectedIssues > 1).length },
      empiricalDifficulty: 'unmeasured; historical HC results are not HB results' },
    external: { repository: 'https://github.com/withmartian/code-review-benchmark',
      commit: 'e616e849755441da38f18bf3adba2c9583b03803', license: 'MIT; upstream/LICENSE', files,
      candidateCount: external.length, labelCount: external.reduce((n, c) => n + c.labels.length, 0),
      categories: counts(external.flatMap(c => c.labels.map(l => l.category))),
      annotatedRevisionWarnings: external.filter(c => c.upstreamNote).length,
      admittedCount: 0, candidates: external } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(audit(), null, 2)}\n`);
}
