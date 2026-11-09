// Local protocol discovery only. No thread/turn and no model inference.
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
fs.mkdirSync('/tmp/executor-home',{recursive:true});fs.mkdirSync('/tmp/client-home',{recursive:true});
const token='PUBLIC_OFFLINE_FIXTURE_TOKEN';
const base={PATH:'/usr/local/bin:/usr/bin:/bin',HOME:'/home/node',NO_PROXY:'*',HTTP_PROXY:'',HTTPS_PROXY:'',ALL_PROXY:''};
const settings=['analytics.enabled=false','otel.exporter="none"','otel.trace_exporter="none"','otel.metrics_exporter="none"','check_for_update_on_startup=false','features.plugins=false','features.apps=false','features.hooks=false','skills.bundled.enabled=false'];
const flags=settings.flatMap(x=>['-c',x]);
const children=[],record={simulation:true,real_model_calls:0,live_ready:false,actual_model:null,requests:[],events:[],stderr:{},argv:{}};
function child(name,args,home){record.argv[name]=args;record.stderr[name]='';const p=spawn('codex',args,{env:{...base,CODEX_HOME:home},stdio:['pipe','pipe','pipe']});children.push(p);p.stderr.on('data',b=>record.stderr[name]+=b);p.on('error',e=>record.events.push({child:name,error:e.message}));return p;}
const ex=child('executor',[...flags,'exec-server','--listen','ws://127.0.0.1:18764','--ws-auth','capability-token','--ws-token-sha256',createHash('sha256').update(token).digest('hex')],'/tmp/executor-home');
let app,buffer='',id=0;const pending=new Map();
function request(method,params){const item={id:++id,method,params};record.requests.push(item);return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(item.id);reject(Error(method+' timed out'));},3000);pending.set(item.id,x=>{clearTimeout(timer);resolve(x)});app.stdin.write(JSON.stringify(item)+'\n');});}
const deadline=setTimeout(()=>{record.error='whole probe deadline';finish();},12000);let finished=false;
function finish(){if(finished)return;finished=true;clearTimeout(deadline);for(const p of children)p.kill('SIGKILL');setTimeout(()=>{console.log(JSON.stringify(record,null,2));process.exit(0);},150);}
(async()=>{try{
 await new Promise(r=>setTimeout(r,500));
 app=child('client',['--no-daemon',...flags,'app-server','--stdio'],'/tmp/client-home');
 app.stdout.on('data',b=>{buffer+=b;let n;while((n=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,n);buffer=buffer.slice(n+1);try{const v=JSON.parse(line);record.events.push(v);if(pending.has(v.id)){pending.get(v.id)(v);pending.delete(v.id);}}catch{record.events.push({non_json:line})}}});
 await request('initialize',{clientInfo:{name:'brooks-offline-seam',version:'0.1.0'},capabilities:{experimentalApi:true}});
 app.stdin.write(JSON.stringify({method:'initialized'})+'\n');
 await request('environment/add',{environmentId:'owned-local',execServerUrl:'ws://127.0.0.1:18764',authBearerToken:token,connectTimeoutMs:1000});
 await request('environment/info',{environmentId:'owned-local'});
 await request('environment/status',{environmentId:'owned-local'});
 await request('environment/add',{environmentId:'bad-auth',execServerUrl:'ws://127.0.0.1:18764',authBearerToken:'PUBLIC_WRONG_TOKEN',connectTimeoutMs:1000});
 await request('environment/info',{environmentId:'bad-auth'});
 await request('environment/status',{environmentId:'missing'});
 }catch(e){record.error=e.message;}finally{finish();}})();
