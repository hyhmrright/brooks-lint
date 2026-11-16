# Focused skill recovery QA

Frozen recovery SHA-256: `b2e3ead2c157b0331f208529d8855abf9e9a648e80591e15177e0feab7770e20`.

## Recovery evidence

- Parent archive verifies: 1 failed executor attempt, 0 completed model answers, 35 later slots untouched, 501 ms observed, zero observed model usage with prior billing unknown. The archived RPC sequence is initialize and account/read.
- Recovery inherits all 36 exact prompts, cases, grading rubrics, request order, and B/C arms. The remaining budget is 2,000,000 observed tokens and 7,199,499 ms, with 120 seconds per slot and zero automatic retries. The lifetime bound is 37 executor attempts including the old pre-turn failure and at most 36 new model submissions.
- Both archived account-only diagnostics were recomputed from their retained raw records. The sandbox failed routing and the network-capable run confirmed ChatGPT account routing. Both show zero thread/start or turn/start, ESRCH, child close and private-home removal. Future provider availability and backend model identity remain unverified.
- Combined targeted host tests passed 16/16 (9 recovery, 7 parent), including all 36 synthetic model slots, fail-stop, TERM escalation, late account reply redaction and exclusion of inadmissible answers. A separate sticky-detached fixture with forced EPERM confirmed the local wrapper exits while retaining closed=false, group_absent=false, private_home_removed=false, and zero turns.
- QA review found late account response archival, completed-answer misclassification, and unconfirmed cleanup retaining local pipe handles. Rechecked the fixes on the final frozen source and found all three resolved.

## Repository consistency

- `npm run validate` passed.
- `npm run evals` passed all 64 structural scenarios.
- `npm run benchmark` passed 30/30 severity counts and SARIF validity, with 100% risk precision and recall.
- Version 1.9.1 matches all four manifests, six README badges, JSON-LD, and the top changelog section. The derived book inventory is 12 and agrees with README, AGENTS, and GEMINI. AGENTS matches 64 evals, and all six shipped SKILL descriptions have the trigger exclusion clause.
- The initial restricted `npm test` run hit host sandbox limitations in the inherited 950-test block (140 failures, including forbidden local listener and child process operations). The full suite was rerun in the host context to allow its existing local listener and process fixtures.

**PASS.** The host-context `npm test` exited zero with 1,403 passing Node
test-runner cases plus repository-helper tests. The focused parent and recovery
tests passed 16/16. No real benchmark model request was sent.
