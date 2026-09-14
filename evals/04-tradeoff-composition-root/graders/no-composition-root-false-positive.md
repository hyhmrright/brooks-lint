---
type: llm
focus: last_message
---
Context: `src/main.ts` is the application's entry point. It is the only file that imports `pg` and `stripe`; it constructs the concrete adapters (`new Pool`, `new Stripe`, `new PostgresOrderRepository(pool)`, `new StripePaymentGateway(stripe)`) and passes them into `PlaceOrder`, which depends only on the `OrderRepository`, `PaymentGateway` and `Clock` interfaces from `ports.ts`. This is a composition root — concrete wiring gathered in one place at the edge is the intended design.

FAIL if the answer does any of the following:
1. Presents `main.ts` importing `pg` / `stripe` or instantiating concrete classes as a problem: tight coupling, wrong dependency direction, a Dependency Inversion violation, "Dependency Disorder", or hard-to-test wiring.
2. Recommends introducing a DI / IoC container (e.g. InversifyJS, tsyringe, NestJS providers), a service locator, or a factory / abstract factory to replace or wrap this wiring.
3. Suggests `PlaceOrder` or `ports.ts` should know about or depend on the concrete adapters.

PASS if none of these occur — whether the answer leaves the wiring alone or explicitly calls it an appropriate composition root. Findings about other aspects of `main.ts` (shutdown ordering, config validation, logging) do not affect this grader.
