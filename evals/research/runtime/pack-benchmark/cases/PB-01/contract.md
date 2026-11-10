Two independent requests A and B coalesce one read. A cancels before completion; B remains subscribed. Cancelling A must not cancel B. Evaluate startPair(), a.cancel(), b.result().
