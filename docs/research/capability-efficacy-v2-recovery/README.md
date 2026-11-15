# Efficacy v2 preflight recovery

This additive recovery preserves the original 72-row schedule, rubrics, generic checklist B and full static skill C, model `gpt-6.1-terra / low`, CLI `0.169.0`, and all candidate isolation settings. The original stopped attempt submitted zero model requests. Its report and diagnostic transcription are hash-bound; no historical artifacts are changed.

The recovery permits 72 model submissions, 10,000,000 observed tokens, a fresh six-hour collection window and 120 seconds per turn. The prior admission preflight duration was not instrumented: this is explicitly a new collection window, not a claim of cumulative six-hour wall time. The inherited collector starts its clock after admission checks. Token admission may be crossed by the final admitted turn; observed tokens are not billing. No automatic retry or implicit resume is permitted. Any admission or collection failure stops; review only completed answers. Zero submissions yield no skill-effect estimate.

Run only after renewed user authorization, from an execution environment authorized to access the Docker socket. Never loosen the no-network, read-only, non-root, resource-bounded candidate container policy. The wrapper saves its recovery plan before Docker inspection and preserves exceptions even if the inherited collector fails before creating its own directory. The original collector still rechecks toolchain, proxy, parent freeze and both real-smoke prerequisites. Every model call remains under the unchanged frozen admission and stop rules. A socket-access failure is not evidence that the pinned image is absent. The new wrapper does not repair Docker or retry it.

Offline preparation:

```sh
node evals/research/capability-efficacy-v2-recovery/plan.mjs validate
node --test evals/research/capability-efficacy-v2-recovery/protocol.test.mjs
node --test evals/research/capability-efficacy-v2/protocol.test.mjs
```

Future authorized execution (not run while preparing this recovery):

```sh
node evals/research/capability-efficacy-v2-recovery/runner.mjs execute _workspace/capability-efficacy-v2-recovery-live --live
node evals/research/capability-efficacy-v2-recovery/runner.mjs verify _workspace/capability-efficacy-v2-recovery-live
node evals/research/capability-efficacy-v2/review.mjs packets _workspace/capability-efficacy-v2-recovery-live/campaign NEW_PACKETS.json
node evals/research/capability-efficacy-v2/review.mjs assess _workspace/capability-efficacy-v2-recovery-live/campaign ANNOTATIONS.json NEW_REPORT.json
```

Archive the entire envelope (including admission failure when no campaign exists), raw responses, identity/usage and isolation records. Apply the original quote-bound manual rubric and unresolved gates. No raw answer exists for the prior failure. Four authored development families remain non-independent holdouts; health/sweep findings cannot establish efficacy of all six skills. The previous six-call protocol success only demonstrates requested receipt/delivery lifecycle behavior, not diagnostic improvement.

Use the `verify`, `packets` and `assess` commands only when the campaign directory and its completed execution record exist. A preflight-only stop has no campaign; inspect and archive `admission.json` and `recovery-plan.json` instead. Offline injection tests exercise admission and collector failures and successful single dispatch without starting any model.
