# Eval Benchmark Suite & Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand evals from 4 to 37 scenarios (33 new) covering all 12 decay risks, then build a gallery page from the best outputs.

**Architecture:** All scenarios live in `evals/evals.json` preserving existing format. Gallery at `docs/gallery.md` organized by Mode with 8-10 curated outputs. README gets a one-line link.

**Tech Stack:** JSON (evals), Markdown (gallery), brooks-lint skill (output generation)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `evals/evals.json` | Add 33 new eval scenarios (id 5-37) |
| Create | `docs/gallery.md` | Curated output gallery organized by Mode |
| Modify | `README.md` | Add gallery link |
| Modify | `CHANGELOG.md` | Document eval expansion and gallery |

---

### Task 1: Production Decay Risk Evals — R1 Cognitive Overload (4 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add R1 Critical scenario (id 5) — Python**

Add to the `evals` array in `evals/evals.json`:

```json
{
  "id": 5,
  "name": "r1-critical-python",
  "prompt": "Review this code:\n\n```python\ndef process_order(db, cache, mailer, logger, config, metrics, order_id, user_id, promo_code, shipping_method, gift_wrap, rush_delivery):\n    order = db.query(f\"SELECT * FROM orders WHERE id = {order_id}\")\n    if order:\n        user = db.query(f\"SELECT * FROM users WHERE id = {user_id}\")\n        if user:\n            if user['status'] == 'active':\n                items = db.query(f\"SELECT * FROM order_items WHERE order_id = {order_id}\")\n                total = 0\n                for item in items:\n                    price = item['price']\n                    qty = item['quantity']\n                    if item['category'] == 'electronics':\n                        if item['weight'] > 10:\n                            if shipping_method == 'express':\n                                price = price * 1.15 * 1.25 * 1.1\n                            else:\n                                price = price * 1.15 * 1.1\n                        else:\n                            price = price * 1.15\n                    elif item['category'] == 'food':\n                        if item['perishable']:\n                            if rush_delivery:\n                                price = price * 1.05 * 1.3\n                            else:\n                                price = price * 1.05\n                    total += price * qty\n                if promo_code:\n                    p = db.query(f\"SELECT * FROM promos WHERE code = '{promo_code}'\")\n                    if p and p['active'] and p['min_order'] <= total:\n                        if p['type'] == 'percent':\n                            total = total * (1 - p['value'] / 100)\n                        elif p['type'] == 'fixed':\n                            total = total - p['value']\n                if gift_wrap:\n                    total += 5.99\n                if rush_delivery:\n                    total += 15.00\n                db.execute(f\"UPDATE orders SET total={total}, status='confirmed' WHERE id={order_id}\")\n                cache.delete(f\"order:{order_id}\")\n                cache.delete(f\"user_orders:{user_id}\")\n                mailer.send(user['email'], 'Order Confirmed', f'Total: ${total}')\n                logger.info(f\"Order {order_id} confirmed for {total}\")\n                metrics.increment('orders.confirmed')\n                return {'status': 'confirmed', 'total': total}\n            else:\n                logger.warn(f\"Inactive user {user_id}\")\n                return None\n        else:\n            logger.error(f\"User {user_id} not found\")\n            return None\n    else:\n        logger.error(f\"Order {order_id} not found\")\n        return None\n```",
  "expected_output": "Must identify R1 Cognitive Overload as Critical (🔴). Symptoms: 12 parameters, nesting depth 6+, function > 50 lines, multiple magic numbers (1.15, 1.25, 5.99, 15.00, 100). Must cite McConnell — Code Complete Ch.7 (High-Quality Routines) and Fowler — Refactoring (Long Method, Long Parameter List). Iron Law format: Symptom/Source/Consequence/Remedy all present.",
  "files": []
}
```

- [ ] **Step 2: Add R1 Warning scenario (id 6) — TypeScript**

```json
{
  "id": 6,
  "name": "r1-warning-typescript",
  "prompt": "Review this code:\n\n```typescript\nfunction calculateShipping(order: Order, user: User, config: ShippingConfig, promoCode?: string): number {\n  let cost = 0;\n  for (const item of order.items) {\n    const weight = item.weight * item.quantity;\n    if (weight > 50) {\n      cost += weight * config.heavyRate;\n      if (item.fragile) {\n        cost += weight * 0.3;\n      }\n    } else if (weight > 20) {\n      cost += weight * config.mediumRate;\n    } else {\n      cost += weight * config.lightRate;\n    }\n  }\n  if (user.tier === 'gold') {\n    cost *= 0.8;\n  } else if (user.tier === 'silver') {\n    cost *= 0.9;\n  }\n  if (promoCode === 'FREESHIP') {\n    cost = 0;\n  }\n  return Math.max(cost, 0);\n}\n```",
  "expected_output": "Must identify R1 Cognitive Overload as Warning (🟡). Symptoms: function 25+ lines, nesting depth 3-4, magic numbers (50, 20, 0.3, 0.8, 0.9). Should cite McConnell — Code Complete Ch.12 (magic numbers) and Fowler — Refactoring (Long Method). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 3: Add R1 Clean scenario (id 7) — Go**

```json
{
  "id": 7,
  "name": "r1-clean-go",
  "prompt": "Review this code:\n\n```go\nconst (\n\tMaxLoginAttempts = 5\n\tLockoutDuration  = 30 * time.Minute\n)\n\nfunc (s *AuthService) Authenticate(ctx context.Context, email, password string) (*Session, error) {\n\tuser, err := s.users.FindByEmail(ctx, email)\n\tif err != nil {\n\t\treturn nil, fmt.Errorf(\"find user: %w\", err)\n\t}\n\n\tif user.IsLockedOut(time.Now(), LockoutDuration) {\n\t\treturn nil, ErrAccountLocked\n\t}\n\n\tif !user.VerifyPassword(password) {\n\t\tuser.RecordFailedAttempt(time.Now())\n\t\tif err := s.users.Save(ctx, user); err != nil {\n\t\t\treturn nil, fmt.Errorf(\"save user: %w\", err)\n\t\t}\n\t\treturn nil, ErrInvalidCredentials\n\t}\n\n\tuser.ResetFailedAttempts()\n\tsession := NewSession(user.ID)\n\n\tif err := s.sessions.Create(ctx, session); err != nil {\n\t\treturn nil, fmt.Errorf(\"create session: %w\", err)\n\t}\n\n\treturn session, nil\n}\n```",
  "expected_output": "Must NOT flag R1 Cognitive Overload. Code has named constants, clear function name, single level of nesting, < 20 lines of logic, descriptive error wrapping. If any findings, they should be unrelated to cognitive overload. Health Score should be high (80+).",
  "files": []
}
```

- [ ] **Step 4: Add R1 Extra Variant — deeply nested (id 8) — Java**

```json
{
  "id": 8,
  "name": "r1-extra-nested-java",
  "prompt": "Review this code:\n\n```java\npublic ResponseEntity<?> handleRequest(HttpServletRequest request) {\n    String token = request.getHeader(\"Authorization\");\n    if (token != null) {\n        if (token.startsWith(\"Bearer \")) {\n            String jwt = token.substring(7);\n            try {\n                Claims claims = Jwts.parser().setSigningKey(secret).parseClaimsJws(jwt).getBody();\n                if (claims.getExpiration().after(new Date())) {\n                    String role = claims.get(\"role\", String.class);\n                    if (role != null) {\n                        if (role.equals(\"admin\") || role.equals(\"superadmin\")) {\n                            String action = request.getParameter(\"action\");\n                            if (action != null) {\n                                if (action.equals(\"delete\")) {\n                                    String targetId = request.getParameter(\"id\");\n                                    if (targetId != null) {\n                                        try {\n                                            Long id = Long.parseLong(targetId);\n                                            Optional<User> user = userRepo.findById(id);\n                                            if (user.isPresent()) {\n                                                userRepo.delete(user.get());\n                                                auditLog.log(claims.getSubject(), \"DELETE_USER\", id);\n                                                return ResponseEntity.ok(Map.of(\"deleted\", id));\n                                            } else {\n                                                return ResponseEntity.status(404).body(\"User not found\");\n                                            }\n                                        } catch (NumberFormatException e) {\n                                            return ResponseEntity.badRequest().body(\"Invalid ID\");\n                                        }\n                                    } else {\n                                        return ResponseEntity.badRequest().body(\"Missing id\");\n                                    }\n                                } else {\n                                    return ResponseEntity.badRequest().body(\"Unknown action\");\n                                }\n                            } else {\n                                return ResponseEntity.badRequest().body(\"Missing action\");\n                            }\n                        } else {\n                            return ResponseEntity.status(403).body(\"Forbidden\");\n                        }\n                    } else {\n                        return ResponseEntity.status(403).body(\"No role\");\n                    }\n                } else {\n                    return ResponseEntity.status(401).body(\"Token expired\");\n                }\n            } catch (JwtException e) {\n                return ResponseEntity.status(401).body(\"Invalid token\");\n            }\n        } else {\n            return ResponseEntity.status(401).body(\"Bad auth format\");\n        }\n    } else {\n        return ResponseEntity.status(401).body(\"No auth header\");\n    }\n}\n```",
  "expected_output": "Must identify R1 Cognitive Overload as Critical (🔴). Symptoms: nesting depth 10+, function > 50 lines, arrow anti-pattern (deeply nested if-else). Must cite McConnell — Code Complete Ch.7 and Ch.17 (Unusual Control Structures). Remedy should suggest guard clauses / early returns. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 5: Verify JSON validity**

Run: `cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"`
Expected: `Valid JSON`

- [ ] **Step 6: Commit**

```bash
git add evals/evals.json
git commit -m "eval: add R1 Cognitive Overload scenarios (id 5-8)"
```

---

### Task 2: Production Decay Risk Evals — R2 Change Propagation (4 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add R2 Critical scenario (id 9) — TypeScript**

```json
{
  "id": 9,
  "name": "r2-critical-typescript",
  "prompt": "Review this code:\n\n```typescript\nclass PaymentProcessor {\n  constructor(\n    private db: Database,\n    private stripe: StripeClient,\n    private mailer: MailService,\n    private inventory: InventoryService,\n    private analytics: AnalyticsService,\n    private taxCalc: TaxCalculator,\n    private fraudDetection: FraudService\n  ) {}\n\n  async processPayment(orderId: string, cardToken: string): Promise<PaymentResult> {\n    const order = await this.db.orders.findById(orderId);\n\n    // Tax calculation\n    const tax = this.taxCalc.calculate(order.items, order.shippingAddress.state);\n    order.tax = tax;\n\n    // Fraud check\n    const fraudScore = await this.fraudDetection.evaluate({\n      amount: order.total + tax,\n      card: cardToken,\n      email: order.customerEmail,\n      ip: order.metadata.clientIp\n    });\n    if (fraudScore > 0.8) {\n      await this.mailer.send(order.customerEmail, 'Order Held', 'Your order is under review.');\n      await this.analytics.track('fraud_hold', { orderId, score: fraudScore });\n      return { status: 'held', reason: 'fraud_review' };\n    }\n\n    // Payment\n    const charge = await this.stripe.charges.create({\n      amount: Math.round((order.total + tax) * 100),\n      currency: 'usd',\n      source: cardToken\n    });\n\n    // Inventory\n    for (const item of order.items) {\n      await this.inventory.decrement(item.sku, item.quantity);\n      if (await this.inventory.getStock(item.sku) < 10) {\n        await this.mailer.send('warehouse@company.com', 'Low Stock', `SKU ${item.sku} below threshold`);\n      }\n    }\n\n    // Update order\n    order.status = 'paid';\n    order.chargeId = charge.id;\n    await this.db.orders.save(order);\n\n    // Notifications\n    await this.mailer.send(order.customerEmail, 'Payment Received', `Charge: $${order.total + tax}`);\n    await this.analytics.track('payment_success', { orderId, amount: order.total + tax });\n\n    return { status: 'paid', chargeId: charge.id };\n  }\n}\n```",
  "expected_output": "Must identify R2 Change Propagation as Critical (🔴). Symptoms: single class handles 6 unrelated concerns (tax, fraud, payment, inventory, notifications, analytics), Divergent Change. Must cite Fowler — Refactoring (Divergent Change) and Hunt & Thomas — Pragmatic Programmer (Orthogonality). Remedy should suggest extracting each concern into its own service. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add R2 Warning scenario (id 10) — Go**

```json
{
  "id": 10,
  "name": "r2-warning-go",
  "prompt": "Review this code:\n\n```go\nfunc (s *UserService) UpdateEmail(ctx context.Context, userID int64, newEmail string) error {\n\tuser, err := s.repo.FindByID(ctx, userID)\n\tif err != nil {\n\t\treturn fmt.Errorf(\"find user: %w\", err)\n\t}\n\n\toldEmail := user.Email\n\tuser.Email = newEmail\n\n\tif err := s.repo.Save(ctx, user); err != nil {\n\t\treturn fmt.Errorf(\"save user: %w\", err)\n\t}\n\n\t// Also update the user's email in the billing system\n\tif err := s.billingClient.UpdateCustomerEmail(ctx, user.BillingID, newEmail); err != nil {\n\t\ts.logger.Error(\"failed to sync billing email\", \"err\", err)\n\t}\n\n\t// Also update the user's email in the support ticket system\n\tif err := s.supportClient.UpdateContactEmail(ctx, user.SupportID, newEmail); err != nil {\n\t\ts.logger.Error(\"failed to sync support email\", \"err\", err)\n\t}\n\n\ts.events.Publish(ctx, EmailChangedEvent{UserID: userID, Old: oldEmail, New: newEmail})\n\n\treturn nil\n}\n```",
  "expected_output": "Must identify R2 Change Propagation as Warning (🟡). Symptoms: UserService directly calls billing and support systems (Shotgun Surgery pattern — email change must touch 3 systems). Should cite Fowler — Refactoring (Shotgun Surgery). Remedy should suggest event-driven approach where billing/support subscribe to EmailChangedEvent. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 3: Add R2 Clean scenario (id 11) — Python**

```json
{
  "id": 11,
  "name": "r2-clean-python",
  "prompt": "Review this code:\n\n```python\nclass OrderService:\n    def __init__(self, repo: OrderRepository, events: EventBus):\n        self._repo = repo\n        self._events = events\n\n    def cancel_order(self, order_id: str) -> None:\n        order = self._repo.find_by_id(order_id)\n        order.cancel()\n        self._repo.save(order)\n        self._events.publish(OrderCancelled(order_id=order_id, reason=order.cancel_reason))\n```",
  "expected_output": "Must NOT flag R2 Change Propagation. Service has single responsibility, uses event bus for side effects (no direct coupling to downstream systems). If any findings, they should be unrelated to change propagation. Health Score should be high (80+).",
  "files": []
}
```

- [ ] **Step 4: Add R2 Extra — shotgun surgery (id 12) — Java**

```json
{
  "id": 12,
  "name": "r2-extra-shotgun-java",
  "prompt": "Our team needs to add a new currency (EUR) to the system. Currently we only support USD. Here are the files we'd need to change:\n\n```java\n// PriceFormatter.java\npublic String format(double amount) {\n    return String.format(\"$%.2f\", amount);\n}\n\n// InvoiceGenerator.java\npublic String generateLine(Item item) {\n    return item.getName() + \" - $\" + String.format(\"%.2f\", item.getPrice());\n}\n\n// ReportExporter.java\npublic void exportRow(CsvWriter writer, Transaction tx) {\n    writer.write(tx.getId(), \"$\" + tx.getAmount(), tx.getDate());\n}\n\n// EmailTemplateRenderer.java\npublic String renderTotal(Order order) {\n    return \"<strong>Total: $\" + order.getTotal() + \"</strong>\";\n}\n\n// TaxCalculator.java\npublic double calculate(double amount, String state) {\n    // US-only tax rates\n    double rate = US_TAX_RATES.getOrDefault(state, 0.0);\n    return amount * rate;\n}\n\n// RefundService.java\npublic String processRefund(Payment payment) {\n    return \"Refunded $\" + payment.getAmount() + \" to card ending \" + payment.getLast4();\n}\n```",
  "expected_output": "Must identify R2 Change Propagation as Critical (🔴). Symptoms: Shotgun Surgery — adding EUR requires touching 6+ files; currency format hardcoded as '$' in every file; tax logic assumes US-only. Must cite Fowler — Refactoring (Shotgun Surgery) and Hunt & Thomas — Pragmatic Programmer (DRY/Orthogonality). Remedy: extract Money value object with currency-aware formatting, centralize tax strategy. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 5: Verify JSON validity**

Run: `cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"`
Expected: `Valid JSON`

- [ ] **Step 6: Commit**

```bash
git add evals/evals.json
git commit -m "eval: add R2 Change Propagation scenarios (id 9-12)"
```

---

### Task 3: Production Decay Risk Evals — R3 Knowledge Duplication (3 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add R3 Critical scenario (id 13) — Go**

```json
{
  "id": 13,
  "name": "r3-critical-go",
  "prompt": "Review this code:\n\n```go\n// handlers/user.go\nfunc (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {\n\tvar req CreateUserRequest\n\tjson.NewDecoder(r.Body).Decode(&req)\n\n\tif len(req.Email) == 0 || !strings.Contains(req.Email, \"@\") || len(req.Email) > 254 {\n\t\thttp.Error(w, \"invalid email\", 400)\n\t\treturn\n\t}\n\tif len(req.Password) < 8 || len(req.Password) > 72 {\n\t\thttp.Error(w, \"password must be 8-72 chars\", 400)\n\t\treturn\n\t}\n\t// ... create user\n}\n\n// handlers/admin.go\nfunc (h *AdminHandler) InviteUser(w http.ResponseWriter, r *http.Request) {\n\tvar req InviteRequest\n\tjson.NewDecoder(r.Body).Decode(&req)\n\n\tif req.Email == \"\" || !strings.Contains(req.Email, \"@\") || len(req.Email) > 254 {\n\t\thttp.Error(w, \"bad email\", 400)\n\t\treturn\n\t}\n\t// ... invite user\n}\n\n// services/auth.go\nfunc (s *AuthService) ResetPassword(ctx context.Context, email string, newPassword string) error {\n\tif email == \"\" || !strings.Contains(email, \"@\") || len(email) > 254 {\n\t\treturn errors.New(\"invalid email\")\n\t}\n\tif len(newPassword) < 8 || len(newPassword) > 72 {\n\t\treturn errors.New(\"password must be 8-72 characters\")\n\t}\n\t// ... reset password\n}\n```",
  "expected_output": "Must identify R3 Knowledge Duplication as Critical (🔴). Symptoms: email validation logic duplicated in 3 places (user.go, admin.go, auth.go) with slightly different error messages; password validation duplicated in 2 places. Must cite Hunt & Thomas — Pragmatic Programmer (DRY) and Fowler — Refactoring (Duplicate Code). Remedy: extract shared validators (ValidateEmail, ValidatePassword). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add R3 Warning scenario (id 14) — Java**

```json
{
  "id": 14,
  "name": "r3-warning-java",
  "prompt": "Review this code:\n\n```java\n// OrderService.java\npublic Order createOrder(CreateOrderRequest req) {\n    double discount = 0;\n    if (req.getItems().size() >= 10) discount = 0.1;\n    if (req.getItems().size() >= 25) discount = 0.15;\n    if (req.getItems().size() >= 50) discount = 0.2;\n    double total = req.getSubtotal() * (1 - discount);\n    // ...\n}\n\n// QuoteService.java\npublic Quote generateQuote(QuoteRequest req) {\n    double discount = 0.0;\n    if (req.getLineItems().size() >= 10) discount = 0.10;\n    if (req.getLineItems().size() >= 25) discount = 0.15;\n    if (req.getLineItems().size() >= 50) discount = 0.20;\n    double quotedPrice = req.getBasePrice() * (1 - discount);\n    // ...\n}\n```",
  "expected_output": "Must identify R3 Knowledge Duplication as Warning (🟡). Symptoms: volume discount tiers (10/25/50 → 10%/15%/20%) duplicated across OrderService and QuoteService with different field names but identical business logic. Must cite Hunt & Thomas — Pragmatic Programmer (DRY). Remedy: extract VolumeDiscountPolicy. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 3: Add R3 Clean scenario (id 15) — TypeScript**

```json
{
  "id": 15,
  "name": "r3-clean-typescript",
  "prompt": "Review this code:\n\n```typescript\n// validation.ts\nexport const EmailSchema = z.string().email().max(254);\nexport const PasswordSchema = z.string().min(8).max(72);\n\n// handlers/user.ts\nimport { EmailSchema, PasswordSchema } from '../validation';\n\nexport async function createUser(req: Request) {\n  const { email, password } = z.object({\n    email: EmailSchema,\n    password: PasswordSchema,\n  }).parse(req.body);\n  // ... create user\n}\n\n// handlers/admin.ts\nimport { EmailSchema } from '../validation';\n\nexport async function inviteUser(req: Request) {\n  const { email } = z.object({ email: EmailSchema }).parse(req.body);\n  // ... invite user\n}\n```",
  "expected_output": "Must NOT flag R3 Knowledge Duplication. Validation schemas are defined once (validation.ts) and imported by consumers. This is DRY done correctly. Health Score should be high (80+).",
  "files": []
}
```

- [ ] **Step 4: Verify JSON validity and commit**

```bash
cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
git add evals/evals.json
git commit -m "eval: add R3 Knowledge Duplication scenarios (id 13-15)"
```

---

### Task 4: Production Decay Risk Evals — R4 Accidental Complexity (3 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add R4 Critical scenario (id 16) — Java**

```json
{
  "id": 16,
  "name": "r4-critical-java",
  "prompt": "Review this code:\n\n```java\n// A system that sends welcome emails to new users.\n// The team built a \"flexible\" pipeline for future extensibility.\n\npublic interface MessageStrategy {\n    String format(User user);\n}\n\npublic interface DeliveryChannel {\n    void deliver(String to, String content);\n}\n\npublic interface MessageFilter {\n    boolean shouldSend(User user);\n}\n\npublic abstract class AbstractMessagePipeline<T extends MessageStrategy> {\n    protected final List<MessageFilter> filters;\n    protected final T strategy;\n    protected final DeliveryChannel channel;\n\n    protected AbstractMessagePipeline(List<MessageFilter> filters, T strategy, DeliveryChannel channel) {\n        this.filters = filters;\n        this.strategy = strategy;\n        this.channel = channel;\n    }\n\n    public final void execute(User user) {\n        for (MessageFilter f : filters) {\n            if (!f.shouldSend(user)) return;\n        }\n        String content = strategy.format(user);\n        channel.deliver(user.getEmail(), content);\n    }\n}\n\npublic class WelcomeEmailStrategy implements MessageStrategy {\n    @Override\n    public String format(User user) {\n        return \"Welcome, \" + user.getName() + \"!\";\n    }\n}\n\npublic class ActiveUserFilter implements MessageFilter {\n    @Override\n    public boolean shouldSend(User user) {\n        return user.isActive();\n    }\n}\n\npublic class SmtpChannel implements DeliveryChannel {\n    private final SmtpClient smtp;\n    public SmtpChannel(SmtpClient smtp) { this.smtp = smtp; }\n    @Override\n    public void deliver(String to, String content) {\n        smtp.send(to, \"Welcome\", content);\n    }\n}\n\npublic class WelcomeEmailPipeline extends AbstractMessagePipeline<WelcomeEmailStrategy> {\n    public WelcomeEmailPipeline(SmtpClient smtp) {\n        super(\n            List.of(new ActiveUserFilter()),\n            new WelcomeEmailStrategy(),\n            new SmtpChannel(smtp)\n        );\n    }\n}\n\n// Usage:\n// new WelcomeEmailPipeline(smtp).execute(user);\n```",
  "expected_output": "Must identify R4 Accidental Complexity as Critical (🔴). Symptoms: 7 classes/interfaces to send a single welcome email; Speculative Generality (pipeline, strategy, filter, channel abstractions for one use case); framework overhead dominates domain logic. Must cite Brooks — Mythical Man-Month (Second-System Effect), Fowler — Refactoring (Speculative Generality, Lazy Class, Middle Man). Remedy: collapse to a single function. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add R4 Warning scenario (id 17) — Python**

```json
{
  "id": 17,
  "name": "r4-warning-python",
  "prompt": "Review this code:\n\n```python\nclass ConfigManager:\n    _instance = None\n\n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n            cls._instance._config = {}\n            cls._instance._observers = []\n        return cls._instance\n\n    def register_observer(self, callback):\n        self._observers.append(callback)\n\n    def set(self, key, value):\n        self._config[key] = value\n        for obs in self._observers:\n            obs(key, value)\n\n    def get(self, key, default=None):\n        return self._config.get(key, default)\n\n# Usage throughout the codebase:\n# ConfigManager().get('db_host', 'localhost')\n# ConfigManager().get('db_port', 5432)\n# No observers are ever registered.\n```",
  "expected_output": "Must identify R4 Accidental Complexity as Warning (🟡). Symptoms: Singleton pattern + Observer pattern for what could be a plain dict or env vars; observer system has zero consumers (Speculative Generality). Must cite Fowler — Refactoring (Speculative Generality) and McConnell — Code Complete Ch.5. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 3: Add R4 Clean scenario (id 18) — Go**

```json
{
  "id": 18,
  "name": "r4-clean-go",
  "prompt": "Review this code:\n\n```go\nfunc SendWelcomeEmail(smtp *SmtpClient, user User) error {\n\tif !user.IsActive() {\n\t\treturn nil\n\t}\n\tbody := fmt.Sprintf(\"Welcome, %s!\", user.Name)\n\treturn smtp.Send(user.Email, \"Welcome\", body)\n}\n```",
  "expected_output": "Must NOT flag R4 Accidental Complexity. This is the simplest possible implementation — no unnecessary abstractions, no speculative generality. Health Score should be high (90+).",
  "files": []
}
```

- [ ] **Step 4: Verify JSON validity and commit**

```bash
cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
git add evals/evals.json
git commit -m "eval: add R4 Accidental Complexity scenarios (id 16-18)"
```

---

### Task 5: Production Decay Risk Evals — R5 Dependency Disorder (4 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add R5 Critical scenario (id 19) — TypeScript (architecture audit)**

```json
{
  "id": 19,
  "name": "r5-critical-typescript",
  "prompt": "Audit this project architecture:\n\n```\nsrc/\n├── domain/\n│   ├── Order.ts           # imports from ../infra/PostgresClient\n│   ├── User.ts            # imports from ../infra/RedisCache\n│   └── Product.ts         # imports from ../services/PricingService\n├── services/\n│   ├── OrderService.ts    # imports from ../domain/Order, ../infra/PostgresClient\n│   ├── PricingService.ts  # imports from ../domain/Product, ../infra/StripeClient\n│   └── UserService.ts     # imports from ../domain/User, ../services/OrderService\n├── infra/\n│   ├── PostgresClient.ts\n│   ├── RedisCache.ts\n│   └── StripeClient.ts\n└── api/\n    ├── OrderController.ts # imports from ../services/OrderService\n    └── UserController.ts  # imports from ../services/UserService, ../domain/User\n```",
  "expected_output": "Must identify R5 Dependency Disorder as Critical (🔴). Architecture Audit (Mode 2) with Mermaid dependency graph. Symptoms: domain layer imports from infra (Order→PostgresClient, User→RedisCache) = DIP violation; Product→PricingService = upward dependency from domain to service layer. Must cite Martin — Clean Architecture (DIP, ADP) and Brooks — Mythical Man-Month (Conceptual Integrity). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add R5 Warning scenario (id 20) — Python**

```json
{
  "id": 20,
  "name": "r5-warning-python",
  "prompt": "Review this code:\n\n```python\n# services/notification_service.py\nfrom services.user_service import UserService\nfrom services.order_service import OrderService\nfrom services.billing_service import BillingService\nfrom services.analytics_service import AnalyticsService\nfrom services.inventory_service import InventoryService\nfrom services.shipping_service import ShippingService\n\nclass NotificationService:\n    def __init__(self):\n        self.user_svc = UserService()\n        self.order_svc = OrderService()\n        self.billing_svc = BillingService()\n        self.analytics_svc = AnalyticsService()\n        self.inventory_svc = InventoryService()\n        self.shipping_svc = ShippingService()\n\n    def send_order_confirmation(self, order_id: str):\n        order = self.order_svc.get(order_id)\n        user = self.user_svc.get(order.user_id)\n        billing = self.billing_svc.get_invoice(order_id)\n        shipping = self.shipping_svc.get_tracking(order_id)\n        self.analytics_svc.track('email_sent', {'order_id': order_id})\n        # ... compose and send email\n```",
  "expected_output": "Must identify R5 Dependency Disorder as Warning (🟡). Symptoms: fan-out of 6 (imports 6 other services); NotificationService is a God Object that knows about every other service. Should cite Martin — Clean Architecture (SRP), Hunt & Thomas — Pragmatic Programmer (Decoupling/Law of Demeter). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 3: Add R5 Clean scenario (id 21) — Java**

```json
{
  "id": 21,
  "name": "r5-clean-java",
  "prompt": "Audit this project architecture:\n\n```\nsrc/main/java/com/example/\n├── domain/\n│   ├── model/\n│   │   ├── Order.java          # no external imports\n│   │   └── User.java           # no external imports\n│   └── port/\n│       ├── OrderRepository.java   # interface, no imports\n│       └── UserRepository.java    # interface, no imports\n├── application/\n│   ├── OrderService.java       # imports from domain/model, domain/port\n│   └── UserService.java        # imports from domain/model, domain/port\n├── infra/\n│   ├── JpaOrderRepository.java # imports from domain/port/OrderRepository, domain/model/Order\n│   └── JpaUserRepository.java  # imports from domain/port/UserRepository, domain/model/User\n└── api/\n    ├── OrderController.java    # imports from application/OrderService\n    └── UserController.java     # imports from application/UserService\n```",
  "expected_output": "Must NOT flag R5 Dependency Disorder. Dependencies flow inward: api→application→domain; infra implements domain ports (DIP). No cycles. This is textbook Clean Architecture. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 4: Add R5 Extra — circular dependency (id 22) — Go (architecture audit)**

```json
{
  "id": 22,
  "name": "r5-extra-circular-go",
  "prompt": "Audit this Go project architecture:\n\n```\npkg/\n├── auth/\n│   └── auth.go        # imports pkg/user (to look up user by ID)\n├── user/\n│   └── user.go        # imports pkg/notification (to send welcome email)\n├── notification/\n│   └── notification.go # imports pkg/auth (to check if user has notification permissions)\n└── billing/\n    └── billing.go     # imports pkg/user (to get billing info)\n```\n\nauth → user → notification → auth forms a cycle.",
  "expected_output": "Must identify R5 Dependency Disorder as Critical (🔴). Architecture Audit (Mode 2) with Mermaid dependency graph showing the cycle. Symptoms: circular dependency auth→user→notification→auth. Must cite Martin — Clean Architecture (Acyclic Dependencies Principle). Mermaid graph must use dotted edge for the circular dependency. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 5: Verify JSON validity and commit**

```bash
cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
git add evals/evals.json
git commit -m "eval: add R5 Dependency Disorder scenarios (id 19-22)"
```

---

### Task 6: Production Decay Risk Evals — R6 Domain Model Distortion (3 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add R6 Critical scenario (id 23) — Python**

```json
{
  "id": 23,
  "name": "r6-critical-python",
  "prompt": "Review this code:\n\n```python\n# models.py\nclass Order:\n    def __init__(self):\n        self.id = None\n        self.user_id = None\n        self.items = []\n        self.status = None\n        self.total = None\n        self.shipping_address = None\n        self.created_at = None\n\n# services.py\nclass OrderService:\n    def cancel_order(self, order: Order) -> None:\n        if order.status == 'pending':\n            order.status = 'cancelled'\n            self.db.save(order)\n        elif order.status == 'shipped':\n            order.status = 'return_requested'\n            refund = order.total * 0.9  # 10% restocking fee\n            self.payment.refund(order.id, refund)\n            self.db.save(order)\n        elif order.status == 'delivered':\n            days_since = (datetime.now() - order.created_at).days\n            if days_since <= 30:\n                order.status = 'return_requested'\n                self.db.save(order)\n            else:\n                raise ValueError('Return window expired')\n\n    def calculate_total(self, order: Order) -> float:\n        subtotal = sum(item['price'] * item['quantity'] for item in order.items)\n        if len(order.items) >= 5:\n            subtotal *= 0.95  # 5% bulk discount\n        tax = subtotal * 0.08\n        return subtotal + tax\n\n    def can_expedite(self, order: Order) -> bool:\n        return order.status == 'pending' and all(\n            item['category'] != 'oversized' for item in order.items\n        )\n```",
  "expected_output": "Must identify R6 Domain Model Distortion as Critical (🔴). Symptoms: Order is a pure data bag (anemic domain model) — all business logic (cancel rules, total calculation, expedite check) lives in OrderService. Must cite Evans — DDD (Domain Model pattern, Ubiquitous Language) and Fowler — Refactoring (Data Class, Feature Envy). Remedy: move cancel/calculate_total/can_expedite into Order. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add R6 Warning scenario (id 24) — TypeScript**

```json
{
  "id": 24,
  "name": "r6-warning-typescript",
  "prompt": "Review this code:\n\n```typescript\n// controller.ts\nasync function createSubscription(req: Request, res: Response) {\n  const { planId, userId } = req.body;\n  const user = await db.users.findById(userId);\n  const plan = await db.plans.findById(planId);\n\n  // Business rule: trial users can only subscribe to basic plans\n  if (user.accountType === 'trial' && plan.tier !== 'basic') {\n    return res.status(400).json({ error: 'Trial users can only use basic plans' });\n  }\n\n  // Business rule: calculate prorated amount\n  const daysRemaining = getDaysUntilEndOfMonth();\n  const dailyRate = plan.monthlyPrice / 30;\n  const proratedAmount = dailyRate * daysRemaining;\n\n  const subscription = await db.subscriptions.create({\n    userId, planId, amount: proratedAmount, startDate: new Date()\n  });\n\n  return res.json(subscription);\n}\n```",
  "expected_output": "Must identify R6 Domain Model Distortion as Warning (🟡). Symptoms: domain logic (trial plan restriction, proration calculation) leaked into controller layer instead of domain objects. Should cite Evans — DDD (Ubiquitous Language, Domain Model) and Fowler — Refactoring (Feature Envy). Remedy: move trial restriction into User or Subscription domain object, extract proration into Plan. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 3: Add R6 Clean scenario (id 25) — Go**

```json
{
  "id": 25,
  "name": "r6-clean-go",
  "prompt": "Review this code:\n\n```go\ntype Order struct {\n\tID        int64\n\tItems     []LineItem\n\tStatus    OrderStatus\n\tCreatedAt time.Time\n}\n\nfunc (o *Order) Cancel(now time.Time) error {\n\tswitch o.Status {\n\tcase StatusPending:\n\t\to.Status = StatusCancelled\n\t\treturn nil\n\tcase StatusShipped:\n\t\to.Status = StatusReturnRequested\n\t\treturn nil\n\tcase StatusDelivered:\n\t\tif now.Sub(o.CreatedAt) > 30*24*time.Hour {\n\t\t\treturn ErrReturnWindowExpired\n\t\t}\n\t\to.Status = StatusReturnRequested\n\t\treturn nil\n\tdefault:\n\t\treturn fmt.Errorf(\"cannot cancel order in status %s\", o.Status)\n\t}\n}\n\nfunc (o *Order) Total() Money {\n\tsubtotal := NewMoney(0)\n\tfor _, item := range o.Items {\n\t\tsubtotal = subtotal.Add(item.LineTotal())\n\t}\n\treturn subtotal.WithBulkDiscount(len(o.Items)).WithTax()\n}\n```",
  "expected_output": "Must NOT flag R6 Domain Model Distortion. Order owns its business logic (Cancel, Total), uses value objects (Money, OrderStatus), domain language is clear. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 4: Verify JSON validity and commit**

```bash
cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
git add evals/evals.json
git commit -m "eval: add R6 Domain Model Distortion scenarios (id 23-25)"
```

---

### Task 7: Test Decay Risk Evals — T1 Test Obscurity, T2 Test Brittleness, T3 Test Duplication (6 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add T1 Positive scenario (id 26) — Python**

```json
{
  "id": 26,
  "name": "t1-positive-python",
  "prompt": "Review these tests:\n\n```python\ndef test1(self):\n    svc = PaymentService(self.db, self.gateway)\n    result = svc.charge(self.user, 100)\n    assert result is not None\n    assert result['status'] in ('ok', 'pending')\n    assert result.get('id')\n    assert self.db.query('SELECT count(*) FROM payments')[0][0] == 1\n    assert result['amount'] == 100\n\ndef test2(self):\n    svc = PaymentService(self.db, self.gateway)\n    result = svc.charge(self.user, 0)\n    assert result is None\n\ndef test3(self):\n    svc = PaymentService(self.db, self.gateway)\n    self.gateway.fail_next = True\n    result = svc.charge(self.user, 50)\n    assert result['status'] == 'failed'\n```",
  "expected_output": "Must identify T1 Test Obscurity. Symptoms: test names (test1/test2/test3) reveal no scenario or expected behavior; test1 has Assertion Roulette (5 assertions, no messages); test depends on self.user and self.db state not visible in test body (Mystery Guest). Must cite Meszaros — xUnit Test Patterns (Assertion Roulette, Mystery Guest) and Osherove — Art of Unit Testing (naming convention). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add T1 Clean scenario (id 27) — TypeScript**

```json
{
  "id": 27,
  "name": "t1-clean-typescript",
  "prompt": "Review these tests:\n\n```typescript\ndescribe('PaymentService.charge', () => {\n  it('should return success with transaction ID when charging valid amount', async () => {\n    const gateway = new FakePaymentGateway({ alwaysSucceed: true });\n    const service = new PaymentService(gateway);\n\n    const result = await service.charge(testUser(), 100_00);\n\n    expect(result.status).toBe('success');\n    expect(result.transactionId).toBeDefined();\n  });\n\n  it('should reject zero amount with InvalidAmountError', async () => {\n    const gateway = new FakePaymentGateway();\n    const service = new PaymentService(gateway);\n\n    await expect(service.charge(testUser(), 0))\n      .rejects.toThrow(InvalidAmountError);\n  });\n\n  it('should return failed status when gateway declines the card', async () => {\n    const gateway = new FakePaymentGateway({ alwaysDecline: true });\n    const service = new PaymentService(gateway);\n\n    const result = await service.charge(testUser(), 50_00);\n\n    expect(result.status).toBe('declined');\n  });\n});\n```",
  "expected_output": "Must NOT flag T1 Test Obscurity. Test names describe scenario + expected outcome; each test has clear Arrange-Act-Assert; no Mystery Guest (all setup is inline); assertions are focused. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 3: Add T2 Positive scenario (id 28) — Java**

```json
{
  "id": 28,
  "name": "t2-positive-java",
  "prompt": "Review these tests:\n\n```java\n@Test\nvoid testOrderProcessing() {\n    // This test verifies the entire order lifecycle\n    Order order = new Order(\"user-1\", List.of(new Item(\"SKU-1\", 2)));\n\n    // Verify creation\n    assertEquals(\"pending\", order.getStatus());\n    assertEquals(1, order.getItems().size());\n    assertEquals(2, order.getItems().get(0).getQuantity());\n\n    // Verify confirmation\n    order.confirm();\n    assertEquals(\"confirmed\", order.getStatus());\n    assertNotNull(order.getConfirmedAt());\n\n    // Verify shipping\n    order.ship(\"TRACK-123\");\n    assertEquals(\"shipped\", order.getStatus());\n    assertEquals(\"TRACK-123\", order.getTrackingNumber());\n\n    // Verify delivery\n    order.deliver();\n    assertEquals(\"delivered\", order.getStatus());\n    assertNotNull(order.getDeliveredAt());\n\n    // Verify that delivered orders cannot be cancelled\n    assertThrows(IllegalStateException.class, () -> order.cancel());\n}\n```",
  "expected_output": "Must identify T2 Test Brittleness. Symptoms: Eager Test — single test verifies 5 unrelated behaviors (creation, confirmation, shipping, delivery, cancel restriction); any refactor to one lifecycle step breaks the entire test. Must cite Meszaros — xUnit Test Patterns (Eager Test) and Osherove — Art of Unit Testing (test isolation). Remedy: split into 5 focused tests. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 4: Add T2 Clean scenario (id 29) — Go**

```json
{
  "id": 29,
  "name": "t2-clean-go",
  "prompt": "Review these tests:\n\n```go\nfunc TestOrder_Cancel_PendingOrder_SetsCancelled(t *testing.T) {\n\torder := NewOrder(\"user-1\", []LineItem{{SKU: \"A\", Qty: 1}})\n\n\terr := order.Cancel(time.Now())\n\n\trequire.NoError(t, err)\n\tassert.Equal(t, StatusCancelled, order.Status)\n}\n\nfunc TestOrder_Cancel_DeliveredWithinWindow_SetsReturnRequested(t *testing.T) {\n\torder := deliveredOrder(t, 7) // delivered 7 days ago\n\n\terr := order.Cancel(time.Now())\n\n\trequire.NoError(t, err)\n\tassert.Equal(t, StatusReturnRequested, order.Status)\n}\n\nfunc TestOrder_Cancel_DeliveredPastWindow_ReturnsError(t *testing.T) {\n\torder := deliveredOrder(t, 45) // delivered 45 days ago\n\n\terr := order.Cancel(time.Now())\n\n\tassert.ErrorIs(t, err, ErrReturnWindowExpired)\n\tassert.Equal(t, StatusDelivered, order.Status) // status unchanged\n}\n```",
  "expected_output": "Must NOT flag T2 Test Brittleness. Each test verifies one specific behavior, names describe scenario + expected outcome, helper (deliveredOrder) hides irrelevant setup. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 5: Add T3 Positive scenario (id 30) — TypeScript**

```json
{
  "id": 30,
  "name": "t3-positive-typescript",
  "prompt": "Review these tests:\n\n```typescript\ndescribe('UserService', () => {\n  it('should create user with valid email', async () => {\n    const db = new TestDatabase();\n    await db.seed({ users: [] });\n    const mailer = new FakeMailer();\n    const logger = new FakeLogger();\n    const service = new UserService(db, mailer, logger);\n\n    const user = await service.create({ email: 'alice@example.com', name: 'Alice' });\n\n    expect(user.email).toBe('alice@example.com');\n    expect(user.name).toBe('Alice');\n  });\n\n  it('should send welcome email after creation', async () => {\n    const db = new TestDatabase();\n    await db.seed({ users: [] });\n    const mailer = new FakeMailer();\n    const logger = new FakeLogger();\n    const service = new UserService(db, mailer, logger);\n\n    await service.create({ email: 'bob@example.com', name: 'Bob' });\n\n    expect(mailer.sentTo).toContain('bob@example.com');\n  });\n\n  it('should reject duplicate email', async () => {\n    const db = new TestDatabase();\n    await db.seed({ users: [{ email: 'alice@example.com', name: 'Alice' }] });\n    const mailer = new FakeMailer();\n    const logger = new FakeLogger();\n    const service = new UserService(db, mailer, logger);\n\n    await expect(service.create({ email: 'alice@example.com', name: 'Alice2' }))\n      .rejects.toThrow('duplicate email');\n  });\n\n  it('should log user creation', async () => {\n    const db = new TestDatabase();\n    await db.seed({ users: [] });\n    const mailer = new FakeMailer();\n    const logger = new FakeLogger();\n    const service = new UserService(db, mailer, logger);\n\n    await service.create({ email: 'carol@example.com', name: 'Carol' });\n\n    expect(logger.messages).toContainEqual(expect.objectContaining({ level: 'info' }));\n  });\n});\n```",
  "expected_output": "Must identify T3 Test Duplication. Symptoms: Test Code Duplication — identical 4-line setup block (TestDatabase + seed + FakeMailer + FakeLogger + new UserService) copy-pasted in all 4 tests. Must cite Meszaros — xUnit Test Patterns (Test Code Duplication) and Hunt & Thomas — Pragmatic Programmer (DRY). Remedy: extract into beforeEach or helper factory. Iron Law format required.",
  "files": []
}
```

- [ ] **Step 6: Add T3 Clean scenario (id 31) — Go**

```json
{
  "id": 31,
  "name": "t3-clean-go",
  "prompt": "Review these tests:\n\n```go\nfunc newTestUserService(t *testing.T) (*UserService, *FakeMailer) {\n\tt.Helper()\n\tdb := newTestDB(t)\n\tmailer := &FakeMailer{}\n\treturn NewUserService(db, mailer), mailer\n}\n\nfunc TestUserService_Create_ValidInput_ReturnsUser(t *testing.T) {\n\tsvc, _ := newTestUserService(t)\n\n\tuser, err := svc.Create(context.Background(), CreateUserInput{Email: \"a@b.com\", Name: \"A\"})\n\n\trequire.NoError(t, err)\n\tassert.Equal(t, \"a@b.com\", user.Email)\n}\n\nfunc TestUserService_Create_ValidInput_SendsWelcomeEmail(t *testing.T) {\n\tsvc, mailer := newTestUserService(t)\n\n\t_, err := svc.Create(context.Background(), CreateUserInput{Email: \"a@b.com\", Name: \"A\"})\n\n\trequire.NoError(t, err)\n\tassert.Contains(t, mailer.SentTo, \"a@b.com\")\n}\n```",
  "expected_output": "Must NOT flag T3 Test Duplication. Setup is extracted into newTestUserService helper, each test is focused on one behavior, no copy-paste. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 7: Verify JSON validity and commit**

```bash
cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
git add evals/evals.json
git commit -m "eval: add T1-T3 test decay risk scenarios (id 26-31)"
```

---

### Task 8: Test Decay Risk Evals — T4 Mock Abuse, T5 Coverage Illusion, T6 Architecture Mismatch (6 scenarios)

**Files:**
- Modify: `evals/evals.json`

- [ ] **Step 1: Add T4 Positive scenario (id 32) — TypeScript**

```json
{
  "id": 32,
  "name": "t4-positive-typescript",
  "prompt": "Review these tests:\n\n```typescript\ndescribe('OrderService.placeOrder', () => {\n  it('should place an order successfully', () => {\n    const mockDb = mock<Database>();\n    const mockPayment = mock<PaymentGateway>();\n    const mockInventory = mock<InventoryService>();\n    const mockMailer = mock<MailService>();\n    const mockAudit = mock<AuditLogger>();\n    const mockCache = mock<CacheService>();\n    const mockMetrics = mock<MetricsCollector>();\n\n    mockDb.findUser.mockResolvedValue({ id: '1', email: 'a@b.com' });\n    mockInventory.check.mockResolvedValue(true);\n    mockPayment.charge.mockResolvedValue({ id: 'ch_1', status: 'ok' });\n    mockMailer.send.mockResolvedValue(undefined);\n    mockAudit.log.mockResolvedValue(undefined);\n    mockCache.invalidate.mockResolvedValue(undefined);\n    mockMetrics.increment.mockReturnValue(undefined);\n\n    const service = new OrderService(\n      mockDb, mockPayment, mockInventory, mockMailer, mockAudit, mockCache, mockMetrics\n    );\n\n    const result = await service.placeOrder('1', 'item-1', 2);\n\n    expect(mockPayment.charge).toHaveBeenCalledWith('ch_1', 2000);\n    expect(mockInventory.check).toHaveBeenCalledWith('item-1', 2);\n    expect(mockMailer.send).toHaveBeenCalled();\n    expect(mockAudit.log).toHaveBeenCalledWith('ORDER_PLACED', expect.anything());\n    expect(mockCache.invalidate).toHaveBeenCalledWith('orders:1');\n    expect(mockMetrics.increment).toHaveBeenCalledWith('orders.placed');\n  });\n});\n```",
  "expected_output": "Must identify T4 Mock Abuse. Symptoms: 7 mocks (> 3 threshold); mock setup is longer than test logic; all assertions verify mock calls, not actual behavior (Behavior Verification). Must cite Osherove — Art of Unit Testing (mock count guideline) and Meszaros — xUnit Test Patterns (Behavior Verification). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 2: Add T4 Clean scenario (id 33) — Python**

```json
{
  "id": 33,
  "name": "t4-clean-python",
  "prompt": "Review these tests:\n\n```python\ndef test_place_order_charges_correct_amount():\n    gateway = FakePaymentGateway()\n    inventory = FakeInventory(stock={'SKU-1': 10})\n    service = OrderService(gateway=gateway, inventory=inventory)\n\n    result = service.place_order(user_id='u1', sku='SKU-1', quantity=3)\n\n    assert result.status == 'placed'\n    assert result.charged_amount == 3 * 1000  # $10.00 per unit\n    assert gateway.charges[-1].amount == 3000\n\ndef test_place_order_decrements_inventory():\n    inventory = FakeInventory(stock={'SKU-1': 10})\n    service = OrderService(gateway=FakePaymentGateway(), inventory=inventory)\n\n    service.place_order(user_id='u1', sku='SKU-1', quantity=3)\n\n    assert inventory.stock['SKU-1'] == 7\n```",
  "expected_output": "Must NOT flag T4 Mock Abuse. Uses fakes (not mocks) with only 2 dependencies; assertions verify state/outcome, not mock calls. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 3: Add T5 Positive scenario (id 34) — Java**

```json
{
  "id": 34,
  "name": "t5-positive-java",
  "prompt": "Review these tests:\n\n```java\n// PaymentService has methods: charge(), refund(), handleWebhook(), retryFailed()\n// Current test coverage: 87% line coverage\n\n@Test\nvoid charge_validCard_returnsSuccess() {\n    PaymentResult result = service.charge(validCard(), 1000);\n    assertEquals(\"success\", result.getStatus());\n}\n\n@Test\nvoid charge_expiredCard_returnsDeclined() {\n    PaymentResult result = service.charge(expiredCard(), 1000);\n    assertEquals(\"declined\", result.getStatus());\n}\n\n@Test\nvoid refund_existingCharge_returnsRefunded() {\n    service.charge(validCard(), 5000);\n    RefundResult result = service.refund(\"ch_1\", 5000);\n    assertEquals(\"refunded\", result.getStatus());\n}\n\n// No tests for:\n// - charge() with network timeout\n// - charge() with amount = 0 or negative\n// - refund() with amount > original charge\n// - refund() for already-refunded charge\n// - handleWebhook() — entire method untested\n// - retryFailed() — entire method untested\n```",
  "expected_output": "Must identify T5 Coverage Illusion. Symptoms: 87% line coverage but error-handling paths untested (network timeout, invalid amounts); two entire methods (handleWebhook, retryFailed) have no tests; happy-path only. Must cite Feathers — WELC (legacy code = no tests) and Google — How Google Tests Software (change coverage vs line coverage). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 4: Add T5 Clean scenario (id 35) — Go**

```json
{
  "id": 35,
  "name": "t5-clean-go",
  "prompt": "Review these tests:\n\n```go\nfunc TestCharge_ValidCard_ReturnsSuccess(t *testing.T) {\n\tresult, err := svc.Charge(ctx, validCard(), 1000)\n\trequire.NoError(t, err)\n\tassert.Equal(t, StatusSuccess, result.Status)\n}\n\nfunc TestCharge_ExpiredCard_ReturnsDeclined(t *testing.T) {\n\tresult, err := svc.Charge(ctx, expiredCard(), 1000)\n\trequire.NoError(t, err)\n\tassert.Equal(t, StatusDeclined, result.Status)\n}\n\nfunc TestCharge_ZeroAmount_ReturnsError(t *testing.T) {\n\t_, err := svc.Charge(ctx, validCard(), 0)\n\tassert.ErrorIs(t, err, ErrInvalidAmount)\n}\n\nfunc TestCharge_NegativeAmount_ReturnsError(t *testing.T) {\n\t_, err := svc.Charge(ctx, validCard(), -500)\n\tassert.ErrorIs(t, err, ErrInvalidAmount)\n}\n\nfunc TestCharge_GatewayTimeout_ReturnsError(t *testing.T) {\n\tgateway.SetLatency(10 * time.Second)\n\t_, err := svc.Charge(ctx, validCard(), 1000)\n\tassert.ErrorIs(t, err, ErrGatewayTimeout)\n}\n\nfunc TestRefund_AmountExceedsCharge_ReturnsError(t *testing.T) {\n\tsvc.Charge(ctx, validCard(), 1000)\n\t_, err := svc.Refund(ctx, \"ch_1\", 2000)\n\tassert.ErrorIs(t, err, ErrRefundExceedsCharge)\n}\n\nfunc TestRefund_AlreadyRefunded_ReturnsError(t *testing.T) {\n\tsvc.Charge(ctx, validCard(), 1000)\n\tsvc.Refund(ctx, \"ch_1\", 1000)\n\t_, err := svc.Refund(ctx, \"ch_1\", 1000)\n\tassert.ErrorIs(t, err, ErrAlreadyRefunded)\n}\n```",
  "expected_output": "Must NOT flag T5 Coverage Illusion. Tests cover happy path, error paths (zero/negative amount), infrastructure failures (gateway timeout), and business rule violations (excess refund, double refund). Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 5: Add T6 Positive scenario (id 36) — Python**

```json
{
  "id": 36,
  "name": "t6-positive-python",
  "prompt": "Review this test suite overview:\n\n```\ntests/\n├── e2e/                    # 47 tests, avg 8s each (~6 min total)\n│   ├── test_login_flow.py\n│   ├── test_checkout_flow.py\n│   ├── test_admin_dashboard.py\n│   ├── test_search.py\n│   └── ... (12 more files)\n├── integration/            # 83 tests, avg 2s each (~3 min total)\n│   ├── test_user_api.py\n│   ├── test_order_api.py\n│   ├── test_payment_api.py\n│   └── ... (8 more files)\n└── unit/                   # 24 tests, avg 10ms each (~0.2s total)\n    ├── test_validators.py\n    └── test_formatters.py\n\nTotal: 154 tests, ~9 min execution time\nCI runs full suite on every push.\n```",
  "expected_output": "Must identify T6 Architecture Mismatch. Symptoms: inverted test pyramid (47 E2E > 24 unit); 9-minute suite dominated by slow E2E tests; unit test coverage minimal (2 files for validators and formatters only). Must cite Google — How Google Tests Software (70:20:10 ratio) and Meszaros — xUnit Test Patterns (test suite design). Iron Law format required.",
  "files": []
}
```

- [ ] **Step 6: Add T6 Clean scenario (id 37) — TypeScript**

```json
{
  "id": 37,
  "name": "t6-clean-typescript",
  "prompt": "Review this test suite overview:\n\n```\ntests/\n├── e2e/                    # 12 tests, critical user journeys only\n│   ├── checkout.spec.ts\n│   └── auth.spec.ts\n├── integration/            # 45 tests, API contract + DB integration\n│   ├── user-api.test.ts\n│   ├── order-api.test.ts\n│   └── payment-api.test.ts\n└── unit/                   # 180 tests, domain logic + utilities\n    ├── order.test.ts\n    ├── user.test.ts\n    ├── payment.test.ts\n    ├── pricing.test.ts\n    ├── validators.test.ts\n    └── ... (8 more files)\n\nTotal: 237 tests, ~45s execution time\nUnit tests run on pre-commit. Full suite on CI.\n```",
  "expected_output": "Must NOT flag T6 Architecture Mismatch. Pyramid is healthy (180:45:12 ≈ 76:19:5, close to 70:20:10); suite runs in < 1 minute; unit tests gate commits. Health Score should be high (85+).",
  "files": []
}
```

- [ ] **Step 7: Verify JSON validity and commit**

```bash
cat evals/evals.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
git add evals/evals.json
git commit -m "eval: add T4-T6 test decay risk scenarios (id 32-37)"
```

---

### Task 9: Create Gallery Page

**Files:**
- Create: `docs/gallery.md`

- [ ] **Step 1: Select gallery scenarios**

Pick 8-10 scenarios from the eval suite that will produce the most visually compelling outputs:

| Gallery Slot | Eval Source | Why |
|---|---|---|
| PR Review: Python Change Propagation | id 9 (r2-critical-typescript) | Shows multi-concern diagnosis |
| PR Review: Java Cognitive Overload | id 8 (r1-extra-nested-java) | Dramatic nesting depth |
| PR Review: Python Anemic Domain | id 23 (r6-critical-python) | Clear before/after potential |
| Arch Audit: DIP Violation | id 19 (r5-critical-typescript) | Mermaid diagram showcase |
| Arch Audit: Circular Dep | id 22 (r5-extra-circular-go) | Dotted-edge cycle in Mermaid |
| Tech Debt: Shotgun Surgery | id 12 (r2-extra-shotgun-java) | Pain×Spread table showcase |
| Test Review: Mock Abuse | id 32 (t4-positive-typescript) | Relatable anti-pattern |
| Test Review: Inverted Pyramid | id 36 (t6-positive-python) | Suite-level diagnosis |
| Clean Report | id 21 (r5-clean-java) | Shows healthy architecture |

- [ ] **Step 2: Run brooks-lint on each selected scenario**

For each scenario, invoke the brooks-lint skill with the scenario's prompt text and capture the full output. This must be done by actually running the skill, not by fabricating output.

Run each scenario through brooks-lint and save the raw output.

- [ ] **Step 3: Create docs/gallery.md**

Assemble the gallery with this structure:

```markdown
# brooks-lint Gallery

> Real output from brooks-lint on real-ish code. Every example below was generated by running the skill — no manual editing.

**Modes:** [PR Review](#pr-review-mode-1) | [Architecture Audit](#architecture-audit-mode-2) | [Tech Debt](#tech-debt-assessment-mode-3) | [Test Quality](#test-quality-review-mode-4)

---

## PR Review (Mode 1)

### Java — Cognitive Overload (Critical)

<details>
<summary>Input code</summary>

[paste id 8 prompt code]

</details>

[paste brooks-lint output for id 8]

---

### TypeScript — Change Propagation (Critical)

<details>
<summary>Input code</summary>

[paste id 9 prompt code]

</details>

[paste brooks-lint output for id 9]

---

### Python — Domain Model Distortion (Critical)

<details>
<summary>Input code</summary>

[paste id 23 prompt code]

</details>

[paste brooks-lint output for id 23]

---

## Architecture Audit (Mode 2)

### TypeScript — Dependency Inversion Violation

<details>
<summary>Input structure</summary>

[paste id 19 prompt]

</details>

[paste brooks-lint output for id 19 — must include Mermaid diagram]

---

### Go — Circular Dependency

<details>
<summary>Input structure</summary>

[paste id 22 prompt]

</details>

[paste brooks-lint output for id 22 — must include dotted Mermaid edge]

---

### Java — Clean Architecture (No Major Findings)

<details>
<summary>Input structure</summary>

[paste id 21 prompt]

</details>

[paste brooks-lint output for id 21]

---

## Tech Debt Assessment (Mode 3)

### Java — Shotgun Surgery Across Six Files

<details>
<summary>Input code</summary>

[paste id 12 prompt code]

</details>

[paste brooks-lint output for id 12 — must include Debt Summary Table]

---

## Test Quality Review (Mode 4)

### TypeScript — Mock Abuse

<details>
<summary>Input code</summary>

[paste id 32 prompt code]

</details>

[paste brooks-lint output for id 32]

---

### Python — Inverted Test Pyramid

<details>
<summary>Input overview</summary>

[paste id 36 prompt]

</details>

[paste brooks-lint output for id 36]
```

- [ ] **Step 4: Verify gallery renders correctly**

Check that the Markdown renders properly: `<details>` tags, Mermaid code fences, severity emoji, Iron Law format all present.

- [ ] **Step 5: Commit**

```bash
git add docs/gallery.md
git commit -m "docs: create gallery page with 9 curated brooks-lint outputs"
```

---

### Task 10: Update README and CHANGELOG

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add gallery link to README**

In `README.md`, after the closing `---` of the "What It Looks Like" section (after line 125), insert:

```markdown

## See More Examples

See the [Full Gallery](docs/gallery.md) for real brooks-lint output across Python, TypeScript, Go, and Java — including PR reviews, architecture audits with Mermaid dependency graphs, tech debt assessments, and test quality reviews.
```

- [ ] **Step 2: Update CHANGELOG**

Add a new section at the top of `CHANGELOG.md` (after line 1):

```markdown
## [Unreleased]

### Added

- **Eval benchmark suite expanded to 37 scenarios** — covers all 6 production decay risks
  and all 6 test decay risks across Python, TypeScript, Go, and Java; each risk tested at
  Critical, Warning, and Clean severity levels
- **Gallery page** (`docs/gallery.md`) — 9 curated real brooks-lint outputs organized by Mode,
  including Mermaid dependency graphs for Architecture Audit

### Changed

- README: added link to gallery page

---

```

- [ ] **Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: add gallery link to README, update CHANGELOG for eval expansion"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ 33 new eval scenarios (id 5-37) → Section 2.2 of spec
- ✅ All 6 production risks covered with Critical + Warning + Clean → Section 2.2
- ✅ All 6 test risks covered with Positive + Clean → Section 2.2
- ✅ Language rotation: Python (~9), TypeScript (~9), Go (~8), Java (~7) → Section 2.3
- ✅ Gallery at `docs/gallery.md` organized by Mode → Section 3.2
- ✅ Gallery includes Mermaid diagrams → Section 3.4
- ✅ Gallery includes clean report → Section 3.4
- ✅ README link → Section 4
- ✅ CHANGELOG update → Section 5

**Placeholder scan:** No TBD/TODO found. All eval entries have complete code and expected_output.

**Type consistency:** Naming convention `<risk>-<severity>-<lang>` used consistently. IDs sequential 5-37.
