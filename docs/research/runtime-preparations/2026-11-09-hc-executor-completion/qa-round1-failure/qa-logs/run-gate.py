import pathlib,json,subprocess,datetime,hashlib
root=pathlib.Path("docs/research/runtime-preparations/2026-11-09-hc-executor-completion")
commands=[("validate",["run","validate"]),("test",["test"]),("evals",["run","evals"]),("prepared",["run","evals:runtime:prepared"]),("research",["run","evals:runtime:research:validate"]),("drill",["run","evals:runtime:drill"]),("reviews",["run","evals:runtime:reviews:validate"]),("executor",["run","evals:runtime:executor:validate"]),("process",["run","evals:runtime:process:validate"]),("channel",["run","evals:runtime:channel:validate"]),("cli",["run","evals:runtime:cli:validate"]),("stream",["run","evals:runtime:stream:validate"]),("boundaries",["run","evals:runtime:boundaries:validate"]),("completion",["run","evals:runtime:completion:validate"]),("benchmark",["run","benchmark"]),("codex-offline",["run","evals:codex:validate"])]
rows=[]
for name,args in commands:
 start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 r=subprocess.run(["npm",*args],capture_output=True,timeout=180)
 for kind,raw in [("stdout",r.stdout),("stderr",r.stderr)]: (root/"qa-logs"/(name+"."+kind+".log")).write_bytes(raw)
 row={"name":name,"command":["npm",*args],"started_at":start,"completed_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"exit_code":r.returncode,"stdout_sha256":hashlib.sha256(r.stdout).hexdigest(),"stderr_sha256":hashlib.sha256(r.stderr).hexdigest()}
 rows.append(row)
 (root/"qa-logs"/"gate.json").write_text(json.dumps({"offline":True,"model_calls":0,"commands":rows,"all_passed_so_far":all(x["exit_code"]==0 for x in rows)},indent=2)+"\n")
 print(json.dumps({"name":name,"exit_code":r.returncode}),flush=True)
print("FULL_GATE_COMPLETE",flush=True)
