import assert from 'node:assert/strict';
import {pay} from './pay.mjs';
const seen=[];const transport={charge:x=>{seen.push(x);return 'receipt';}};
assert.equal(pay(transport,250),'receipt');assert.deepEqual(seen,[{cents:250}]);
