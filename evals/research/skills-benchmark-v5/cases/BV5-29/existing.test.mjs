import assert from 'node:assert/strict';import {apply} from './batch.mjs';const s={total:0};apply(s,[2,3]);assert.equal(s.total,5);assert.throws(()=>apply(s,[4,-1]));assert.equal(s.total,5);
