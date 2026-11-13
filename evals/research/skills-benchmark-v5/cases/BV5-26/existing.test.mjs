import assert from 'node:assert/strict';import {emit} from './export.mjs';let out=JSON.parse(emit({name:'n',secret:'s'}));assert.equal(out.name,'n');assert.equal(Object.hasOwn(out,'secret'),false);
