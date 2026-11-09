/** Offline planning inventory, never a tokenizer, executor or authorization gate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {turnInputs,validateResponses} from '../../../../evals/research/runtime/prospective/study.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const prior=path.resolve(here,'../2026-11-06-hc-human-review');
const read=name=>fs.readFileSync(path.join(prior,name));
const sha=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(read('plan.json'));
const anchor=JSON.parse(read('freeze-anchor.json'));
assert.equal(anchor.study_sha256,'bade5c6cc86db0ea02dd32d6f22adb970374db427d757a4a3535258eb912996b');
assert.equal(sha(read('artifacts.sha256.json')),anchor.inventory_file_sha256);
const responses=JSON.parse(read('responses-template.json'));
validateResponses(plan,responses,anchor.study_sha256);
assert.equal(responses.records.length,81);
assert(responses.records.every(r=>r.execution_status==='not-run'));
const rows=[];
for(const c of plan.study.cases)for(const arm of ['A','B','C']){
 const packet=turnInputs(plan,{case_id:c.id,repetition:1,arm},anchor.study_sha256);
 const bytes=Buffer.from(JSON.stringify(packet));
 rows.push({case_id:c.id,arm,packet_json_utf8_bytes:bytes.length,packet_sha256:sha(bytes),input_files:packet.inputs.length,guidance_files:packet.guidance.length});
}
const report={revision:1,status:'offline-planning-only',model_requests:0,live_authorized:false,live_ready:false,study_sha256:anchor.study_sha256,canonical_not_run_records:81,distinct_case_arm_packets:rows.length,limitations:'Serialized whitelist packets only: not actual model prompts, not token counts, excludes native instructions/tool schemas/continuation history; files may be staged rather than pasted.',rows,smoke_budget_arithmetic:{max_dispatches:6,max_input_tokens_per_dispatch:32768,max_output_tokens_per_dispatch:4096,standard_input_usd_per_million:0.10,standard_output_usd_per_million:0.50,uncached_scenario_usd:6*(32768*.10+4096*.50)/1e6,conservative_input_allowance_usd_per_million:.35,conservative_scenario_usd:6*(32768*.35+4096*.50)/1e6,proposed_reservation_ceiling_usd:.10,enforced_live_cap:false}};
const output=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--check')){
 assert.equal(fs.readFileSync(path.join(here,'offline-inventory.json'),'utf8'),output);
 console.log('PASS: 27 material packets, 81 unchanged not-run records, proposed budget arithmetic; no model request.');
}else process.stdout.write(output);
