# Six-skill repository retest

This preregistered comparison uses the shipped guidance on main at
`5e2d4b92e8e11a0af7e0da6fc074a13b3cf9288c` (PR #50 merged). It asks whether
each workflow improves a concrete outcome over a general engineering checklist
on two distinct repository tasks. The development fixtures are synthetic,
maintainer-authored and new to this campaign. They are not external repositories,
independent holdouts or a representative sample. Each has executable or
inspectable evidence, a scoring key and a protected behavior or uncertainty
control. See [case provenance and inventory](cases/README.md).

| Workflow | Case 1 | Case 2 | Outcome of interest |
| --- | --- | --- | --- |
| Review | Invoice boundary | Webhook dispatch | Attribute new behavior to the change while retaining inherited context |
| Audit | Cart modules | Job startup | Trace source imports and runtime paths separately |
| Test | Batch quota | Exit gate | Find a witness that discriminates behavior and distinguish assertion failure from coverage |
| Debt | Dispatch upkeep | Surcharge changes | Select actionable repayment using burden and ownership evidence |
| Health | Catalog checkout | Billing excerpt | Score supported scope, expose missing evidence and deliver the exact verified report |
| Sweep | Grant revocation | Primary export | Apply a scoped repair that passes a targeted check and preserves unrelated state |

## Execution

- **Model:** `gpt-6.1-terra`, reasoning `low`, native Codex CLI `0.169.0`
  via ChatGPT login. The frozen executable, companion and proxy digests must
  match at admission. The CLI confirms model and effort per turn. Backend
  identity and billing are not independently attested.
- **24 maximum model turns:** six skills × two cases × two arms × one attempt.
  Paired cases are adjacent and the order reverses for the second family within
  each skill. Every turn starts a fresh private session. Scoring uses saved
  evidence with no extra collection or judge requests.
- **Limits:** 1,500,000 cumulative CLI-observed tokens, 90 minutes for the
  collection loop, per-turn limit 150 seconds including setup after spawn until
  turn deadline, plus bounded teardown. The runner leaves 55 seconds of total
  time for cleanup and final replay. Token admission stops after reaching the
  observed limit. The last turn can cross it, missing usage stops the run, and
  observed tokens are not a dollar quote. Each turn has a 40-request workspace
  allowance. Tool substeps in one turn may involve provider requests.
- First execution/verification failure, observed transport retry, missing
  usage, failed isolation or budget exhaustion stops further submissions.
  Ctrl-C and SIGTERM stop collection after process cleanup and evidence capture.
  No automatic reattempt, no network fallback. Preserve completed and failed
  evidence with the attempt order. Built-in transport behavior may start a
  retry before notification. The runner stops on that notification. A new plan
  and explicit approval are required to resume a stopped run.
- Both arms receive identical task text, repository files, tool schema,
  mutation scope, scoring helper and time limits. The generic arm receives
  [the checklist](generic.md). The skill arm receives the applicable main
  `SKILL.md`, guides and shared rules as static prompt text. Sweep guidance
  includes its dependent workflows. This does not measure native skill discovery.
- The workspace tool serves task files by path and, for Review, a changed-path
  inventory and the base snapshot. It can write only the Health deliverables or
  the specific authorized Sweep source file. Model-authored code runs only in a
  disposable Docker replay with a read-only input mount, no network, a
  non-root user, resource limits and verified removal. The model does not get a
  native shell or the private oracles. Authorizations and failed write attempts
  are visible in the review packet. Health gets the shared shipped deterministic
  scorer; the latest ledger, receipt and report bytes must match the delivery.
  The scorer does not validate diagnosis or report prose. Sweep gets the same
  scorer if a dashboard is needed, plus isolated post-turn patch replay. The
  replay is evaluation evidence, not execution performed by the model. The
  probes assume non-adversarial submissions and cover only declared behaviors.

## Grade before opening the arm mapping

1. Verify archived records and produce randomly labeled packets. Review answer,
   repository source, edits, workspace tool trail, frozen criteria and
   mechanical replay evidence. Record the reviewer and an evidence reference for
   every criterion. Keep the mapping separate until grades are complete. Blind
   labels conceal the arm field, though report style may reveal it. The reviewer
   can be the project agent and is not assumed independent.
2. Mark each criterion pass/fail, citing code, a contract, the answer or
   execution evidence. Host probe failure or a mismatched Health receipt rules
   out a pass on the affected criterion. A successful oracle alone is not
   credit for diagnosis or for tests the model claimed to have run. Accept
   equivalent in-domain witnesses and fixes. Use unavailable only for lost
   evaluator evidence. Missing required response content or a bad proposed
   patch fails the criterion. A completed answer with no Docker infrastructure
   evidence can still be documented, but its pair is incomplete in the primary
   comparison.
3. One miss is one failed expected criterion. Count each distinct confirmed
   incorrect defect or action claim once as a false positive, including a
   guardrail violation that asserts a false issue or proposes a conflicting
   change. Leave additional justified findings unpenalized. Track guardrail
   failures separately, including omitted protections without a false claim.
   No score for branding, book names, risk labels, report voice or having more
   findings.
4. Strict pass requires every expected, guardrail and delivery criterion and
   zero confirmed false positives. Report per-arm strict passes/reviewed,
   expected misses/expected total, false positives and guardrail failures for
   each skill, plus paired outcomes. The primary gain signal requires skill-only
   passes on both distinct families. A single family win with no loss is a
   narrow signal, a win and loss is mixed, and identical pass outcomes on both
   cases are ties (show whether both passed or failed). Regressions receive the
   symmetric treatment. An incomplete pair makes that skill's planned comparison
   incomplete. Do not pool unrelated skills to claim efficacy. Two cases and
   one repetition cannot estimate a population effect or reliability.

## Commands

From the root of this branch:

```sh
node evals/research/six-skill-retest/plan.mjs validate
node --test evals/research/six-skill-retest/protocol.test.mjs
node evals/research/six-skill-retest/oracle-drill.mjs
node evals/research/six-skill-retest/native-drill.mjs
```

The last two are offline. They use the pinned Docker image and a loopback-only
fixture upstream, respectively. The native drill does not exercise the real
account route and cannot establish access to the production model.

After separate live authorization, in the matching macOS environment with
network access, the frozen CLI, a valid ChatGPT login and Docker ready:

```sh
mkdir -p _workspace
node evals/research/six-skill-retest/runner.mjs execute _workspace/six-skill-live --live
node evals/research/six-skill-retest/runner.mjs verify _workspace/six-skill-live
node evals/research/six-skill-retest/grade.mjs packets _workspace/six-skill-live _workspace/six-skill-grades
node evals/research/six-skill-retest/grade.mjs score _workspace/six-skill-live _workspace/six-skill-grades GRADES_JSON
```

Archive reviewed raw records and scoring only after checking them for unintended
account, host and credential details. Run directories stay under ignored
`_workspace/` pending that review. Keep simulation and live records separate.
The release and prior evaluation archives are outside the scope of this branch.
