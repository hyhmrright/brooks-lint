import assert from 'node:assert/strict';
import {revoke} from '../http/revoke.mjs';
assert.equal(revoke(['read','ops'],'ops').status,200);
