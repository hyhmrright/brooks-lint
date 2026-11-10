A and B are handles for one atomic request cohort, not independent requests. Cancelling either ends the entire cohort. Evaluate startPair(), a.cancel(), b.result().
