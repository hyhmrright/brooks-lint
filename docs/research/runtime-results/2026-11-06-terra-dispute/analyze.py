#!/usr/bin/env python3
"""Recompute strict descriptive counts from frozen results and model judgments."""
import hashlib, json
from collections import defaultdict
from pathlib import Path
root=Path(__file__).resolve().parent
rows=[]
for n in range(38,44):
 d=root/f'RT-{n}'
 result=json.loads((d/'results.json').read_text())
 judgments={x['packet_id']:x for x in json.loads((d/'judgments.json').read_text())}
 for rec in result['records']:
  if rec['status']!='executed': continue
  pid=hashlib.sha256(f"{result['plan']['study_sha256']}/{rec['case_id']}/{rec['repetition']}/{rec['arm']}".encode()).hexdigest()[:24]
  j=judgments[pid]; assert j['answer_sha256']==rec['answer_sha256']==hashlib.sha256(rec['answer'].encode()).hexdigest()
  assert j['assessment_quote'] in rec['answer']
  for f in j['findings']: assert f['quote'] in rec['answer']
  kind=result['plan']['study']['cases'][0]['kind']
  unsupported=any(f['support']=='unsupported' for f in j['findings']) or j['unsupported_certainty']
  uncertain=any(f['support']=='uncertain' for f in j['findings'])
  # Both unsupported items are an R6 label and an overall score, not an additional defect assertion.
  fp=j['unsupported_certainty']
  # Unresolved pairwise-interpretation evidence was recorded in the individual rationale.
  incompleteness=any(not f['evidence_complete'] for f in j['findings'] if f['support']=='supported') or 'does not explicitly compare' in j['rationale']
  fn=bool(j['missing_expected_ids'])
  correct=j['completed'] and j['assessment']==kind and not unsupported and not fn and not incompleteness and not j['unsolicited_audit']
  rows.append(dict(case=rec['case_id'],rep=rec['repetition'],arm=rec['arm'],kind=kind,packet_id=pid,correct=correct,strict_correct=correct and not uncertain,fp=fp,unsupported=unsupported,uncertain=uncertain,fn=fn,evidence_incomplete=incompleteness))
assert len(rows)==53 and len({r['packet_id'] for r in rows})==53
key=lambda r:(r['case'],r['rep'])
groups=defaultdict(list)
for r in rows: groups[key(r)].append(r)
paired=[r for r in rows if len(groups[key(r)])==3]
assert len(groups)==18 and len(paired)==51

def summarize(data):
 out={}
 for arm in 'ABC':
  rs=[r for r in data if r['arm']==arm]; defects=[r for r in rs if r['kind']=='defect']; protected=[r for r in rs if r['kind']=='protected']; unresolved=[r for r in rs if r['kind']=='unresolved']
  out[arm]={'total':len(rs),'correct':sum(r['correct'] for r in rs),'sensitivity_correct':sum(r['strict_correct'] for r in rs),'uncertain_output_samples':sum(r['uncertain'] for r in rs),'accuracy':sum(r['correct'] for r in rs)/len(rs) if rs else None,'defect_samples':len(defects),'missed_defect_samples':sum(r['fn'] for r in defects),'protected_samples':len(protected),'protected_false_positives':sum(r['fp'] for r in protected),'all_unsupported_samples':sum(r['unsupported'] for r in rs),'unresolved_samples':len(unresolved),'unresolved_strict_correct':sum(r['correct'] for r in unresolved),'evidence_incomplete':sum(r['evidence_incomplete'] for r in rs)}
 return out
out={'definition':'Primary case correctness requires matching assessment, required evidence including explicit unresolved alternatives, no definite unsupported finding, no missed expected issue, and task completion; noncanonical or absent severity is not penalized.', 'planned_turns':54,'executed':len(rows),'failed':1,'planned_triplets':18,'complete_triplets':17,'excluded_triplet':'RT-41/3: B failed', 'paired':summarize(paired),'individual':summarize(rows),'rows':rows}
print(json.dumps(out,indent=2,sort_keys=True))
