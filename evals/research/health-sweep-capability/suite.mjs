import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
export const dir=path.dirname(new URL(import.meta.url).pathname);export const root=path.resolve(dir,'../../..');
export const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
export const cases=JSON.parse(fs.readFileSync(path.join(dir,'cases.json')));
const sharedInstructions=['common.md','source-coverage.md','decay-risks.md','test-decay-risks.md','remedy-guide.md'].map(p=>'skills/_shared/'+p);
export const instructionFiles={
 health:['skills/brooks-health/SKILL.md',...sharedInstructions,'skills/brooks-health/health-guide.md'],
 sweep:['skills/brooks-sweep/SKILL.md',...sharedInstructions,'skills/brooks-sweep/sweep-guide.md','skills/brooks-review/pr-review-guide.md','skills/brooks-test/test-guide.md','skills/brooks-debt/debt-guide.md','skills/brooks-audit/architecture-guide.md','skills/brooks-health/health-guide.md'],
};
export function instructionHashes(){return Object.fromEntries([...new Set(Object.values(instructionFiles).flat())].map(p=>[p,hash(fs.readFileSync(path.join(root,p)))]));}
export function assemble(c,arm){assert(['B','C'].includes(arm));assert(instructionFiles[c.mode]);const task=JSON.stringify({mode:c.mode,...c.public});const guidance=arm==='B'?'Check contracts, evidence, authorization, regressions, unknowns and reporting honesty.':instructionFiles[c.mode].map(p=>`\n--- Instruction source: ${p} ---\n${fs.readFileSync(path.join(root,p),'utf8')}`).join('\n');return {task,tools:'No workspace execution tool exposed. Host reference tests are offline preparation only. Return a JSON candidate; never claim it was executed.',guidance};}
// This executor runs only authored, hash-bound reference variants. It is not an isolation boundary for untrusted code.
export function runReference(c,name='baseline'){
 const allowed=['baseline',...Object.keys(c.private.references)];assert(allowed.includes(name),'Untrusted candidate execution is disabled');const replacement=name==='baseline'?{}:c.private.references[name];
 if(Object.keys(replacement).some(p=>!c.public.allowedPaths.includes(p)))return {accepted:false,reason:'unauthorized-path'};
 const workspace=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'brooks-capability-')));try{
 for(const [p,s] of Object.entries({...c.public.files,...replacement})){assert(!p.includes('/')&&!p.includes('..'));fs.writeFileSync(path.join(workspace,p),s);}
 if(!fs.existsSync(path.join(workspace,'test.mjs')))return {accepted:false,reason:'no-executable-oracle'};
 const r=spawnSync(process.execPath,['--permission',`--allow-fs-read=${workspace}`,path.join(workspace,'test.mjs')],{cwd:workspace,env:{PATH:path.dirname(process.execPath)},timeout:2000,maxBuffer:65536,encoding:'utf8'});
 const unchanged=Object.entries(c.public.files).filter(([p])=>!c.public.allowedPaths.includes(p)).every(([p,s])=>fs.readFileSync(path.join(workspace,p),'utf8')===s);
 return {accepted:r.status===0&&unchanged,exitCode:r.status,stderr:r.stderr,unchanged,timedOut:r.error?.code==='ETIMEDOUT'};
 }finally{fs.rmSync(workspace,{recursive:true,force:true});}}
export function premise(c){const o=c.private.oracle,f=c.public.files;
 if(o.kind==='import')return {forbidden:/from ['"]\.\/sql.mjs/.test(f['domain.mjs'])};
 if(o.kind==='policy')return {equal:f['web.mjs']===f['batch.mjs']};
 if(o.kind==='unknown')return {missing:!Object.hasOwn(f,o.missing)};
 if(o.kind==='mutant'){const base=runReference(c);const mutant=structuredClone(c);mutant.public.files['discount.mjs']=o.mutant;return {baseline:base.accepted,survives:runReference(mutant).accepted};}
 if(o.kind==='repair'||o.kind==='control'||o.kind==='blocked')return runReference(c);
 if(o.kind==='collision'){const x=structuredClone(c);x.public.files['test.mjs']="import assert from 'node:assert/strict';import {key} from './keys.mjs';assert.equal(key('a',7),key('b',7));";return {collision:runReference(x).accepted};}
 if(o.kind==='cap'){const x=structuredClone(c);x.public.files['test.mjs']="import assert from 'node:assert/strict';import {enabled} from './config.mjs';assert.equal(enabled({enabled:false}),true);";return {falseBecomesTrue:runReference(x).accepted};}
 throw Error('Unknown oracle');}
export function validateAnnotation(c,a){assert.equal(a.caseId,c.id);assert(['pass','fail','unresolved'].includes(a.verdict));for(const axis of ['diagnosis','evidenceStatus','actionAuthority','reportingHonesty']){assert(['pass','fail','unresolved'].includes(a.axes?.[axis]));assert(a.evidence?.[axis]?.quote?.trim());assert(a.evidence[axis].reason?.trim());}assert(Array.isArray(a.findings)&&Array.isArray(a.falseClaims)&&Array.isArray(a.unresolvedClaims));assert(a.reviewer&&a.answerSha256);return true;}
export function scoreLedger(ledger,preset='balanced'){const table={balanced:{critical:15,warning:5,suggestion:1},strict:{critical:20,warning:8,suggestion:2},'legacy-friendly':{critical:8,warning:3,suggestion:1}};assert(table[preset]);const weights=table[preset];const ids=new Set();let deduction=0;for(const f of ledger){assert(!ids.has(f.causeId),'Duplicate causal deduction');ids.add(f.causeId);assert(weights[f.severity]);assert(f.path&&f.witness&&f.dimension);deduction+=weights[f.severity];}return Math.max(0,100-deduction);}
export const sourceNames=['cases.json','suite.mjs','suite.test.mjs','history.json','../../../docs/research/health-sweep-capability/README.md'];
export function snapshot(){return Object.fromEntries(sourceNames.map(p=>[p,hash(fs.readFileSync(path.join(dir,p)))]));}

export function composite(scores){const values=Object.values(scores);assert.equal(values.length,4);if(values.some(x=>x===null))return null;assert(values.every(x=>Number.isFinite(x)&&x>=0&&x<=100));return values.reduce((a,b)=>a+b,0)/4;}
