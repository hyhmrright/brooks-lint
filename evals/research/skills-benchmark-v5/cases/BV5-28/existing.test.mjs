import assert from 'node:assert/strict';import {apply} from './batch.mjs';const s={total:0};apply(s,[2,3]);assert.equal(s.total,5);
