# Retention and release decision after the focused comparison

## Decision boundary

Stop expanding this experiment. Retain review, audit and test as focused user
interfaces; do not advertise demonstrated general superiority to a checklist.
Six cases per mode from reused development families cannot establish that claim,
nor does a tie establish that a skill is useless. The instructions offer a
portable workflow and consistent reporting, whose user value is distinct from
this experiment's incremental diagnostic accuracy. No live run is required for
adjudicating existing evidence or preparing a release.

Review and audit tied the generic checklist in the initial primary assessment.
Keep their recent concise guidance; there is no observed failure warranting
another prompt rewrite here. The append-only adjudication resolves the overflow finding as supported and
accepts the equivalent assertion-failure witness. Test now has B 5/6 and C 6/6,
with one paired advantage; that supports retention but not a general superiority
claim. See results/2026-11-16-live/adjudication/README.md. Preserve the
original annotation and report. Any corrected interpretation is a post-run
adjudication, not retroactive pre-registration or independent validation.

Further changes should respond to reproducible user failures, not repeatedly
optimize the same six families until the desired result appears. Request a
separately budgeted live test only for a substantive new behavior change that
cannot be checked offline. Benchmark uncertainty alone is not a release blocker.

## Concrete route to main

At decision time the local `origin/main...HEAD` comparison contains 8,106 changed
files, mostly research artifacts, plus changes to shipped skills, deterministic
health tooling, configuration, tests and runner contracts. This is a local remote
tracking snapshot, not evidence of a freshly fetched main or green remote CI.
Do not treat a passing research branch test run as an audited release candidate.

1. Prepare a bounded integration candidate from up-to-date main. Inventory every
   shipped change and dependency; preserve all research history on this branch.
   Either include the archives deliberately or carry only the reviewed product
   changes plus required tests and link the archives. Do not blindly cherry-pick
   skill Markdown without its shared contracts and health tool dependencies.
2. Review that concrete candidate and run validation, unit tests, structural
   evals and parser fidelity. Reconcile installation/runner documentation and
   public claims. Existing live evidence may be cited with its limitations;
   another model campaign is not a mandatory merge gate.
3. Complete the repository release checklist: audit all commits since the last
   release, choose version from the actual unreleased scope, synchronize all
   manifests/translations/examples and changelog, and verify GitHub metadata.
   Push the exact candidate and wait for its complete Validate matrix; run
   `npm run release:ci`. Tags/publication require an explicit release request.

The next milestone is a reviewed integration candidate, not another benchmark.
A release can follow that candidate's required CI and release checks; no arbitrary
number of additional model runs or statistical superiority threshold is imposed.
No main merge, tag, or publication is performed by this research decision.
