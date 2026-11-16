# Documentation audit after the bounded product merge

Baseline: merged product commit d6e58c7 (PR #46 and version preparation).
Historical audit context: v1.10.0 was withdrawn and the version decision was
pending when this documentation rewrite was made. The maintainer later selected
2.0.0; see [current readiness](next-release-readiness.md). This historical audit
did not run models or authorize publication.

## Diagnosed drift and remedies

| Symptom | Source | Consequence | Remedy |
| --- | --- | --- | --- |
| README promoted 94% versus 16% as an overall capability result | Historical three-scenario formatting comparison | Formatting compliance is confused with diagnostic accuracy and recent evidence | Replace with parser/product/behavioral evidence separation and the bounded 36-response adjudication |
| Example claimed 28/100, omitted findings and inferred unseen responsibilities | Old illustrative snippet and report | Readers cannot reproduce the score or verify the asserted scope | Remove the incomplete example rather than fabricate a full truth set |
| Roadmap called v1.4 current | Legacy milestone copy | Product state appears years behind merged behavior | Describe six actual workflows and link changelog for history |
| Health always promised a score; sweep implied unlimited Critical rounds or blanket multi-file approval | Pre-merge wording | Users receive false expectations about uncertainty, authorization and stopping | Describe one ledger, unassessed versus skipped, exact-byte delivery limits and all-round budgets |
| Any Agent Skills host was promised full behavior | Installer layout compatibility generalized to runtime | Copy success appears equivalent to verified host behavior | Codex-focused maintenance scope; retain other integrations with historical limits |
| 1.10.0 source pins looked published after withdrawal | Shared source version and Action template | Readers could invoke a nonexistent release | Label source version as pending; distinguish published1.9.1 from main; label Action template non-runnable until publication |
| Main README was a long marketing/manual mixture | Repeated platform, API and historical details | Core workflow selection and current evidence were buried | Rewrite all six languages around install, scope, reports, evidence and limitations |

## Source basis

- `skills/_shared/common.md` and `source-coverage.md`: configuration, report
  obligations, twelve books and risk vocabulary.
- Six shipped skills and their guides: focused scopes; health ledger and
  unknown-dimension rules; sweep authorization and bounded stopping.
- `scripts/install.sh`, npm installer mappings and package files: installation
  layout, copied health resources and published/source distinction.
- `docs/runner-contracts.md`, runner implementation and fixture validation:
  historical API review versus interactive execution; offline versus live checks.
- Research commit `17bd333`, focused recovery adjudication: review/audit B=C6/6,
  test B5/6 C6/6; one reused paired advantage and post-run review limitations.

## Related surfaces

The landing page's benchmark and publication labels, historical gallery framing,
contribution guidance and Action-template warning are synchronized in the same
change. Historical examples are labeled as history rather than rewritten to look
like fresh measurements. No new host compatibility or pricing claim is introduced.
The README retains `benchmark` and `installation` anchors for website links.

## Validation boundary

Repository consistency checks cover versions, required source names and platform
links; they do not establish translation quality or semantic truth. QA must also
read the rewritten documents against the source contracts and check local links.
The live model and publication holds remain in force.
