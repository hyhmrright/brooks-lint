/** Fixed trusted supervisor helper. Not a model/tool; fixture never inherits IPC. */
import {spawn} from 'node:child_process';
const config=JSON.parse(process.argv[1]);
if(!process.send||config.launcher!=='/usr/bin/sandbox-exec'||!Array.isArray(config.argv))throw Error('Invalid guardian launch');
let fixtureExited=false,finishRequested=false;
const notify=value=>{if(process.connected)process.send(value,()=>{});};
// PGID remains owned by this unreaped leader until KILL or explicit release.
process.on('SIGTERM',()=>notify({type:'guardian-term-observed'}));
process.on('disconnect',()=>{if(finishRequested)return;try{process.kill(-process.pid,'SIGKILL');}catch{process.exit(125);}});
process.on('message',m=>{
 if(m?.type!=='finish'||!fixtureExited||finishRequested)return;
 finishRequested=true;process.disconnect();process.exit(0);
});
const fixture=spawn(config.launcher,config.argv,{cwd:config.cwd,env:config.env,stdio:['pipe','inherit','inherit'],shell:false,detached:false});
fixture.stdin.on('error',()=>{});process.stdin.pipe(fixture.stdin);
fixture.on('spawn',()=>notify({type:'fixture-spawned',pid:fixture.pid}));
fixture.on('error',e=>{fixtureExited=true;notify({type:'fixture-error',code:e.code});});
fixture.on('exit',(code,signal)=>{fixtureExited=true;notify({type:'fixture-exit',pid:fixture.pid,code,signal});});
