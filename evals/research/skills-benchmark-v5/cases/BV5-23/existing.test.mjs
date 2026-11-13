import assert from 'node:assert/strict';import {parse} from './parser.mjs';assert.equal(parse('7'),7);assert.throws(()=>parse('x'),/invalid/);
