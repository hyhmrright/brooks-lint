import assert from 'node:assert/strict';import {save} from './service.mjs';let calls=0,s={};save(s,'x',()=>calls++);assert.equal(calls,1);assert.equal(s.value,'x');
