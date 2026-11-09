import subprocess,json,datetime,pathlib,hashlib,sys
root=pathlib.Path(sys.argv[1]);root.mkdir(parents=True,exist_ok=True);name=sys.argv[2];args=sys.argv[3:]
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
try:
 p=subprocess.run(args,capture_output=True,timeout=240);out,err,code=p.stdout,p.stderr,p.returncode
except subprocess.TimeoutExpired as e:out,err,code=e.stdout or b'',e.stderr or b'',None
for ext,b in [('stdout.bin',out),('stderr.bin',err)]: (root/(name+'.'+ext)).write_bytes(b)
(root/(name+'.json')).write_text(json.dumps(dict(argv=args,start=start,end=datetime.datetime.now(datetime.timezone.utc).isoformat(),exit_code=code,stdout_sha256=hashlib.sha256(out).hexdigest(),stderr_sha256=hashlib.sha256(err).hexdigest()),indent=2)+'\n')
print(name,code,out.decode(errors='replace')[-2000:],err.decode(errors='replace')[-2000:])
sys.exit(0 if code==0 else 1)
