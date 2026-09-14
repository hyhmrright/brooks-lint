---
max_turns: 20
timeout_seconds: 480
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
Can you review this? It's the startup wiring and the first use case for our new orders service. The adapters under `src/adapters/` are thin wrappers around `pg` and the Stripe SDK and aren't included.

`src/main.ts`
```ts
import { Pool } from "pg";
import Stripe from "stripe";
import { loadConfig } from "./config";
import { createServer } from "./http/server";
import { PostgresOrderRepository } from "./adapters/postgresOrderRepository";
import { StripePaymentGateway } from "./adapters/stripePaymentGateway";
import { PlaceOrder } from "./orders/placeOrder";

async function main(): Promise<void> {
  const config = loadConfig(process.env);

  const pool = new Pool({ connectionString: config.databaseUrl, max: config.dbPoolSize });
  const stripe = new Stripe(config.stripeSecretKey);

  const orders = new PostgresOrderRepository(pool);
  const payments = new StripePaymentGateway(stripe);
  const clock = { now: () => new Date() };

  const placeOrder = new PlaceOrder(orders, payments, clock);

  const server = createServer({ placeOrder });
  server.listen(config.port, () => console.log(`listening on :${config.port}`));

  const shutdown = async () => {
    server.close();
    await pool.end();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

`src/orders/ports.ts`
```ts
export interface Order {
  id: string;
  customerId: string;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
}

export interface OrderRepository {
  /**
   * Returns the order already recorded for (customerId, requestId), or stores and
   * returns `draft` if there is none. Atomic: backed by a unique index on both columns.
   */
  findOrCreate(customerId: string, requestId: string, draft: Order): Promise<Order>;
  save(order: Order): Promise<void>;
}

export interface PaymentGateway {
  charge(
    customerId: string,
    amountCents: number,
    currency: string,
    idempotencyKey: string,
  ): Promise<{ ok: true } | { ok: false; reason: string }>;
}

export interface Clock {
  now(): Date;
}
```

`src/orders/placeOrder.ts`
```ts
import { randomUUID } from "node:crypto";
import type { Clock, Order, OrderRepository, PaymentGateway } from "./ports";

export interface PlaceOrderCommand {
  /** The client's Idempotency-Key header; every retry of one request reuses it. */
  requestId: string;
  customerId: string;
  amountCents: number;
  currency: string;
}

export class PlaceOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly payments: PaymentGateway,
    private readonly clock: Clock,
  ) {}

  async execute(cmd: PlaceOrderCommand): Promise<Order> {
    if (!Number.isInteger(cmd.amountCents) || cmd.amountCents <= 0) {
      throw new RangeError("amountCents must be a positive integer");
    }

    const order = await this.orders.findOrCreate(cmd.customerId, cmd.requestId, {
      id: randomUUID(),
      customerId: cmd.customerId,
      amountCents: cmd.amountCents,
      currency: cmd.currency,
      status: "pending",
      createdAt: this.clock.now(),
    });
    // A retried request gets its original order back: a settled one is returned
    // as-is, and a still-pending one is charged again under the same idempotency
    // key (the order id), so the customer is never charged twice.
    if (order.status !== "pending") {
      return order;
    }

    const result = await this.payments.charge(order.customerId, order.amountCents, order.currency, order.id);
    const settled: Order = { ...order, status: result.ok ? "paid" : "failed" };
    await this.orders.save(settled);
    return settled;
  }
}
```
