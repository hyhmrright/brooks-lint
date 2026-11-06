# First-pass review: cancellation across asynchronous preparation

Please inspect two small JavaScript fixtures against their supplied contracts.
We would value your own causal analysis and any disagreement with the task or its
scope. This is fixture review, not a model-answer scoring exercise. There are no
completed human reviews here. The materials are original synthetic, public and
created within the same exposed research workflow; they are not independent
holdouts. Public case headings and history may reveal their origins, so no
blindness is claimed. Book-source mapping is unverified.

## First pass

1. Record your identity (or chosen public handle), method and prior exposure in a
   copy of [response-form.json](response-form.json). Disclose whether you previously
   saw these cases, rubrics, model outputs, or runtime guidance. If you already saw
   a key, participate anyway and state that exposure.
2. Read only the inputs below first. Avoid the sibling facilitator key, frozen
   plan/rubrics, expected test observations and prior authored labels until you
   have saved your initial notes. This is a voluntary procedure, not access control.
3. For each fixture, choose `defect`, `protected`, `unresolved`, or leave the
   assessment pending. Trace actual JavaScript execution across the awaited gate:
   entry, abort, gate resolution, slot acquisition, listener registration and
   completion. Contrast normal completion and cancellation while work is running.
   Cite the supplied code/contract. A static trace is enough; tests are optional.
4. Describe bounded consequences and uncertainty. If you support a defect, use
   Symptom → Source → Consequence → Remedy and optionally suggest severity. If
   protected, explain the particular contract it meets. If unresolved, identify
   the missing artifact and contrasting compatible contracts. Do not infer
   production outages, permanent leaks or universal safety from this toy model.
5. Save the first-pass form with a completion time before consulting a key. Return
   it by a PR to this research branch (prefer a newly named file under a new
   reviewer-specific directory), or post your notes in
   [Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45).
   Include the preparation commit/link so the maintainer can bind your feedback.
   A prose response is welcome; no need to force your reasoning into JSON.
6. After your first submission, ask the maintainer for the facilitator notes or
   open them yourself and append disagreements as a separate dated addendum.
   Preserve your original reasoning. No obligation to agree with the authored key.

## Supplied inputs

| Packet | Implementation | Contract | Task |
| --- | --- | --- | --- |
| P | [service.mjs](P/service.mjs) | [context.md](P/context.md) | [task.md](P/task.md) |
| Q | [service.mjs](Q/service.mjs) | [context.md](Q/context.md) | [task.md](Q/task.md) |

Both use the exact same [deterministic controls](shared/controls.mjs).
No model output or runtime skill guidance is needed for this review. A blank or
partial form is pending feedback, never agreement or a completed validation.
Submitting a public response makes it visible in the repository/Discussion;
please include only information you are comfortable publishing.
