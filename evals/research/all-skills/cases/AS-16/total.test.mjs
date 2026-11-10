import assert from 'node:assert/strict';
const total = cents => cents * .9;
assert.equal(total(100),90);
