import assert from 'node:assert/strict';
const total = amount => amount * 0.9;
assert.equal(total(100), 90);
