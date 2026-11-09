from pathlib import Path
import json,re,datetime,hashlib
root=Path('docs/research/runtime-preparations/2026-11-09-hc-executor-completion')
gate=json.loads((root/'qa-logs/gate.json').read_text());assert len(gate['commands'])==16 and all(x['exit_code']==0 for x in gate['commands'])
test=(root/'qa-logs/test.stdout.log').read_text();prepared=(root/'qa-logs/prepared.stdout.log').read_text();assert 'tests 553' in test and 'fail 0' in test and 'skipped 0' in test;assert 'tests 195' in prepared and 'fail 0' in prepared and 'skipped 0' in prepared
fix=json.loads((root/'qa-logs/final-file-repair-checks.json').read_text());assert fix['qa1_finding_resolved'] and fix['source_sha256']=='261456881cb231a0d3525f2c40db68f3c9a59f93164b6f1a40dd6100d64f19b4'
logs={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((root/'qa-logs').rglob('*')) if p.is_file()}
record={'revision':1,'qa_round':2,'checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verdict':'PASS','findings':[],'live_models_run':False,'actual_codex_launched_by_qa':False,'model_calls':0,'source_sha256':fix['source_sha256'],'automated_gate':gate,'independent_checks':json.loads((root/'qa-logs/independent-checks.json').read_text()),'qa1_resolution':{'original_verdict':'FAIL','original_source_sha256':'d2e3c21354e2df34bcb3fb35c627b55d0d075ba31b31f09ab21af6ba11fa4338','preserved_inventory':'qa-round1-failure/inventory.json','preserved_files':90,'finding':'Final-file FIFO open/read boundedness at originalcore:100','resolved':True,'mechanism':'Nonblocking/no-follow open; descriptor regular-file check; at most initial stat<=2MiB bytes and128readcalls; shortread and changedstat failclosed; explicit importerrors remain ineligible.','independent_repair_checks':'qa-logs/final-file-repair-checks.json','fifo_control':next(x for x in fix['results'] if x['case']=='fifo-without-writer'),'limits':'Bounded local file import work, not an OS disk quota or hard realtime filesystem deadline.'},'study_scope':{'native_cli_observations':128,'original_fixed_node_controls':4,'scheduled_protocol_completions':81,'canonical_model_turns_not_run':81,'model_study_eligible_turns':0,'semantic_reviews':0,'actual_responding_model':None,'live_ready':False,'additional_file_only_verification_children_excluded_from_original_collection_count':True,'native_concurrent_pair':'Same finaltext, separate public requestheaders/proxies and SSEIDs; evidence limited to request routing/budget, not arbitrary response-callback authentication.'},'capture_scope':'Rawprefixes exact; discarded observedsuffix hashes are parent reports without retainedsuffix bytes. Parsed HTTP header arrays are not TCPwire capture.','log_custody':'All rawlogs use a narrow archive-only -text -whitespace attribute. *.log is repository-ignored; root must force-stage every task-owned archive log and verify index bytes before push. QA does not stage/commit.','logs_sha256':logs,'release_or_trigger_audit_required':False}
(root/'qa-verification.json').write_text(json.dumps(record,indent=2)+'\n')
Path('_workspace/brooks-harness/qa-report.md').write_text('''# Executor completion — QA round2 PASS

No remaining findings. The single QA1 final-file boundedness defect is resolved.
QA1 FAIL, all90original QA/author/source files and1512msFIFO reproduction remain
exactly preserved in `qa-round1-failure/`.

## Repair verification

Current `captureFinalFile` uses nonblocking/no-follow descriptor opening before
regular-file validation. Reads stop at the initial safe size<=2MiB, at most128
readcalls; shortread and size/time change refuse import. Explicit errors cannot
be promoted by otherwise matching successful output. This bounds local import
work, not OS disk writes or hard realtime filesystem latency.

Independent current-export checks: FIFO withoutwriter returns with0reads under
a1500ms child watchdog; exact2MiB uses128reads; oversize refuses withoutreads;
poststatgrowth reads only8originalbytes; shrink reads1byte/1call; symlink and
directory refuse with0reads. Eleven launch/import mutations are refused at both
standalone import and archive-record boundaries. No actualCodex/model launched.

## Gate and cross-artifact checks

All16offlinecommands PASS. Counts:222helper+6provider+553main unitchecks;195prepared;
21focusednewchecks included;64structuralevals;30parserreports;7Codexofflinefixtures.
All old/newarchive validators and runtime43 structural preparation pass.

Independently compared4manifests,6READMEbadges,JSON-LD,CHANGELOG,AGENTS/GEMINI,
derived12books,64evals and6negative skillboundaries at1.9.1.1082existingresearch
files unchanged; prospectiveREADME append-only. All132originalrawrecords,840binary
attributes and narrowrawlog attributes checked. All132recordedownedgroups absent.
Two fullypaginatedDiscussion snapshots retain5maintainercomments/0replies; no
message sent and nohumanvalidation/liveauthorization inferred.

All22priorinventoryitems accountedfor with scoped/blocked/unverified status.
81/81native protocol turns complete, but all81canonicalmodelrows remainnot-run,
0studyeligible,0semanticreviews and modelidentitynull/live_readyfalse. The native
concurrentpair sharesfinaltext: it supports request-routing/budget separation,
not arbitraryresponse-callback authentication. Sharedtoolbrokerauthority and
hostiledetachedcontainment remain explicit designblockers.

## Evidence and handoff

Final `qa-verification.json` and `qa-logs/` retain rawgate output, independentchecks,
processsnapshot, mutationresults and repairedFIFO/fileedge checks. Rawcapturedlogs
retain originalwhitespace through narrowattributes; root must explicitly force-add
all task-owned ignored*.logfiles and verify index bytes for freshclone reproducibility.
No source/native evidence changes, commit, push, release or realmodel evaluation
byQA. Ready for root to commit/push after its final index/custody check.
''')
print(json.dumps({'verdict':record['verdict'],'qa_round':2,'automated_commands':len(gate['commands']),'fifo_elapsed_ms':record['qa1_resolution']['fifo_control']['elapsed_ms'],'source_sha256':record['source_sha256'],'findings':0}))
