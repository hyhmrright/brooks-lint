/** Offline reviewer exchange. Validates supplied labels, never infers semantic truth. */
import assert from 'node:assert/strict';
import { digest, validateResponses, reviewPackets, summarize } from './study.mjs';
const clone = x => structuredClone(x);
const nonempty = x => typeof x === 'string' && x.trim().length > 0;
const exact = (x, keys) => assert.deepEqual(Object.keys(x).sort(), keys.sort(), 'Unexpected fields');
const unique = xs => assert.equal(new Set(xs).size, xs.length, 'Duplicate review identity');
const turnKey = r => `${r.case_id}/${r.repetition}/${r.arm}`;
function bound(plan, source, anchor, sourceDigest) {
  assert(nonempty(anchor) && nonempty(sourceDigest), 'External plan and response digests required');
  validateResponses(plan, source, anchor); assert.equal(digest(source), sourceDigest, 'Source response drift');
  return new Map(source.records.filter(r => r.execution_status === 'executed').map(r => [
    (reviewPackets(plan, { ...source, records: [r] }, anchor).packets[0]).packet_id, r,
  ]));
}
function reviewer(p) { exact(p, ['id','method','exposure']); assert(Object.values(p).every(nonempty), 'Reviewer provenance required'); }
export function makeForm(plan, source, anchor, sourceDigest, provenance) {
  const mapping = bound(plan,source,anchor,sourceDigest); reviewer(provenance);
  return { revision:1, plan_sha256:anchor, source_responses_sha256:sourceDigest, masking:'partial only; public inputs and recomputable mapping; no independence or human-review claim', reviewer:clone(provenance), entries:[...mapping].map(([packet_id,r])=>({packet_id,answer_sha256:r.answer_sha256,notes:'',rationale:null,annotation:null})).sort((a,b)=>a.packet_id.localeCompare(b.packet_id)) };
}
export function validateForm(plan,source,anchor,sourceDigest,form) {
  const mapping=bound(plan,source,anchor,sourceDigest);
  exact(form,['revision','plan_sha256','source_responses_sha256','masking','reviewer','entries']); assert.equal(form.revision,1); assert.equal(form.plan_sha256,anchor); assert.equal(form.source_responses_sha256,sourceDigest); assert.equal(form.masking,makeForm(plan,source,anchor,sourceDigest,form.reviewer).masking); reviewer(form.reviewer);
  assert(Array.isArray(form.entries)); unique(form.entries.map(e=>e.packet_id));
  for(const e of form.entries) {
    exact(e,['packet_id','answer_sha256','notes','rationale','annotation']);const r=mapping.get(e.packet_id);assert(r,'Unknown or nonexecuted packet');assert.equal(e.answer_sha256,r.answer_sha256,'Stale answer');assert.equal(typeof e.notes,'string');
    if(e.annotation===null){assert.equal(e.rationale,null,'Pending rationale belongs in notes');continue;}
    assert(nonempty(e.rationale),'Review rationale required');
    const test={...source,records:[{...r,review:{reviewer:form.reviewer.id,method:form.reviewer.method,exposure:form.reviewer.exposure,rationale:e.rationale,answer_sha256:e.answer_sha256,annotation:e.annotation}}]};validateResponses(plan,test,anchor);
  }
  return form;
}
/** Arrays are sets under this annotation schema; objects normalized by key. */
export function normalize(value) {
  if(Array.isArray(value)) return value.map(normalize).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,normalize(value[k])]));
  return value;
}
export function compareReviews(plan,source,anchor,sourceDigest,forms) {
  assert.equal(forms.length,2,'Exactly two review submissions required');forms.forEach(f=>validateForm(plan,source,anchor,sourceDigest,f)); unique(forms.map(f=>f.reviewer.id));
  const mapping=bound(plan,source,anchor,sourceDigest);
  return { revision:1,plan_sha256:anchor,source_responses_sha256:sourceDigest,form_sha256:forms.map(digest),independent:false,meaning:'Annotation agreement only; no semantic truth, independent or human validation established',entries:[...mapping.keys()].sort().map(packet_id=>{
    const rows=forms.map(f=>f.entries.find(e=>e.packet_id===packet_id));
    if(rows.some(e=>!e||e.annotation===null))return {packet_id,status:'pending',differing_axes:[]};
    const a=rows[0].annotation,b=rows[1].annotation;
    const differing_axes=[...new Set([...Object.keys(a),...Object.keys(b)])].sort().filter(k=>JSON.stringify(normalize(a[k]))!==JSON.stringify(normalize(b[k])));
    return {packet_id,status:differing_axes.length?'disagreement':'agreement',differing_axes};
  }) };
}
export function decisionTemplate(plan,source,anchor,sourceDigest,forms,adjudicator) {
  reviewer(adjudicator);const comparison=compareReviews(plan,source,anchor,sourceDigest,forms);
  return {revision:1,plan_sha256:anchor,source_responses_sha256:sourceDigest,form_sha256:forms.map(digest),adjudicator:clone(adjudicator),entries:comparison.entries.filter(e=>e.status!=='agreement').map(e=>({packet_id:e.packet_id,choice:null,rationale:null,quotes:[],annotation:null}))};
}
export function mergeReviews(plan,source,anchor,sourceDigest,forms,decisions=null) {
  const comparison=compareReviews(plan,source,anchor,sourceDigest,forms),mapping=bound(plan,source,anchor,sourceDigest),merged=clone(source),audit=[];
  if(decisions!==null){exact(decisions,['revision','plan_sha256','source_responses_sha256','form_sha256','adjudicator','entries']);assert.equal(decisions.revision,1);assert.equal(decisions.plan_sha256,anchor);assert.equal(decisions.source_responses_sha256,sourceDigest);assert.deepEqual(decisions.form_sha256,forms.map(digest),'Review revision mismatch');reviewer(decisions.adjudicator);assert(Array.isArray(decisions.entries));unique(decisions.entries.map(e=>e.packet_id));for(const e of decisions.entries){exact(e,['packet_id','choice','rationale','quotes','annotation']);assert(comparison.entries.some(c=>c.packet_id===e.packet_id&&c.status!=='agreement'),'Unplanned adjudication');assert(Array.isArray(e.quotes)&&e.quotes.every(q=>nonempty(q)&&mapping.get(e.packet_id).answer.includes(q)),'Adjudication quote drift');if(e.choice===null){assert.equal(e.annotation,null);assert.equal(e.rationale,null);assert.equal(e.quotes.length,0);}else{assert(nonempty(e.rationale));assert(mapping.get(e.packet_id).answer.length===0||e.quotes.length>0,'Adjudication excerpt required');assert(e.choice==='custom'||forms.some(f=>f.reviewer.id===e.choice),'Unknown choice');if(e.choice!=='custom')assert.equal(e.annotation,null);else assert(e.annotation);}}}
  for(const c of comparison.entries){const original=mapping.get(c.packet_id),r=merged.records.find(r=>turnKey(r)===turnKey(original)); const decision=decisions?.entries.find(e=>e.packet_id===c.packet_id&&e.choice!==null);let annotation=null,provenance=null,rationale=null;
    if(c.status==='agreement'){const f=forms[0],e=f.entries.find(e=>e.packet_id===c.packet_id);annotation=e.annotation;provenance={id:forms.map(f=>f.reviewer.id).join(' + '),method:'Agreement of supplied annotations; originals retained in review_revision',exposure:forms.map(f=>f.reviewer.exposure).join(' | ')};rationale=forms.map(f=>f.entries.find(e=>e.packet_id===c.packet_id).rationale).join(' | ');}
    else if(decision){annotation=decision.choice==='custom'?decision.annotation:forms.find(f=>f.reviewer.id===decision.choice).entries.find(e=>e.packet_id===c.packet_id)?.annotation;assert(annotation,'Selected reviewer is pending');provenance=decisions.adjudicator;rationale=decision.rationale;}
    r.review=annotation?{reviewer:provenance.id,method:provenance.method,exposure:provenance.exposure,rationale,answer_sha256:r.answer_sha256,annotation:clone(annotation)}:null;
    audit.push({packet_id:c.packet_id,previous_review:clone(original.review),status:annotation?(c.status==='agreement'?'agreed':'adjudicated'):'pending',decision:decision?clone(decision):null});
  }
  validateResponses(plan,merged,anchor);
  return {revision:1,independent:false,source_responses_sha256:sourceDigest,review_revision:{forms:clone(forms),decisions:clone(decisions),comparison,audit},responses:merged,summary:summarize(plan,merged,anchor)};
}
