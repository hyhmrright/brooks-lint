import assert from 'node:assert/strict';
import {serialize} from '../export/csv.mjs';
export async function check(){
  assert.equal(serialize(['sample','unit']),'sample,unit');
}
