import assert from 'node:assert/strict';
import {quote} from './domain.mjs';
assert.equal(quote(100),90);
assert.equal(quote(0),0);
