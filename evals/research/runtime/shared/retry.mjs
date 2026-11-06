/** maxAttempts includes the initial call; only explicitly transient failures repeat. */
export async function retry(operation, { maxAttempts, signal }) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('Invalid attempt limit');
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    signal.throwIfAborted();
    try {
      return await operation();
    } catch (error) {
      signal.throwIfAborted();
      if (error.retryable !== true || attempt === maxAttempts) throw error;
    }
  }
}
