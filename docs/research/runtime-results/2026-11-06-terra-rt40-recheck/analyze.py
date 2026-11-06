#!/usr/bin/env python3
"""Verify RT-40 reassessment evidence and reproduce post-hoc sensitivity counts."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
source = root.parent / '2026-11-06-terra-dispute'
review = json.loads((root / 'adjudication.json').read_text())
frozen = json.loads(subprocess.check_output([sys.executable, str(source / 'analyze.py')]))
assert frozen == json.loads((source / 'metrics.json').read_text())
digests = json.loads((source / 'digests.json').read_text())
for case, digest in digests.items():
    assert hashlib.sha256((source / case / 'results.json').read_bytes()).hexdigest() == digest['results_sha256']
records = json.loads((source / 'RT-40/results.json').read_text())['records']
assert len(records) == len(review['responses']) == 9
for response in review['responses']:
    record = next(r for r in records if r['arm'] == response['arm'] and r['repetition'] == response['repetition'])
    assert record['status'] == 'executed'
    assert hashlib.sha256(record['answer'].encode()).hexdigest() == response['answer_sha256'] == record['answer_sha256']
    assert response['assessment'] == 'unresolved'
    for quote in response['quotes']:
        assert quote in record['answer']
assert {(r['arm'], r['repetition']) for r in review['responses'] if not r['explicit_contract_judgments']} == {('A', 2), ('B', 1), ('C', 3)}
by_key = {(r['arm'], r['repetition']): r for r in review['responses']}
paired_rows = [r for r in frozen['rows'] if not (r['case'] == 'RT-41' and r['rep'] == 3)]
assert len(paired_rows) == 51
out = {'scope': 'Post-hoc RT-40 sensitivities, not a replacement for the frozen primary results; other case judgments unchanged.', 'rt40_responses': 9, 'rt40_correct_unresolved_assessments': 9, 'paired_triplets': 17, 'scenarios': {}}
for name in ['frozen_primary', 'uniform_explicit_evidence', 'rt40_diagnosis_only']:
    totals = {}
    for arm in 'ABC':
        rows = [r for r in paired_rows if r['arm'] == arm]
        correct = 0
        for row in rows:
            verdict = row['correct']
            if row['case'] == 'RT-40' and name != 'frozen_primary':
                verdict = name == 'rt40_diagnosis_only' or by_key[(arm, row['rep'])]['explicit_contract_judgments']
            correct += verdict
        totals[arm] = {'correct': correct, 'total': len(rows), 'accuracy': correct / len(rows), 'missed_defect_samples': sum(r['fn'] for r in rows if r['kind'] == 'defect'), 'defect_samples': sum(r['kind'] == 'defect' for r in rows), 'protected_false_positives': sum(r['fp'] for r in rows if r['kind'] == 'protected'), 'protected_samples': sum(r['kind'] == 'protected' for r in rows)}
    out['scenarios'][name] = totals
assert [out['scenarios']['uniform_explicit_evidence'][a]['correct'] for a in 'ABC'] == [16, 13, 15]
assert [out['scenarios']['rt40_diagnosis_only'][a]['correct'] for a in 'ABC'] == [17, 14, 16]
print(json.dumps(out, indent=2, sort_keys=True))
