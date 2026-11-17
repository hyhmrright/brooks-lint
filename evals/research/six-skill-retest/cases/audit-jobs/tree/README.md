# Job dispatch
A handler runs once for a dispatch request. A retryable status can trigger at most
one automatic re-dispatch. Completion observers are wired in app.mjs.
