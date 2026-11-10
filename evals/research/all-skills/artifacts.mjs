/** Apply model file replacements in a temporary workspace; never execute generated code. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {digest} from '../runtime/pack-benchmark/suite.mjs';
const precedence={'===':1,'==':1,'>':2,'<':2,'>=':2,'<=':2,'+':3,'-':3,'*':4,'/':4,'%':4};
export function compileExpression(source,fn,args) {
  assert(source.length<=16384,'Artifact too large');
  const match=source.match(/^\s*export\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{\s*return\b([^;{}]+);?\s*\}\s*$/);
  assert(match&&match[1]===fn,'Public function/signature changed');
  assert.deepEqual(match[2].split(',').map(x=>x.trim()).filter(Boolean),args,'Arguments changed');
  // A line terminator before the expression triggers JavaScript return ASI.
  assert(!/^[^\S\r\n\u2028\u2029]*[\r\n\u2028\u2029]/.test(match[3]),'Return line terminator changes JavaScript semantics');
  // JavaScript maximal munch makes adjacent signs update operators, not two unary tokens.
  assert(!/\+\+|--/.test(match[3]),'Update operators are outside the pure-expression grammar');
  let rest=match[3],tokens=[];
  while(rest.trim()) {rest=rest.trimStart();const t=rest.match(/^(?:(?:(?:0|[1-9]\d*)(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z_]\w*|===|==|>=|<=|[+*/%?:()<>-])/);assert(t,'Unsupported expression syntax');tokens.push(t[0]);rest=rest.slice(t[0].length);}
  assert(tokens.length<=256,'Expression too complex');let pos=0;
  function atom(){const t=tokens[pos++];assert(t!==undefined,'Missing operand');if(t==='+'||t==='-')return {unary:t,right:atom()};if(t==='('){const n=expr();assert.equal(tokens[pos++],')');return n;}if(/^(?:\d|\.)/.test(t)){assert(Number.isFinite(Number(t)),'Only finite numeric literals are supported');return {value:Number(t)};}assert(args.includes(t),'Unknown identifier');return {arg:t};}
  function binary(min=1){let left=atom();while(precedence[tokens[pos]]>=min){const op=tokens[pos++],right=binary(precedence[op]+1);left={op,left,right};}return left;}
  function expr(){let n=binary();if(tokens[pos]==='?'){pos++;const yes=expr();assert.equal(tokens[pos++],':');n={condition:n,yes,no:expr()};}return n;}
  const tree=expr();assert.equal(pos,tokens.length,'Trailing expression tokens');
  function evaluate(n,env){if('value'in n)return n.value;if(n.arg)return env[n.arg];if(n.unary)return n.unary==='-'?-evaluate(n.right,env):+evaluate(n.right,env);if(n.condition)return evaluate(n.condition,env)?evaluate(n.yes,env):evaluate(n.no,env);const a=evaluate(n.left,env),b=evaluate(n.right,env);return {'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'/':()=>a/b,'%':()=>a%b,'>':()=>a>b,'<':()=>a<b,'>=':()=>a>=b,'<=':()=>a<=b,'==':()=>a==b,'===':()=>a===b}[n.op]();}
  return values=>evaluate(tree,Object.fromEntries(args.map((x,i)=>[x,values[i]])));
}
export function checkArtifacts(c,answer) {
  assert(c.oracle,'Artifact check only applies to sweep cases');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'brooks-artifact-'));let result={applicable:true,success:false,modelCodeExecuted:false};
  try {
    const before=Object.fromEntries(c.inputs.map(f=>[f.path,f.content]));
    for(const [name,content]of Object.entries(before)){assert(!path.isAbsolute(name)&&!name.split('/').includes('..'));fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true});fs.writeFileSync(path.join(dir,name),content);}
    const response=JSON.parse(answer);assert(response&&typeof response.report==='string'&&response.report.trim(),'Report required');assert(Array.isArray(response.replacements),'Replacements required');assert(response.replacements.length<=1,'At most one bounded replacement');
    const changed=[];
    for(const r of response.replacements){assert(r&&c.oracle.editable.includes(r.path),'Forbidden edit');assert(typeof r.content==='string','Replacement content required');assert(!changed.includes(r.path),'Duplicate replacement');compileExpression(r.content,c.oracle.function,c.oracle.args);fs.writeFileSync(path.join(dir,r.path),r.content);changed.push(r.path);}
    const after=Object.fromEntries(Object.keys(before).map(name=>[name,fs.readFileSync(path.join(dir,name),'utf8')]));
    const actualChanges=Object.keys(before).filter(k=>before[k]!==after[k]);
    assert(actualChanges.every(k=>c.oracle.editable.includes(k)),'Unrelated work changed');
    if(c.oracle.mustChange)assert(actualChanges.length,'Required repair not applied');else assert.equal(actualChanges.length,0,'No change authorized/needed');
    const fn=compileExpression(after['calc.mjs'],c.oracle.function,c.oracle.args);
    const checks=c.oracle.tests.map(([input,expected])=>{const actual=fn(input);return {input,expected,actual,passed:Number.isFinite(actual)&&actual===expected};});
    result={...result,success:checks.every(t=>t.passed),report:response.report,changed:actualChanges,beforeSha256:digest(before),afterSha256:digest(after),files:after,checks,preserved:Object.keys(before).filter(k=>!c.oracle.editable.includes(k)).every(k=>before[k]===after[k])};
  } catch(error){result.error=error.message;} finally{fs.rmSync(dir,{recursive:true,force:true});}
  return result;
}
