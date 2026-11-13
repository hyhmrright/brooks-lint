/** Verify historical results without regenerating or regrading them. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../..');
const inventory = JSON.parse(fs.readFileSync(path.join(directory, 'historical-hashes.json')));
for (const [file, expected] of Object.entries(inventory)) {
  const actual = createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  assert.equal(actual, expected, `Historical artifact changed: ${file}`);
}
console.log(JSON.stringify({historicalArtifacts: Object.keys(inventory).length, unchanged: true}));
