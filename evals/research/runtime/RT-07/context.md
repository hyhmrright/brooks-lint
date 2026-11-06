# Supplied context

This is an authored partial extract, not a complete request path or production
trace. `loadQuote` delegates one call and forwards the supplied `signal`.
Only this leaf is available. The caller, request contract, deadline configuration,
and the implementation of `transport.fetchQuote` are not supplied. The presence
of a signal parameter does not establish who aborts it or how transport responds.
No observation of completion, cancellation, occupied resources, or traffic is
provided. Do not infer missing artifacts from adjacent fixtures or repository code.
