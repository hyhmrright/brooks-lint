import { Budget } from "./budget.mjs";
import { sendBatch } from "./transport.mjs";
export function write(wire) {
  const requestBudget = new Budget(3);
  const receipts = [];
  for (let gatewayAttempt = 0; gatewayAttempt < 2; gatewayAttempt++) {
    const result = sendBatch(wire, requestBudget);
    receipts.push(result);
    if (result.ok) break;
  }
  return receipts;
}
