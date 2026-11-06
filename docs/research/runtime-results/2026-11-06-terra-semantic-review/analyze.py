#!/usr/bin/env python3
"""Recompute descriptive metrics from frozen model judgments and saved records."""
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
read = lambda path: json.loads(path.read_text())
judgments = read(HERE / 'judgments.json')
by_id = {j['packet_id']: j for j in judgments}
assert len(judgments) == len(by_id) == 123
cases = {c['id']: c for c in read(ROOT / 'evals/research/runtime/cases.json')['cases']}
original = read(HERE.parent / '2026-11-06-terra-37/results.json')
recovery = [read(p) for p in sorted((HERE.parent / '2026-11-06-terra-recovery').glob('RT-*/results.json'))]

def rows_for(run):
    result = []
    for record in run['records']:
        if record['status'] != 'executed':
            continue
        pid = hashlib.sha256(f"{run['plan']['study_sha256']}/{record['case_id']}/{record['repetition']}/{record['arm']}".encode()).hexdigest()[:24]
        j = by_id[pid]
        assert j['answer_sha256'] == record['answer_sha256']
        result.append({'case': record['case_id'], 'arm': record['arm'], 'kind': cases[record['case_id']]['kind'], 'judgment': j})
    return result

def classify(row):
    j, kind = row['judgment'], row['kind']
    fs = j['findings']
    uncertain = any(f['support'] == 'uncertain' for f in fs)
    fp = any(f['support'] == 'unsupported' for f in fs) or j['unsupported_certainty']
    expected = {'defect':'defect', 'protected':'protected', 'unresolved':'unresolved', 'non-trigger':'explanation'}[kind]
    # Mismatch based on a disputed finding remains disputed, not definitively wrong.
    mismatch = j['assessment'] != expected
    firm_bad_finding = any(f['support'] == 'supported' and (not f['evidence_complete'] or f['severity_ok'] is False) for f in fs)
    definite_bad = (not j['completed'] or fp or j['unsolicited_audit'] or firm_bad_finding or
                    (bool(j['missing_expected_ids']) and not uncertain) or (mismatch and not uncertain))
    status = 'incorrect' if definite_bad else ('indeterminate' if uncertain else 'correct')
    fp_status = 'yes' if fp else ('indeterminate' if uncertain else 'no')
    fn_status = ('indeterminate' if uncertain else 'yes') if j['missing_expected_ids'] else 'no'
    return status, fp_status, fn_status

def summarize(rows):
    out = {}
    for arm in 'ABC':
        a = [r for r in rows if r['arm'] == arm]
        findings = [f for r in a for f in r['judgment']['findings']]
        expected = sum(len(read(ROOT / 'evals/research/runtime' / cases[r['case']]['rubric'])['expectedFindings']) for r in a)
        missing = sum(len(r['judgment']['missing_expected_ids']) for r in a)
        out[arm] = {'total':len(a), 'by_kind':dict(Counter(r['kind'] for r in a)),
                    'case_correctness':dict(Counter(classify(r)[0] for r in a)),
                    'false_positives_all':dict(Counter(classify(r)[1] for r in a)),
                    'protected_false_positives':dict(Counter(classify(r)[1] for r in a if r['kind']=='protected')),
                    'false_negatives_defect':dict(Counter(classify(r)[2] for r in a if r['kind']=='defect')),
                    'expected_issues':expected, 'matched_issues':expected-missing, 'missing_issues':missing,
                    'uncertain_findings':sum(f['support']=='uncertain' for f in findings),
                    'severity_unspecified_findings':sum(f['severity']=='unspecified' for f in findings),
                    'uncertain_cases':[r['case'] for r in a if classify(r)[0]=='indeterminate'],
                    'incorrect_cases':[r['case'] for r in a if classify(r)[0]=='incorrect'],
                    'unsupported_certainty':sum(r['judgment']['unsupported_certainty'] for r in a),
                    'unsolicited_audit':sum(r['judgment']['unsolicited_audit'] for r in a),
                    'unresolved_correct':sum(r['judgment']['completed'] and r['judgment']['assessment']=='unresolved' and not r['judgment']['unsupported_certainty'] for r in a if r['kind']=='unresolved')}
    return out

original_rows=rows_for(original)
recovery_rows=[r for run in recovery for r in rows_for(run)]
assert len(original_rows)==102 and len(recovery_rows)==21
counts=Counter(r['case'] for r in original_rows)
paired=[r for r in original_rows if counts[r['case']]==3]
assert len(paired)==90

def discordant(rows):
    groups=defaultdict(dict)
    for r in rows: groups[r['case']][r['arm']]=classify(r)[0]
    return {case: x for case,x in sorted(groups.items()) if x.get('B') != x.get('C')}
output={'original_complete_triplets':summarize(paired), 'original_all_executed_individual':summarize(original_rows),
        'recovery_complete_triplets':summarize(recovery_rows),
        'original_B_C_discordance':discordant(paired), 'recovery_B_C_discordance':discordant(recovery_rows)}
print(json.dumps(output,indent=2,sort_keys=True))
