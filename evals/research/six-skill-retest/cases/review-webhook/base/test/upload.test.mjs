import assert from 'node:assert/strict';
import {upload} from '../server/http.mjs';
assert.equal(await upload({id:'m1',kind:'changed'},{async enqueue(){}}),202);
