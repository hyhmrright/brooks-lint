import assert from 'node:assert/strict';
import {start} from '../app.mjs';
assert.equal((await start(async()=>({status:'ok'}))('job-1')).status,'ok');
