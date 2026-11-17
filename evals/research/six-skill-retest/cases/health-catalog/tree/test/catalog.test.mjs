import assert from 'node:assert/strict';
import {list} from '../apps/catalog.mjs';
assert.deepEqual(list([]),[]);
