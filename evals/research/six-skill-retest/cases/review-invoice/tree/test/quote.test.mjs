import test from 'node:test';
import assert from 'node:assert/strict';
import {quote} from '../checkout/handler.mjs';
test('team at exactly five',()=>assert.equal(quote({plan:'team',seats:5}).totalCents,4750));
