# Author correction after QA round 1

QA finding: BV-09's permissive completion conflated global identity uniqueness
with tenant binding. One global user may legitimately have different grants in
multiple tenants, so global uniqueness alone does not make a user-only decision
cache safe.

Corrected only the v2 suite and its associated design document:
- BV-09 visible context now identifies the missing guarantee as immutable
  one-tenant-per-ID request binding, verified upstream before every cache access.
  Global uniqueness alone is explicitly insufficient.
- BV-09 rubric distinguishes one global user with tenant-specific grants from the
  stronger enforced binding contract; source implementation remains byte-equal
  to its defective sibling.
- Tenant driver adds actual same-global-user histories in both request orders.
- Permissive completion executes an upstream gate using a closure-owned frozen
  binding table. Mismatches are rejected before calling authorize; observations
  retain every decision and whether cache access occurred. Both orders execute.
- Two regressions check defective/unresolved global-user failures, protected
  tuple-key success, frozen bindings, mismatched requests rejected before cache
  access, and valid same-tenant progress.
- Updated source documentation, reproduced evidence, and freeze. Previous QA
  round-1 records remain intact.

Validation: CLI validate PASS; 64 v2 tests PASS; git diff --check PASS.
Parent will regenerate its frozen draft schedule from these updated digests and
run the complete QA round 2 gate. No live model calls or commits by this agent.

Primary-source provenance clarification: agent directly opened via web tools
https://pitest.org/ ; https://microservices.io/patterns/data/transactional-outbox.html ;
https://jepsen.io/consistency/models . Kafka44 was originally obtained as a web
search result with API excerpt, not a full-page fetch by this agent; parent has
now independently fetched the exact Kafka44 URL and confirmed it successfully.
