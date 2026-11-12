# All-skills benchmark registration with v3 transport

The prospective collector uses the successful v3 live scorer probe and the
existing frozen schedule of 108 responses. The schedule covers 36 cases across
case-only, generic-checklist, and supplied-skill arms. Scoring and review packets
use the original frozen rubrics. The prior collector and archive replay retain
their original entry point.

The new collector pins the successful probe plan, original record bytes and
verdict bytes by digest. It rechecks the scorer receipt, the exact final report,
the model and effort, the CLI and code-mode host binaries, the adapter source,
ChatGPT login and the absence of an observed retry. Registration, initial live
admission and every live turn check the proxy environment against the probe
fingerprint. Replay checks the retained evidence without reading the current
proxy. The CLI stops collection on the first failed turn, observed transport
retry, missing token usage, or exhausted budget. The runner records prior
answers and the remaining not-run slots.

## Prepared registration

The local preparation file is `_workspace/campaign-v3-ready/registration.json`.
The tracked [registration receipt](skills-benchmark-v2-transport-v3-registration.json)
records its anchor and inputs. Preparation reads existing evidence and writes
the registration without issuing a model request. The assessor description
specifies same-workflow review with answer excerpts and the sealed rubrics.

The proposed limits are 108 submissions, 5,000,000 observed tokens, eight
hours overall, and 120 seconds per turn. The observed-token check runs before
admitting each turn and can overshoot by one turn. A CLI retry may already have
started when its notification arrives. The collector makes no automatic
resubmissions. Cleanup is bounded separately. These limits measure client
activity and observed usage.

From the repository root, recreate a registration in a fresh local path if
necessary. Supply the complete pinned Codex CLI 0.167.1 binary path as
`ABSOLUTE_CODEX` and use the same assessor string to reproduce the prepared
registration on the same machine.

```sh
node evals/research/skills-benchmark-v2/campaign-v3.mjs register ABSOLUTE_CODEX 5000000 28800000 120000 'Same-workflow semantic review after collection using the sealed rubrics and answer excerpts' NEW_REGISTRATION
node evals/research/skills-benchmark-v2/campaign-v3.mjs verify-registration REGISTRATION ANCHOR
```

The live command requires separate authorization. The collector binds
`gpt-6.1-terra / low` through the retained probe.

```sh
node evals/research/skills-benchmark-v2/campaign-v3.mjs execute REGISTRATION ANCHOR NEW_OUTPUT --live
node evals/research/skills-benchmark-v2/campaign-v3.mjs verify OUTPUT
node evals/research/skills-benchmark-v2/campaign-v3.mjs review OUTPUT ANNOTATIONS NEW_REPORT
```

## Offline verification

`npm run evals:skills:transport:v3` covers the retained real credential, forged
evidence, proxy drift, registration admission and a full 108-turn fake-CLI
collection with readback and annotation aggregation. Additional controls retain
107 not-run slots after an observed retry, wrong model, missing usage, or exhausted
token admission budget. The previous probe provides the live evidence. This
preparation and regression suite consume no live model calls.
