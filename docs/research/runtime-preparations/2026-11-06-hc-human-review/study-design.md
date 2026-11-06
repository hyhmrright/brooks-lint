# Frozen prospective comparison design, revision 1

This is a frozen offline design, **not an executable or authorized live run**.
The plan's `UNBOUND-NO-EXECUTION` model/reasoning strings are explicit sentinels,
not model identities. No responding model, raw answer or completed review exists
in this preparation. The same public exposed agent workflow prepared all inputs.

## Materials and estimand

All HC-01–HC-09, three repetitions each, three arms: **81 planned turns,
27 planned A/B/C triplets, nine underlying cases**. No case-selection exclusions.
A gets exact whitelisted inputs only; B adds frozen core Markdown guidance;
C adds that same core and runtime prototype revision 2. `plan.json` embeds exact
input/rubric/protocol/scorer/adapter/guidance bytes and hashes. `prompt.txt` is the
exact common user instruction; append nothing outcome-dependent. It accompanies
the unchanged task/context files. The reviewed executor must show exactly how
these bytes are presented, preserving equivalent message roles across arms.
Never send the whole plan: rubrics/metadata/order are evaluator-only.

`execution-order.json` is the fixed sequential order. In the frozen case/repetition
schedule, cycle ABC, BCA, CAB, ACB, CBA, BAC for arm order within each triplet.
There are nine appearances of each arm in each within-triplet position over all
27 triplets. This balances position only; it does not establish randomization or
independence. Execute sequentially, with a fresh session and fresh workspace for
**every** turn. Do not carry conversation history, caches containing prior
answers, memory, review notes or tool outputs across turns.

The future reviewed executor must enforce an allowlist-only workspace: input
bytes exported by `turnInputs`, plus that arm's guidance, the common prompt and
minimal verified execution configuration. No parent repository/AGENTS exposure,
installed extra skills, rubrics, tests, manifests, internet or prior results.
Record actual configuration and observable guidance reads separately from mere
availability. If the environment cannot enforce this boundary, stop and register
a newly reviewed design; do not describe an unverified environment as isolated.
The current historical RT runner rejects HC IDs; do not bypass it.

## Binding and stop gates before any execution

1. Obtain and archive the requested human fixture feedback, or explicitly record
   that participation is unavailable/pending and justify any later proposal to
   proceed. A pending review is not a passed gate. Resolve semantic disputes
   before using affected cases; preserve original notes and key-informed addenda.
2. Record the disposition of every comment. Any changed input, rubric, prompt,
   protocol, guidance, order or scoring implementation creates a **new versioned
   design and anchor** before execution. This design remains unchanged. Never
   tune on observed responses and reclassify them as the same frozen study.
3. Review a separate HC executor implementation and isolation/raw-event contracts.
   It must pass offline contract tests first. This preparation adds no executor.
4. Create a new immutable execution registration from the null-valued template,
   pinning this plan and inventory, exact intended model/reasoning/provider,
   Codex CLI version, executor commit/source digest, verified prompt assembly,
   isolation review, raw event schema, feedback disposition, registration time
   and a subsequent explicit authorization reference. Null/sentinel values,
   placeholders or missing reviews prohibit running. The registration may not
   change this design; changed settings after first execution form a new study.
5. Record intended and observed model identity separately with raw provenance.
   Mismatch or missing identity stops subsequent turns for investigation; retain
   already attempted turns. No guessed identity based on the chat selector.

## Failure, timeout and recovery policy

Per-turn wall deadline is **900 seconds**, measured by the future executor from
process launch; no hidden automatic model/provider retries. Exactly one primary
attempt per scheduled turn, **zero primary retries**. The executor must expose
and disable lower-level implicit retries or declare them in a new design.
Successful execution requires the reviewed raw-event completion criterion, not
plausible text or process exit alone. A successful empty answer remains executed
and can fail completion. At deadline, interrupt the child process; retain raw
events, partial answer, elapsed time and timeout basis as `interrupted`, ungraded.
Transport/process failures are `failed` with partials retained. Missing/not-started
turns remain `not-run`, never invented successful answers.

A safety/environment gate can stop later turns; retain the entire planned
schedule with reasons. No recovery replaces a primary answer. A later explicitly
authorized recovery uses a separately registered supplementary execution with
links to the failed original and its own model/settings/status; exclude recovery
from primary denominators. Do not silently change the model, deadline, order or
retry policy to complete a study.

## Review and reporting

Use runtime-scoring-protocol v1 exactly as frozen in the plan. Generate partial-
masked exact-answer packets only for successful executions; publicly recomputable
IDs and exposed inputs mean no blind-review claim. Reviewers record identity,
method, exposure, answer digest, exact excerpts and rationale. First-pass notes
precede rubric consultation; use frozen rubric IDs for final annotations. Two
actual submissions may use the existing explicit comparison/adjudication tooling;
never manufacture a second human reviewer. Unresolved disputes stay pending and
are reported, not resolved by selecting a convenient reviewer.

Primary pairing requires all three executed and annotated arms for a case and
repetition. Executed incomplete answers stay eligible. Failed, absent or pending
reviews exclude the triplet; list every exclusion. Report full **81-turn execution
coverage and 27-triplet coverage**, individual-arm denominators, then paired
counts/rates for completion, assessment correctness, issue recall/false negatives,
protected false defects, unresolved certainty errors, evidence completeness,
severity (including absent labels), and supplementary concerns. No composite
score. Zero denominators are null. Never call repetitions independent cases.

Report A/B/C differences descriptively, with case-level tables and all raw answers
and events/hashes. No significance or general-benefit claim is prespecified for
nine exposed synthetic cases. Simulated historical drills are workflow checks,
not extra model observations or efficacy evidence. Human fixture review does not
make this set independently authored or privately held; book mapping stays
unverified unless separately documented. Historical RT results remain unchanged.
