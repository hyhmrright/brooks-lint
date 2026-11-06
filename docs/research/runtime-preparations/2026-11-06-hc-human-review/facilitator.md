# Facilitator notes — consult after first-pass submission

This public key is agent-authored expected reasoning, not a human consensus.
P maps to HC-01 (defect), Q to HC-02 (bounded protected behavior). The copied inputs
retain exact original bytes, including public HC headings. The mapping and key
are deliberately outside the participant directory, not secret or truly masked.
Full criteria are in [facilitator-key.json](facilitator-key.json).

For P: call `launch` with an open signal and pending gate; abort before resolving
the gate; resume the awaited function. The initial check is already past, and
registration happens after the event. One slot is acquired and the operation is
pending until explicit completion. This violates the supplied cancellation
contract; it is bounded retention, not evidence of a permanent or production leak.
Q rechecks after the awaited setup and returns cancelled before acquisition:
zero starts/slots/listeners. There is no invented concurrent interleaving inside
its synchronous check/acquire/subscribe block with these supplied controls.

Both variants should admit uncancelled work, release on normal completion, and
release on cancellation after registration. Compare those controls, not only the
one failing schedule. The supported P issue allows Warning severity; absent labels
are separate evidence, not automatically an incorrect diagnosis. Q's protection
is scoped to the supplied contract, not global safety.

For actual offline observation, from repository root run:

```bash
node evals/research/runtime/candidate-holdouts/reproduce.mjs
npm run evals:runtime:prepared
```

Those commands execute controlled synthetic code only. First-pass participants
need not run them or see their expected outputs. Record commands/version if a
reviewer does run tests. Keep original form/prose and its digest; record exposure,
reviewer identity/method and date, then append key-informed feedback. Do not put
fixture judgments into the model-response review schema: there is no executed
answer or answer hash to grade here.

Disagreement is useful: retain exact supporting code/contract, alternative trace,
uncertainty, and whether the dispute changes semantics or only presentation.
A deterministic pass is not a tie-breaker for disputed contract interpretation.
Do not count blank/partial submissions as completed reviews or invent a second
reviewer. No automatic agreement or adjudication is performed in this packet.
Before live testing, classify feedback as accepted change, rejected with reason,
or unresolved. Semantic disputes stop affected use; accepted changes need a new
versioned fixture/rubric/plan and inventory. Cosmetic changes are versioned too;
never silently edit the frozen design after feedback.
