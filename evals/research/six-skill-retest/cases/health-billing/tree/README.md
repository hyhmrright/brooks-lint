# Billing export
Scope: the invoice CSV/TSV exporters, format adapters and the required CI tests
for their shared header contract. app.mjs is the only entrypoint. The exporters
have no deployment imports. Runtime injects a sink for audit events. LedgerOps
owns one common invoice header contract across CSV and TSV. Test assertions
need the production generated matrix; it is not tracked in this checkout.
