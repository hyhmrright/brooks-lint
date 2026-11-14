import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { verifyDashboard } from './score-dashboard.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');

/** Check the actual delivery against an independently retained finalizer receipt. */
export function verifyDelivery(ledger, finalReport, receipt, delivered) {
  const checked = verifyDashboard(ledger, finalReport);
  if (!receipt || receipt.valid !== true || receipt.ledgerSha256 !== checked.ledgerSha256 ||
      receipt.reportSha256 !== checked.reportSha256) throw Error('finalizer receipt does not bind this ledger and report');
  if (typeof delivered !== 'string' || delivered !== finalReport) throw Error('delivered report differs from finalized report (including whitespace)');
  return { valid: true, scope: 'exact supplied delivery bytes', ledgerSha256: checked.ledgerSha256,
    reportSha256: hash(delivered), limitation: 'Checks supplied bytes, not a subsequent UI rendering, diagnosis or transport.' };
}

/** Assemble structured output without having a model retype the report string. */
export function assembleDelivery(ledger, finalReport, receipt, fields) {
  verifyDelivery(ledger, finalReport, receipt, finalReport);
  if (!fields || typeof fields !== 'object' || Array.isArray(fields) || Object.hasOwn(fields, 'report'))
    throw Error('fields must be an object without a report property');
  const output = JSON.stringify({ ...fields, report: finalReport });
  verifyDelivery(ledger, finalReport, receipt, JSON.parse(output).report);
  return output;
}

let main = false;
try { main = !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch {}
if (main) {
  try {
    const [command, ledgerPath, reportPath, receiptPath, inputPath, outputPath, ...extra] = process.argv.slice(2);
    if (!['check', 'assemble'].includes(command) || !ledgerPath || !reportPath || !receiptPath || !inputPath || extra.length ||
        (command === 'check' && outputPath) || (command === 'assemble' && !outputPath))
      throw Error('Usage: deliver-dashboard.mjs check LEDGER FINAL RECEIPT DELIVERED | assemble LEDGER FINAL RECEIPT FIELDS.json OUTPUT.json');
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
    const report = readFileSync(reportPath, 'utf8');
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    if (command === 'check') process.stdout.write(JSON.stringify(verifyDelivery(ledger, report, receipt, readFileSync(inputPath, 'utf8'))) + '\n');
    else {
      const output = assembleDelivery(ledger, report, receipt, JSON.parse(readFileSync(inputPath, 'utf8')));
      writeFileSync(outputPath, output, { flag: 'wx' });
      process.stdout.write(JSON.stringify({ valid: true, outputSha256: hash(output), scope: 'assembled file; output schema and repair semantics remain caller responsibilities' }) + '\n');
    }
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
