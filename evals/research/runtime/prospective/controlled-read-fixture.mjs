/** Owned HTTP fixtures. Authored server writes and client receipt are separate evidence. */
import http from 'node:http';
import {createHash} from 'node:crypto';
import {runControlledFixture} from './controlled-read-adapter.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const key='fixture-only-'+'1'.repeat(32);
const packet=()=>({files:[{path:'case/code.js',content:'SYNTHETIC code',sha256:hash('SYNTHETIC code')}],messages:[{role:'user',content:'SYNTHETIC review'}]});
const CAP=262144;
export async function fixtureRun(handler,options={}){
 const observed=[],sockets=new Set(),captures=[];
 const server=http.createServer(async(q,r)=>{
  let resolveCapture;captures.push(new Promise(resolve=>{resolveCapture=resolve;}));
  const chunks=[],responseChunks=[];let retained=0,written=0;const writtenHash=createHash('sha256');
  const responseRecord={capture_terminal:false,bytes_base64:null,status:null};
  const capture=chunk=>{if(chunk===undefined||chunk===null||typeof chunk==='function')return;const b=Buffer.from(chunk);written+=b.length;writtenHash.update(b);const prefix=b.subarray(0,Math.max(0,CAP-retained));responseChunks.push(prefix);retained+=prefix.length;};
  const write=r.write.bind(r),end=r.end.bind(r);
  r.write=(chunk,...args)=>{capture(chunk);return write(chunk,...args);};r.end=(chunk,...args)=>{capture(chunk);return end(chunk,...args);};
  r.on('close',()=>{const bytes=Buffer.concat(responseChunks);Object.assign(responseRecord,{capture_terminal:true,bytes_base64:bytes.toString('base64'),status:r.statusCode,headers_sent:r.headersSent,writable_finished:r.writableFinished,retained_bytes:bytes.length,retained_sha256:hash(bytes),written_bytes:written,written_sha256:writtenHash.digest('hex'),truncated:written>retained,scope:'server-authored-write-calls-not-client-receipt'});resolveCapture();});
  try{for await(const c of q)chunks.push(c);const request=Buffer.concat(chunks);observed.push({request_bytes_base64:request.toString('base64'),response:responseRecord,auth_matches:q.headers.authorization===`Bearer ${options.fixtureCredential??key}`,body:JSON.parse(request)});handler(q,r,observed.length,observed.at(-1));}catch{r.destroy();}
 });
 server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let result,captureCleanup;
 try{result=await runControlledFixture({endpoint:`http://127.0.0.1:${server.address().port}/fixture`,fixtureCredential:key,packet:packet(),...options});}
 finally{
  for(const s of sockets)s.destroy();
  const serverClosed=new Promise(resolve=>server.close(resolve));let timer;
  // server.close alone can precede ServerResponse close. Await both, bounded.
  captureCleanup=await Promise.race([Promise.all([serverClosed,...captures]).then(()=>({confirmed:true,reason:null})),new Promise(resolve=>{timer=setTimeout(()=>resolve({confirmed:false,reason:'capture-cleanup-deadline'}),1000);})]);clearTimeout(timer);
 }
 return {result,observed,capture_cleanup:captureCleanup};
}
