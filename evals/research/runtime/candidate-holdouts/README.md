# Offline candidate cases, revision 1

These nine original synthetic programs are **non-independent development
candidates**, not reserved independent holdouts. They were prepared on 2026-11-06
by an agent in the same research workflow, exposed to existing fixtures, model
answers, scoring disputes and prototype guidance. Contents and rubrics are public;
there is no separate custodian or withheld outcome. Human review is pending,
book/source mapping is unverified, and the repository MIT license applies.
No live model test has been run on these cases in this task.

New identifiers, different code structure, hashes and separate directories do not
make authorship independent. These candidates can exercise the prospective
[scoring protocol](../../../../docs/research/runtime-scoring-protocol.md) and
future ingestion, but cannot satisfy the
[independent holdout gate](../../../../docs/research/runtime-review-and-holdouts.md).
Once used to tune guidance they remain exposed development material. A genuinely
independent set still needs a separate author, exposure disclosure, private
custody, frozen inputs/outcomes and review of the custody boundary.

## Cases and assessment criteria

| Family | Defect / protected / unresolved | Controlled observation and criterion |
| --- | --- | --- |
| Abort while asynchronous setup yields | HC-01 / HC-02 / HC-03 | Abort occurs while a real awaited gate is pending. The defective function starts one operation after cancellation; the protected function rechecks before acquisition and starts zero. Unresolved HC-03 omits whether pre-admission cancellation invalidates later work. |
| Child rejection after lease acquisition | HC-04 / HC-05 / HC-06 | On asynchronous rejection one slot remains versus zero. The protected function releases before response settlement and preserves the error identity. Unresolved HC-06 omits whether this function or an outer scope owns rejection cleanup. |
| Superseded completion and replacement reservation | HC-07 / HC-08 / HC-09 | Completing the older generation removes the replacement's key in the defective implementation, allowing another same-key admission. Identity-checked release preserves the current reservation. Unresolved HC-09 omits whether the map is an exclusion authority or a diagnostic index with permitted omissions. |

Every defect rubric requires one bounded causal issue and allows Warning severity;
absence of a severity label is recorded separately. Each protected control meets
only its supplied lifecycle/admission contract. Unresolved rubrics require the
missing artifact and explicit alternative contract-dependent judgments. Private
countermodels in `candidates.test.mjs` execute the same visible implementation and
compute opposite contract outcomes. They are evaluator evidence, never hidden
facts about the missing caller. HC-06's outer-owner countermodel actually invokes
the release hook and verifies cleaned capacity and preserved rejection.

Cancellation during an awaited setup gap is possible within JavaScript's actual
execution order; no parallel interleaving is invented inside a synchronous block.
The registration tests measure occupancy/listeners before artificial teardown,
then invoke completion to leave no test pollution. Rejection tests measure before
explicit release; retained capacity here is not a demonstrated permanent leak.
The generation case distinguishes the old live handle from the current reserved
generation and makes no production concurrency or whole-process claim.

## Files, boundaries and offline evidence

`cases.json` is a separate fixed nine-case manifest. `digests.json` freezes the
SHA-256 inventory of that manifest, all service/context/task inputs, shared
controls and separate rubrics. Paths are root-relative regular files; the
validator rejects traversal, symlinks, digest drift, kind drift, independence
claims and rubric/test inclusion in visible inputs. Public does not mean model
input: a future reviewed ingestion must copy only each case's exact `inputs`
whitelist. Rubrics, tests, manifests, digests, expected observations and this
README are outside that whitelist. These are not secret from the author or users.

The existing RT-01–RT-43 manifest, its revisions, historical plans/results and
runtime prototype revision 2 are unchanged. The current live runner deliberately
does not accept HC identifiers. Do not bypass its validator or rename candidates
to accepted RT identifiers. Integrating them would need a separate implementation
review and fresh plan/rubric/guidance/scoring digests before any authorized run.

Run all prepared-material checks without model calls:

```bash
npm run evals:runtime:prepared
```

Reproduce the committed controlled observations:

```bash
node evals/research/runtime/candidate-holdouts/reproduce.mjs > /tmp/runtime-candidate-evidence.json
diff -u evals/research/runtime/candidate-holdouts/offline-evidence.json /tmp/runtime-candidate-evidence.json
```

`offline-evidence.json` records every case's occupancy/status/admission at the
probe and after explicit driver teardown. Tests additionally cover pre-abort,
failed setup, normal completion, running cancellation, cancellation-shaped child
rejection, overload, idempotent cleanup, different keys, and reversed completion
order. Each protected criterion rejects the defective peer as a replacement of
its causal mechanism; these three mutation controls show the criteria distinguish
this fault, not arbitrary model correctness. Saved observations reproduce from
execution, not a model response or prewritten verdict.

Any input or rubric revision must update the inventory deliberately and preserve
an already completed study's frozen copy. There is no completed study for this
candidate set. Passing offline checks establishes only the controlled code paths,
artifact consistency and scorer arithmetic; it is not human validation, book
verification, holdout independence, model benefit or release readiness.
