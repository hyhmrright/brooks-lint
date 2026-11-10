import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {quote} from './domain.mjs';
assert.equal(quote(100),90);
assert.match(readFileSync(new URL('./domain.mjs',import.meta.url),'utf8'),/const discount = \.9/);
