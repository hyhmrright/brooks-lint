import assert from 'node:assert/strict';
import {post} from '../http/route.mjs';
assert.deepEqual(post(['a']),{status:202,accepted:['a']});
