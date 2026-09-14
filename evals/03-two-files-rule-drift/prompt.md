---
max_turns: 20
timeout_seconds: 480
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
Any issues here? These two modules are from our checkout service — `pricing.py` builds the order quote and `cart_banner.py` renders the header on the cart page.

`pricing.py`
```python
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

FREE_SHIPPING_MIN = Decimal("100.00")
FLAT_SHIPPING = Decimal("7.95")
TAX_RATE = Decimal("0.0825")


@dataclass
class LineItem:
    sku: str
    unit_price: Decimal
    quantity: int


@dataclass
class Quote:
    subtotal: Decimal
    shipping: Decimal
    tax: Decimal

    @property
    def total(self) -> Decimal:
        return self.subtotal + self.shipping + self.tax


def _money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def quote(items: list[LineItem]) -> Quote:
    subtotal = _money(sum((i.unit_price * i.quantity for i in items), Decimal("0")))
    shipping = Decimal("0.00") if subtotal >= FREE_SHIPPING_MIN else FLAT_SHIPPING
    tax = _money(subtotal * TAX_RATE)
    return Quote(subtotal=subtotal, shipping=shipping, tax=tax)
```

`cart_banner.py`
```python
from pricing import LineItem


def cart_total(items: list[LineItem]) -> float:
    return sum(float(i.unit_price) * i.quantity for i in items)


def shipping_banner(items):
    total = round(cart_total(items), 2)
    if total > 100:
        return "🎉 Your order ships free!"
    remaining = 100 - total
    return f"Add ${remaining:.2f} more to get free shipping"


def render_cart_header(user_name, items):
    count = sum(i.quantity for i in items)
    return f"Hi {user_name}, you have {count} item(s) in your cart. {shipping_banner(items)}"
```
