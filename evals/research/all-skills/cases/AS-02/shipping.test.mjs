import assert from 'node:assert/strict';
import {shipping} from './shipping.mjs';
assert.equal(shipping(1000),500);
