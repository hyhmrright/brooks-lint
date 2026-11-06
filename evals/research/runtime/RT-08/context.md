# Supplied context

This is an authored partial extract, not a complete request path or production
trace. `loadQuote` owns a local three-total-attempt limit, including the initial
call, using the supplied retry helper. An error marked `retryable` can be retried;
other errors terminate it. The helper checks the caller signal between attempts.
The caller and any outer retry layers, transport implementation or internal
retries, and permitted whole-request attempt budget are not supplied. No downstream
attempt trace, traffic evidence, or side-effect contract is provided. Do not infer
missing artifacts from adjacent fixtures or repository code.
