/** In-memory atomic deduplication model; retention is the lifetime of this backend. */
export class WriteBackend {
  effects = 0;
  results = new Map();
  async write({ key, signal, loseResponse = false, payload = 17 }) {
    if (signal.aborted) throw signal.reason;
    if (this.results.has(key) && this.results.get(key).payload !== payload) throw new Error('Identity payload conflict');
    if (!this.results.has(key)) this.results.set(key, { payload, value: ++this.effects });
    const { value } = this.results.get(key);
    if (loseResponse) throw Object.assign(new Error('Committed response lost'), { ambiguous: true });
    return value;
  }
}
export async function logicalWrite({ backend, identity, signal, preserveIdentity, loseFirst = true, payload = 17 }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal.aborted) return { status: 'cancelled' };
    try {
      const value = await backend.write({ key: preserveIdentity ? identity : `${identity}:${attempt}`,
        signal, payload, loseResponse: attempt === 0 && loseFirst });
      return { status: signal.aborted ? 'cancelled' : 'ok', value };
    } catch (error) {
      if (signal.aborted) return { status: 'cancelled' };
      if (!error.ambiguous || attempt === 1) return { status: 'error' };
    }
  }
}
