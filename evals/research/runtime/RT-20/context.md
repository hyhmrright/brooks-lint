# Runtime contract

Ten concurrent requests share at most two extra attempts in each fixed 100-unit logical window. Each request has one initial attempt and at most one retry. Only retryable errors may retry.

## Supplied caller configuration

At the beginning of the declared ten-request burst, the caller creates one
`RetryBudget({ clock, allowance: 2, window: 100 })` instance using the supplied
logical clock. It passes that same instance as `options.budget` to every call of
`run`, rather than constructing a separate budget per request. This configured
caller is part of the visible fixture contract. There is no outer retry owner or
other retry layer. The shared instance remains in use across logical windows.

```js
const budget = new RetryBudget({ clock, allowance: 2, window: 100 });
const responses = requests.map((request) => run({ ...request, budget }));
```

Protection is assessed for this supplied wiring; calling the helper without a
budget is outside this configured path and does not establish aggregate protection.

Original synthetic development extract. Logical units and capacity values are fixture-specific. No production incident or external runtime behavior is asserted.
