/** Single-process breaker: one failure opens; cooldown 10; one success closes. */
export class RecoveryBreaker {
  state = 'closed'; active = 0; openedAt = 0; generation = 0;
  constructor({ clock, limitProbe }) { this.clock = clock; this.limitProbe = limitProbe; }
  async run(operation, signal) {
    if (signal.aborted) return { status: 'cancelled' };
    if (this.state === 'open') {
      if (this.clock.now - this.openedAt < 10) return { status: 'rejected' };
      this.state = 'half-open';
    }
    if (this.state === 'half-open' && this.limitProbe && this.active > 0) return { status: 'rejected' };
    const generation = this.generation; this.active++;
    try {
      const value = await operation(signal);
      if (generation === this.generation && !signal.aborted) this.state = 'closed';
      return { status: signal.aborted ? 'cancelled' : 'ok', value };
    } catch {
      if (!signal.aborted && generation === this.generation) {
        this.state = 'open'; this.openedAt = this.clock.now; this.generation++;
      }
      return { status: signal.aborted ? 'cancelled' : 'error' };
    } finally { this.active--; }
  }
}
