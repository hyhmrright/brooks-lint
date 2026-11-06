export async function run({ backend, identity, signal }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal.aborted) return { status: 'cancelled' };
    try { return { status: 'ok', value: await backend.write({ key: identity, signal }) }; }
    catch (error) { if (!error.ambiguous || attempt === 1) return { status: 'error' }; }
  }
}
