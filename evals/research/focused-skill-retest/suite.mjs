import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {hash,read,write,root} from '../health-sweep-cli169/suite.mjs';
export {hash,read,write,root};
export const directory=path.join(root,'evals/research/focused-skill-retest');
export const budget={calls:36,observedTokens:2000000,totalMs:7200000,turnMs:120000};
export const generic='Inspect supplied contracts before claims. Trace cross-file causes. Distinguish demonstrated defects, justified tradeoffs and missing information. Provide an executable causal witness, an appropriate remedy and its risks. Do not invent absent tests or ownership. For changes preserve unrelated work, record the baseline, obey scope and iteration limits, and verify the result. Calculate scores from one ledger only; do not replace unknown dimensions with perfect scores. Report evidence, uncertainty and verification limits separately.';
export function guidanceFiles(skill){
 return [...fs.readdirSync(path.join(root,'skills/_shared')).filter(p=>p.endsWith('.md')).map(p=>'skills/_shared/'+p),...fs.readdirSync(path.join(root,'skills',skill)).filter(p=>p.endsWith('.md')).map(p=>'skills/'+skill+'/'+p)].sort();
}
export function sources(){
 const old=read(path.join(root,'evals/research/bounded-health-retest/formal-freeze.json'));
 const names=[...Object.keys(old.sources),...['review','audit','test'].flatMap(m=>guidanceFiles('brooks-'+m)),...fs.readdirSync(directory).filter(p=>/\.(mjs|json|cjs)$/.test(p)&&!['freeze.json','anchor.json'].includes(p)).map(p=>'evals/research/focused-skill-retest/'+p),'docs/research/focused-skill-retest/README.md','docs/research/focused-skill-retest/ANALYSIS.md','evals/research/skills-benchmark-v5/public-contract.md'];
 return Object.fromEntries([...new Set(names)].sort().map(p=>[p,hash(fs.readFileSync(path.join(root,p)))]));
}
export function validateCases(cs){
 assert.equal(cs.length,18);assert.equal(new Set(cs.map(c=>c.id)).size,18);
 for(const mode of ['review','audit','test']){const selected=cs.filter(c=>c.mode===mode);assert.equal(selected.length,6);assert.equal(new Set(selected.map(c=>c.family)).size,2);for(const variant of ['defect','protected','unresolved'])assert.equal(selected.filter(c=>c.variant===variant).length,2);}
 for(const c of cs){assert(c.private.taskOutcome);assert(c.private.criteria.length);assert(c.public.files['contract.md']);}
 return true;
}
export function freeze(){
 const old=read(path.join(root,'evals/research/bounded-health-retest/formal-freeze.json'));const cs=read(path.join(directory,'cases.json'));validateCases(cs);
 const common=fs.readFileSync(path.join(root,'evals/research/skills-benchmark-v5/public-contract.md'),'utf8')+'\nThis trial includes only review, audit and test. No tools, delegation or file access are exposed. Return the requested report as text. All runnable witnesses must be labeled predicted unless supplied evidence establishes execution.\n';
 const prior=read(path.join(root,'evals/research/skills-benchmark-v5/prepared-freeze.json'));assert(prior.protocol.cases[0].prompts.B.text.includes(generic),'Generic checklist changed');
 const cases=cs.map(c=>({...c,prompts:Object.fromEntries(['B','C'].map(arm=>{const context=arm==='B'?generic:guidanceFiles(c.skill).map(p=>'FILE '+p+'\n'+fs.readFileSync(path.join(root,p),'utf8')).join('\n\n');const text=common+'\n\n'+context+'\n\n'+Object.entries(c.public.files).map(([p,content])=>'FILE '+p+'\n'+content).join('\n\n');return[arm,{text,sha256:hash(text),bytes:Buffer.byteLength(text)}]}))}));
 const schedule=[];for(const[i,c]of cases.entries())for(const arm of i%2?['C','B']:['B','C'])schedule.push({ordinal:schedule.length+1,id:c.id,arm,repeat:1});
 const body={version:1,stage:'formal',model:'gpt-6.1-terra',effort:'low',cliVersion:'0.169.0',binding:old.binding,budget,cases,schedule,sources:sources(),policy:{automaticRetries:0,stopOnFirstFailure:true,noImplicitResume:true,unknownUsageStops:true,liveAuthorized:false,enableScoreTool:false,independentHoldouts:0,measurement:'18 reused development cases, six families, B/C once',primary:'all substantive axes and expected issues, no unsupported or pending claims',decision:'Per skill C must exceed B task completions with no added false-claim answers or scope/honesty failures. Tie or regression ends this experiment; no automatic expansion or rerun.',limitations:['Static guidance only; no native discovery or autonomous execution.','Changed obligations and scoring forbid direct before-after causal claims.','One response per arm/case; no sampling uncertainty or general superiority claim.','Observed tokens are admission accounting, not billing; a turn can overshoot.']}};
 return {...body,sha256:hash(JSON.stringify(body))};
}
export function validate(f){assert.deepEqual(f,freeze(),'Frozen source/input drift');for(const[p,h]of Object.entries(read(path.join(directory,'history.json'))))assert.equal(hash(fs.readFileSync(path.join(root,p))),h,'Historical drift '+p);return true;}
export function anchored(stage='formal'){assert.equal(stage,'formal');const f=read(path.join(directory,'freeze.json'));validate(f);assert.equal(f.sha256,read(path.join(directory,'anchor.json')).sha256);return f;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv[2]==='freeze'){const f=freeze();write(path.join(directory,'freeze.json'),f);write(path.join(directory,'anchor.json'),{sha256:f.sha256});console.log(f.sha256);}else{const f=anchored();console.log(JSON.stringify({sha256:f.sha256,model:f.model,effort:f.effort,budget:f.budget}));}}
