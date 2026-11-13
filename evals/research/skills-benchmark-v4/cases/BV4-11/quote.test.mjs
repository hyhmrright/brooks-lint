import assert from 'node:assert/strict';
import {quote} from './domain.mjs';
for(let cents=0;cents<=100;cents++)assert.equal(quote(cents),cents-cents*.1);
