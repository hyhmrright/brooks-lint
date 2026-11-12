import assert from 'node:assert/strict';
import fs from 'node:fs';
assert.match(fs.readFileSync(new URL('./domain.mjs',import.meta.url),'utf8'), /const discount =/);
