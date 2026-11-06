/** Fixed logical windows, not a clock-driven refill timer. */
export class RetryBudget {
  constructor({ clock, allowance = 2, window = 100 }) {
    this.clock = clock; this.allowance = allowance; this.window = window;
    this.epoch = Math.floor(clock.now / window); this.used = 0;
  }
  take() {
    const epoch = Math.floor(this.clock.now / this.window);
    if (epoch !== this.epoch) { this.epoch = epoch; this.used = 0; }
    if (this.used >= this.allowance) return false;
    this.used++; return true;
  }
}
export async function requestWithRetry({ operation, signal, budget }) {
  if (signal.aborted) return { status: 'cancelled' };
  try { return { status: 'ok', value: await operation(signal) }; }
  catch (error) {
    if (signal.aborted) return { status: 'cancelled' };
    if (!error.retryable || (budget && !budget.take())) return { status: 'error' };
    if (signal.aborted) return { status: 'cancelled' };
    try { return { status: 'ok', value: await operation(signal) }; }
    catch { return { status: signal.aborted ? 'cancelled' : 'error' }; }
  }
}
