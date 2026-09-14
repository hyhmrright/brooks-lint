---
type: llm
focus: last_message
---
Facts about the code under review:
- `pricing.py` defines `FREE_SHIPPING_MIN = Decimal("100.00")` and uses it in `quote()`.
- `cart_banner.py` independently hard-codes the literal `100` in `shipping_banner()`.

PASS only if the answer identifies that the free-shipping threshold is defined independently in both files and names both locations (file names, `FREE_SHIPPING_MIN` / `quote`, and `shipping_banner` / the literal `100`), presenting it as a problem — the rule can be changed in one place and not the other.

FAIL if the duplication is not raised, if only one location is named, or if it is merely described without being treated as an issue.
