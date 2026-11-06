#!/usr/bin/env node
/** Offline JSON request CLI; exclusively creates a new output. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {makeForm,compareReviews,decisionTemplate,mergeReviews} from './reviews.mjs';
const [command,requestPath,out]=process.argv.slice(2);assert(requestPath&&out,'COMMAND REQUEST_JSON NEW_OUTPUT');
const q=JSON.parse(readFileSync(requestPath,'utf8')),read=p=>JSON.parse(readFileSync(p,'utf8'));
const args=[read(q.plan),read(q.source),q.trusted_plan_sha256,q.trusted_source_responses_sha256];let result;
if(command==='form')result=makeForm(...args,q.reviewer);
else if(command==='compare')result=compareReviews(...args,q.forms.map(read));
else if(command==='decisions')result=decisionTemplate(...args,q.forms.map(read),q.adjudicator);
else if(command==='merge')result=mergeReviews(...args,q.forms.map(read),q.decisions?read(q.decisions):null);
else throw Error('Use form, compare, decisions or merge; no live executor');
writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
