# Offline follow-up to the completed efficacy comparison

## Evidence and interpretation

The immutable [completed report](results/2026-11-15-complete/REPORT.md) compares a
generic checklist (B) with the static full skill bundle (C), using 72 answers from
four authored development families. Health passed B 15/18 and C 10/18; sweep passed
B 15/18 and C 18/18. Expected-issue recall was complete in both arms. These are
clustered development cases, not independent projects or native skill-discovery
trials. No overall practical lift was established. Historical answers, annotations,
score ledgers, failures and frozen inputs remain unchanged by this follow-up.

## Health: over-abstention diagnosis

- **Symptom:** Eight C responses withheld bounded dimension assessments despite
  complete local inventories and governing facts. Seven questioned Architecture
  and/or Debt; one questioned Test. For example, response
  `8a07f1589c2f011e1fdbb8c8` says the input “supplies no architectural boundary
  obligations sufficient to assess architecture,” although the input explicitly
  lists both independent adapters, their shared policy, and complete local
  architecture and maintenance inventories. Response `bd379cce15a148871eb138bf`
  withholds Architecture and Debt despite explicit independent regional policies.
  Their quotes and input references are retained in
  [new annotations](results/2026-11-15-complete/annotations-new.json).
  The six earlier failures (`0ca05720f88125ded9458718`,
  `371cfcaac238ef3adc0a02d5`, `45ab65c3cb7c060bff9d3698`,
  `53690b54501df4281a518cef`, `6e4b1724d60c74c323672ccb`,
  `83c5b0e056ad909157deb6d4`) are retained in the
  [original annotations](../capability-efficacy-v2-recovery/results/2026-11-15-stopped/annotations.json).
- **Source:** The health guide already allowed bounded assessment, but interleaved
  that allowance with repeated admission warnings and a Debt checklist saying
  “across the codebase.” Its Architecture checklist requested top-level context
  without explicitly qualifying the requested boundary. The answers repeatedly
  ask for broader policy after acknowledging the local inventory. This supports
  a plausible instruction conflict/weighting hypothesis, not proof that one
  sentence caused the behavior; the prior experiment did not isolate that variable.
- **Consequence:** Supported local findings survived, but dashboards unnecessarily
  lost dimension scores and the composite. This is a scope/status failure, not
  missed-issue recall. Relaxing all abstention would create the opposite error:
  unsupported clean scores for incomplete inventories or unknown ownership.
- **Remedy:** Replace the overlapping gate paragraphs with one scope-first status
  table and explicit local-sufficiency rules. Scope Architecture and Debt checklists
  to the declared boundary. Do not require a separate policy document when source,
  complete inventory and responsibilities already permit that local scan. Keep
  genuine unknown ownership and incomplete tests unassessed. Missing Test evidence
  must not erase completed Architecture or Debt assessments. Preserve causal
  deduplication, the single ledger, deterministic finalization and suppression of
  an incomplete composite. The current health guide is changed; the additional
  deterministic guard discovered during regression is described below.

The B arm's three health failures double-counted one ownership cause. The C arm
already avoided this; the one-causal-owner rule is retained, not relaxed in pursuit
of higher coverage. No new risk code or severity rule is introduced.

## Deterministic duplicate-ID regression

- **Symptom:** A new offline regression entered the same explicit finding ID in
  Architecture and Debt and the scorer deducted it in both dimensions.
- **Source:** `calculateDashboard` created its ID set inside the per-dimension
  mapping, so its duplicate check did not cover the full ledger. This is directly
  reproduced offline, unlike the instruction-following hypothesis above.
- **Consequence:** One explicitly identified finding could be counted twice even
  when the report used the prescribed stable IDs and the score receipt was valid.
- **Remedy:** Enforce finding-ID uniqueness across the entire ledger, including
  the supplied-ledger form, and document the scope of the check. Keep per-risk
  caps scoped to Debt. Distinct IDs still require semantic review: this guard
  neither proves independent causes nor automatically merges findings.

## Sweep: bounded advantage, no demonstrated repair defect

- **Symptom:** C passed all 18 sweep answers and B passed 15. The three paired
  differences are repetitions of the insufficient-policy priority-routing case.
  B asserted an allowed selection rule without the governing policy; C retained
  uncertainty and blocked that repair. Both arms passed all six eligible repair
  probes across the two sweep families.
- **Source:** Current sweep Step 6 distinguishes a missing fact that changes the
  requested conclusion or repair from unrelated dashboard incompleteness. Shared
  contract rules prohibit choosing between competing policies without evidence.
  The observed advantage is consistent with those instructions, but does not
  isolate their causal contribution from the rest of the static bundle.
- **Consequence:** There is evidence for handling one ambiguity family, not for
  broadly superior repairs, project-wide convergence, or safe editing under all
  conditions. Turning every missing fact into a blocker would regress the earlier
  bounded-work safeguard; accepting an unspecified policy would lose this benefit.
- **Remedy:** Preserve sweep behavior and its existing material-blocker rule.
  No sweep instruction change is justified by this completed sample. Exercise the
  health change's effect on sweep's final dashboard in offline regression, while
  retaining separate scoped-work disposition and dashboard status.

## Historical verification isolation

- **Symptom:** The first full offline QA run failed at the retained v3 probe
  source check after the scorer correction. The published proof hashes the old
  scorer, while the test loaded today's implementation.
- **Source:** The v3/v4/v5 retained-proof tests imported current files; existing
  historical HS/v5 wrappers restored Markdown only. Their historical source
  assertions therefore correctly rejected the changed scorer.
- **Consequence:** A valid prospective fix made historical validation fail. Removing
  the hash gate or resealing old evidence would hide the distinction between the
  implementation tested then and the implementation shipped now.
- **Remedy:** Add an offline-only temporary snapshot wrapper with the exact original
  scorer bytes pinned to the existing historical hash. Reuse the established HS
  Markdown snapshot extraction; extend v5 historical replay to restore that scorer.
  Original test suites, frozen plans, receipts, answers and result hashes remain
  unchanged. A current v4 prose-contract assertion follows the revised missing-
  ownership wording while retaining the actual abstention requirement.

Only offline test commands use the historical helper. No real registration or
collection code imports it, and stale live prerequisites still fail closed against
current source. Regression explicitly checks that rejection, current simulation
source binding, snapshot corruption rejection and fixed test-group admission.
Historical replay is not authorization to run a current model campaign.

## Verification boundary and next live decision

Offline checks can verify instruction contracts, scorer arithmetic/status rules,
existing orchestration regression cases and historical snapshot integrity. They
cannot demonstrate that a model follows the revised scope rule or that behavioral
pass rates improve. Do not reinterpret the historical scores as post-fix results.

A later explicitly approved comparison should retain the generic checklist arm,
freeze the revised bundle, and include complete bounded inventories, genuinely
missing ownership, incomplete assertion bodies, and contradictory inventory claims.
Keep causal deduplication and sweep's material-policy stop cases as regression
controls. Prefer new domains and changed surface forms over only replaying the
failed examples; label project-authored cases as development cases. Freeze model,
call count, token/time budgets and stop rules before any real-model execution.
This follow-up does not authorize or start that execution.
