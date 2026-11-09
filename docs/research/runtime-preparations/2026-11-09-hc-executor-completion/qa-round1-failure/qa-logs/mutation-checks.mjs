import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {frozenDesign} from '../../../../../evals/research/runtime/prospective/executor-preparation.mjs';
import {importRehearsal} from '../../../../../evals/research/runtime/prospective/executor-completion.mjs';
import {validateRecord,ARCHIVE} from '../../../../../evals/research/runtime/prospective/executor-completion-drill.mjs';
import {hash} from '../../../../../evals/research/runtime/prospective/codex-channel.mjs';
const sample=JSON.parse(readFileSync(path.join(ARCHIVE,'schedule/schedule-001/record.json')));
const design=frozenDesign();
const mutations=[
 ['auth-environment',r=>r.launch.env.OPENAI_API_KEY='PUBLIC_QA_MUTATION_NOT_A_CREDENTIAL'],
 ['broad-network-policy',r=>{r.launch.policy_text+='(allow network*)\n';r.launch.policy_sha256=hash(r.launch.policy_text);}],
 ['inner-sandbox-mode',r=>r.declaration.argv[r.declaration.argv.indexOf('-s')+1]='danger-full-access'],
 ['request-model-with-rehashed-body',r=>{const q=r.http.requests[0];const b=JSON.parse(Buffer.from(q.body_base64,'base64'));b.model='other-model';const bytes=Buffer.from(JSON.stringify(b));q.body_base64=bytes.toString('base64');q.body_sha256=hash(bytes);q.observed_sha256=hash(bytes);q.retained_bytes=q.observed_bytes=bytes.length;}],
 ['capture-policy-limit',r=>r.execution.captures.stdout.limit++],
 ['turn-token',r=>r.binding.token='PUBLIC-TURN-OTHER'],
 ['unclosed-stdio',r=>r.execution.closed_stdio=false],
 ['unconfirmed-cleanup',r=>r.execution.cleanup.confirmed=false],
 ['missing-response-evidence',r=>r.http.responses=[]],
 ['final-bytes-mismatch',r=>r.final_message.base64=Buffer.from('OTHER').toString('base64')],
 ['simulation-promotion',r=>r.simulation=false]
];
const rows=[];
for(const [name,mutate]of mutations){const r=structuredClone(sample);mutate(r);let imported=false,archive=false;try{importRehearsal(design,[r]);}catch{imported=true;}try{validateRecord(r,{binary:r.launch.binary});}catch{archive=true;}assert(imported&&archive,name);rows.push({name,standalone_import_refused:imported,archive_record_refused:archive});}
const result={offline:true,native_cli_launched:false,model_calls:0,mutations:rows};
console.log(JSON.stringify(result,null,2));
