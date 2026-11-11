> **Superseded preflight:** this stage record predates the collector correction. Its b7056c… freeze was never executed and is retained separately. The current revision-2 freeze is `2e12919522ab7fb0bdc315823e4f900456506f0dfc463c7034b68504b7af6672`; see collector-fix-summary.md and the final QA record.

# Three-skill revision eval preparation — complete

No live calls or commits by this stage. All old frozen files and historical result
values remain unchanged. Three guide changes belong to the author stage.

## Owned changes

- New `evals/research/skill-revision/`: immutable original baseline anchor,22case
  suite,6newboundary cases and witnesses/tests, paired runner, evidence-backed
  report, prospective review policy,132turn frozen plan, offline witness record.
- `package.json`: `evals:skill-revision` plus its inclusion in full `npm test`.
- `evals/research/campaign-history.mjs`, campaign-plan CLI/test adaptation: explicit
  offline historical verification pinned37fd5a2. Old current-source live gates are
  unchanged and reject the original freeze after guide changes.
- Historical result README: pinned checkout instructions only, no score changes.
- `docs/research/skill-revision-study.md`: design,budget,interpretation,commands.

## Frozen study

Anchor: b7056c0938aaa3afc52cb87eda300fb95fa1d618a2023e68076265f6b15ce164

16historical cases +6new authored regression boundaries;22cases×2arms×3repeats=132.
A=original supplied guidance from37fd5a2 baseline; B=revised supplied guidance.
Neither is a no-skill arm. Original inputs and equal task rules per pair, rotated
order. Cohorts separate; no independent holdout or difficulty claim.

Budget:132primary calls,0automatic retries,180000ms/turn,28800000ms/study,
5000000 observed-token admission stop. First failure/missing usage stops and
preserves132scheduled denominator. One-turn token overshoot remains possible.
Original policy-specific arbitrary witness wording preserved in originalRubric;
active prospective AS01/AS04/AS35 equivalents versioned explicitly. No old gold
or scores rewritten. Sweep is a bundled guide change, including revised review.

## Verification

-9/9 new offline tests PASS, including all132fakeCLI turns and reconstruction,
  exact raw receipts/model identity/masking,no overwrite/no implicit live route,
  rehashed drift rejection,wrong-model and missing-usage stop,token-stop overshoot,
  six fixture witnesses, JSON/authority/behavior failure controls, cohort metrics.
-4/4 historical tests PASS: pinned source/content/byte consistency and mutation
  rejection, current-source live registration still rejects historical drift.
-`npm run evals` PASS64; `npm run validate` PASS; `git diff --check` PASS.
-Health witness cross-checks the existing calculation helper against independent
  literal expected values and records exact expected fractions9450/100 and6950/75.
  Root independently checked their rounding95 and93; unknown-dimension totals
  remain hypothetical. This wording was corrected during QA.
-Offline witness record is explicitly not model evaluation.
-Logs: revision-targeted.log,revision-evals.log,revision-validate.log in this folder.

Full consistency-QA still required before live execution. Freeze hashes source
contents, not the uncommitted HEAD. Commit preparation after QA, then record that
candidate commit separately in execution metadata.

## Commands for parent

`node evals/research/skill-revision/runner.mjs validate evals/research/skill-revision/frozen-full.json b7056c0938aaa3afc52cb87eda300fb95fa1d618a2023e68076265f6b15ce164`

Registration config fields: frozen(fullobject),anchor,model=gpt-6.1-terra,
effort=low,cliVersion=0.167.0,authorization(userselection+QAprovenance),inheritProxy
optional only explicitly documented. No API key. Existing hardened auth-only
ChatGPT-login adapter is unchanged. CandidateCommit belongs in separate metadata.

`node evals/research/skill-revision/runner.mjs register CONFIG NEW_REGISTRATION`
`node evals/research/skill-revision/runner.mjs run REGISTRATION REGISTRATION_SHA NEW_RUN_DIR --live`
`node evals/research/skill-revision/runner.mjs verify RUN_DIR`
`node evals/research/skill-revision/report.mjs RUN_DIR ANNOTATIONS NEW_REPORT`

Run exports shuffled review-packets.json plus separate private mapping. Score each
completed answer with exact-quote annotations using frozen policy; no judge calls
are automatic. Report emits source identity,all/cohort per-skill summaries,paired
results and scored rows. Execution failures remain separate from semantic failures.

Author guides,old freezes and scored results are not edited by this eval stage.
