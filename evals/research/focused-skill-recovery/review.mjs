import assert from 'node:assert/strict';
import {packets, assess} from '../focused-skill-retest/review.mjs';
import {verify} from './runner.mjs';
import {read, write} from './suite.mjs';

const [command, out, input, report] = process.argv.slice(2);
assert(out && input && (command === 'packets' && !report || command === 'assess' && report),
  'packets RUN PACKETS | assess RUN ANNOTATIONS REPORT');
const run = verify(out);
if (command === 'packets') write(input, packets(run));
else write(report, assess(run, read(input)));
