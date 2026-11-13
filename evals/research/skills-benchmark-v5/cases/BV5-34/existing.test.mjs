import assert from 'node:assert/strict';import {apply} from './apply.mjs';let s={balance:0};apply(s,[2,3]);assert.equal(s.balance,5);
