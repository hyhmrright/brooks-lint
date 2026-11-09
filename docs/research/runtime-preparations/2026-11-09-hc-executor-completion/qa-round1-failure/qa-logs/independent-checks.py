import pathlib,json,re,hashlib,subprocess,datetime
P=pathlib.Path
root=P('docs/research/runtime-preparations/2026-11-09-hc-executor-completion')
h=lambda b:hashlib.sha256(b).hexdigest()
load=lambda p:json.loads(P(p).read_bytes())
version=load('package.json')['version'];assert version=='1.9.1'
versions={p:load(p)['version'] for p in ['.claude-plugin/plugin.json','.codex-plugin/plugin.json','gemini-extension.json']}
versions['.claude-plugin/marketplace.json']=load('.claude-plugin/marketplace.json')['plugins'][0]['version'];assert all(v==version for v in versions.values())
readmes=sorted(P('.').glob('README*.md'));assert len(readmes)==6
for p in readmes:assert re.findall(r'badge/version-([^" /]+)-blue.svg',p.read_text())==[version]
ld=[json.loads(m) for m in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>',P('docs/index.html').read_text(),re.S)];assert any(x.get('softwareVersion')==version for x in ld)
assert re.search(r'^## \[([^]]+)\]',P('CHANGELOG.md').read_text(),re.M)[1]==version
fm=P('skills/_shared/source-coverage.md').read_text().split('---',2)[1];books=re.findall(r'^  - (.+)$',fm,re.M);assert len(books)==12
word={12:'twelve'}[len(books)]
for p in ['README.md','AGENTS.md','GEMINI.md']:assert word+' classic engineering books' in P(p).read_text()
evals=load('evals/evals.json')['evals'];assert len(evals)==64
assert re.findall(r'`evals/`: (\d+) scenarios',P('AGENTS.md').read_text())==[str(len(evals))]
skills=sorted(P('skills').glob('*/SKILL.md'));assert len(skills)==6
for p in skills:
 front=p.read_text().split('---',2)[1];desc=front.split('description:',1)[1].split('metadata:',1)[0];assert 'Do NOT trigger for:' in desc
baseline=load(root/'preservation-baseline.json');assert len(baseline['sha256'])==baseline['file_count']==1082
for p,digest in baseline['sha256'].items():assert h(P(p).read_bytes())==digest,p
oldreadme=subprocess.check_output(['git','show',baseline['base_commit']+':evals/research/runtime/prospective/README.md']);assert P('evals/research/runtime/prospective/README.md').read_bytes().startswith(oldreadme)
run=load(root/'run.json');captured=load(root/'collection-phase/run.json');assert captured['receipts']==run['receipts'];assert h((root/'collection-phase/run.json').read_bytes())==run['collection_run_sha256']
for n,digest in run['capture_source_sha256'].items():assert h((root/'collection-phase/source-snapshots'/n).read_bytes())==digest
for n,digest in run['source_sha256'].items():assert h((root/'source-snapshots'/n).read_bytes())==digest==h((P('evals/research/runtime/prospective')/n).read_bytes())
records=sorted(root.rglob('record.json'));assert len(records)==132
native=0;node=0;groups=[]
for p in records:
 r=load(p);e=r['execution'];assert r['model_calls']==0 and r['live_ready'] is False
 if r.get('native_cli') is False:node+=1
 else:native+=1
 assert e['closed_stdio'] is True,p
 for stream in ['stdout','stderr']:assert (p.parent/(stream+'.bin')).read_bytes()==__import__('base64').b64decode(e[stream+'_base64']);assert h((p.parent/(stream+'.bin')).read_bytes())==e[stream+'_sha256']
 if 'guardian_pid' in e:groups.append(e['guardian_pid']);assert e['cleanup']['confirmed']
 else:groups.append(e['pid']);assert e['cleanup']['owned_child_reaped']
 for category,rows in [('cli-request',r.get('http',{}).get('requests',[])),('upstream-request',r.get('http',{}).get('upstreamRequests',[])),('upstream-response',r.get('http',{}).get('responses',[])),('broker-response',r.get('http',{}).get('brokerResponses',[]))]:
  for i,row in enumerate(rows):
   raw=(p.parent/(category+'-'+str(i)+'.body.bin')).read_bytes();assert raw==__import__('base64').b64decode(row['body_base64']);assert h(raw)==row['body_sha256']
assert native==128 and node==4 and len(set(groups))==132
imported=load(root/'rehearsal-import.json');assert imported['protocol_eligible_turns']==81 and imported['model_study_eligible_turns']==0
assert len(imported['responses']['records'])==81 and all(x['execution_status']=='not-run' and x['review'] is None for x in imported['responses']['records'])
prior=load('docs/research/runtime-preparations/2026-11-09-hc-codex-boundaries/remaining-boundaries.json');coverage=load(root/'coverage.json');assert {x['id'] for x in prior['boundaries']}=={x['id'] for x in coverage['boundaries']} and len(coverage['boundaries'])==22
assert all(x['status']!='local-follow-up' for x in coverage['boundaries']);assert load(root/'readiness.json')['ready'] is False
D=P('docs/research/runtime-preparations/2026-11-09-discussion-check-completion')
for check_name,response_name in [('check.json','response.json'),('followup-check.json','followup-response.json')]:
 c=load(D/check_name)
 for n,digest in c['hashes'].items():assert h((D/n).read_bytes())==digest
 ds=load(D/response_name)['data']['repository']['discussion'];cs=ds['comments'];assert cs['totalCount']==len(cs['nodes'])==5 and not cs['pageInfo']['hasNextPage'];assert all(x['author']['login']=='hyhmrright' and x['replies']['totalCount']==len(x['replies']['nodes'])==0 and not x['replies']['pageInfo']['hasNextPage'] for x in cs['nodes']);assert c['sent_any_message'] is False
assert load(D/'self-led-disposition.json')['live_model_execution_authorized'] is False
bins=sorted(root.rglob('*.bin'));assert len(bins)==838
attr=subprocess.run(['git','check-attr','--stdin','binary','text'],input=('\n'.join(str(p) for p in bins)+'\n').encode(),capture_output=True,check=True)
assert len(attr.stdout.splitlines())==2*len(bins)
assert all(x.endswith(b': binary: set') or x.endswith(b': text: unset') for x in attr.stdout.splitlines())
newpaths=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines();whitespace=[]
for f in newpaths:
 if f.endswith('.bin'):continue
 b=P(f).read_bytes()
 for i,line in enumerate(b.splitlines(),1):
  if re.search(rb'[ \t]+$',line):whitespace.append({'file':f,'line':i})
assert not whitespace,whitespace
ps=subprocess.run(['/bin/ps','-g',','.join(str(x) for x in sorted(groups)),'-o','pid=,ppid=,pgid=,stat=,lstart='],capture_output=True,timeout=2)
assert ps.returncode==1 and not ps.stdout and not ps.stderr
processcheck={'checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read-only snapshot of132 recorded owned group IDs only; no signalling and no claim about future hostile descendants','command':['/bin/ps','-g',','.join(str(x) for x in sorted(groups)),'-o','pid=,ppid=,pgid=,stat=,lstart='],'exit_code':ps.returncode,'stdout_base64':__import__('base64').b64encode(ps.stdout).decode(),'stderr_base64':__import__('base64').b64encode(ps.stderr).decode(),'owned_group_count':len(groups),'all_group_ids_absent':True}
(root/'qa-logs/process-check.json').write_text(json.dumps(processcheck,indent=2)+'\n')
result={'checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'version':version,'manifest_versions':versions,'readme_badges':len(readmes),'jsonld_version':version,'changelog_version':version,'derived_books':len(books),'eval_scenarios':len(evals),'skill_negative_boundaries':len(skills),'existing_research_files_unchanged':len(baseline['sha256']),'append_only_readme':True,'raw_records_checked':len(records),'native_cli_records':native,'fixed_node_records':node,'raw_binary_attrs_checked':len(bins),'new_text_whitespace_errors':whitespace,'scheduled_protocol_completions':81,'canonical_model_turns_not_run':81,'study_eligible_turns':0,'prior_inventory_items_accounted_for':22,'fully_paginated_discussion_reads':2,'discussion_maintainer_comments':5,'discussion_replies':0,'owned_groups_absent':132,'scope_note':'Saved evidence/provenance checks pass independently; final verdict also accounts for separately reproduced finalCapture FIFO finding.'}
(root/'qa-logs/independent-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
