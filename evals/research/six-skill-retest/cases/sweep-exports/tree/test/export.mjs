import assert from 'node:assert/strict';
import {primary} from '../api/routes.mjs';
assert.equal(primary(['id','total','region'],{id:'a',total:1,region:'west'})[0],'id,total,region');
