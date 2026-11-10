# Broader diagnostic benchmark, revision 1

This is an additive, public development suite: 18 cases in six families. It does
not replace the frozen 36-case hard runtime suite or amend any historical scores.
It is not a perfect benchmark or an empirically calibrated harder benchmark.

Run `node evals/research/runtime/benchmark-v2/cli.mjs validate` and
`node --test evals/research/runtime/benchmark-v2/suite.test.mjs` offline.
`reproduce` prints actual fixture observations; `export BV-01` emits only five
model-visible files under canonical basenames. `freeze` intentionally regenerates
evidence and digests after an audited source change, before model responses exist.
The freeze also pins the reused path/import utility from the earlier suite.

See [design and limits](../../../../docs/research/runtime-benchmark-v2.md).

## Boundaries

Fixtures are deterministic JavaScript abstractions, not real brokers, databases,
OS processes or adversarial network isolation. The import scanner checks a
restricted authoring language, not arbitrary JavaScript safety. Trusted authored
fixtures execute in the local process. Export only the allowlist into a separately
reviewed live executor; never expose this source repository to a tested model.
The existing HC live runner is not wired to these IDs. No model call is made here.

Rubrics admit any causal witness supported by visible inputs. Unknown findings
require evidence adjudication and are not automatically false positives. The
annotation aggregator computes issue counts after review; it does not judge prose.
A top-level correct assessment alone does not demonstrate complete issue recall.

Unresolved cases deliberately retain the same implementation as their defective
peer while omitting the decisive environmental contract. Recorded observations
use a restrictive completion, not secret ground truth the model must guess. The
rubrics name compatible permissive completions. All six drivers execute both completions and record their observations. Some
alternatives change the required contract or permitted histories rather than
magically fixing the supplied code.

All cases are synthetic, public, same-workflow authored and not independently
human-reviewed. Two complete families are calibration; four are development-
reserved. These names denote a tuning policy, not private custody or independent
sampling. Six families, not 18 prompts or repeated responses, are the new units.

The six unresolved handoffs were revised after offline QA to reduce directly
spelled-out answers. `prompt-cue-audit.json` pins their exact context bytes, retained
facts and residual cueing limitations. Hash/copy checks do not establish semantic
blindness or empirical model discrimination.
