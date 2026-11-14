# Scope and scoring correction after 42 answers

## Diagnosis before changes

Evidence: `../health-sweep-recovery/results/2026-11-14-budget/REPORT.md`, `annotations.json` and the retained raw archive. The 42-answer assessment and all historical frozen files remain unchanged. This work makes no live model request.

- Health — Symptom: all six skill-guided health reports assigned Debt 100 despite absent maintenance evidence; three checklist reports did likewise. Source: the guide allowed complete local assessments but did not require an explicit admission decision separating behavior/test evidence from maintenance or architectural evidence. Consequence: assessed empty lists turned unknown dimensions into clean scores. Remedy: require dimension-specific evidence before an assessed status, reject post-hoc narrowing merely to obtain 100, and retain observations unscored when their dashboard owner cannot be assessed.
- Sweep — Symptom: all three skill-guided protected-domain responses chose verification-blocked because unrelated broader dimensions were unknown. Source: the five-pass workflow and “required scope” language did not clearly distinguish work scope from dashboard completeness. Consequence: an established local clean assessment was blocked by irrelevant missing information. Remedy: explicitly separate requested obligations, necessary verification and broader reporting limits; require a causal link from missing evidence to the requested conclusion or repair safety.
- Evaluation contract — Symptom: six checklist answers were semantically complete but lost strict credit for omitted finalizer receipts despite public optional-tool wording. Source: public instructions and frozen strict endpoints disagreed. Consequence: strict arm differences conflate task completion with an undisclosed requirement. Remedy for the next freeze: declare required tool use equally to both arms, or make genuinely optional use independent of primary completion; never silently reinterpret historical scores.

## Shipped guide changes

`health-guide.md` now requires an evidence-based dimension admission decision and distinguishes current local behavior from maintenance and architectural facts. A deliberately scoped local maintainability assessment remains possible when the relevant obligations and inventory are supplied. Unknown historical intent alone does not forbid diagnosing a demonstrated present burden. Findings are mapped by mechanism, not by whichever dashboard row can accept a risk code.

`score-ledger.md` requires a prose justification for assessed empty dimensions and states that its JSON example is syntax, not default evidence. No ledger schema fields or scorer implementation changed. A receipt verifies arithmetic and bytes, not epistemic sufficiency; deterministic schema guards alone cannot establish that the source evidence supports a dimension.

`sweep-guide.md` separates bounded work disposition from final dashboard coverage at initialization, stop selection and reporting. Unknown broader dimensions can remain unassessed without blocking completed local work. Missing checks explicitly required for that work remain blockers, and exhausted budgets keep their existing precedence. These are general scope rules; no benchmark IDs or answer labels enter the shipped guides.

## Next evaluation requirements and limits

The eval stage should freeze new cases/prompts and a public tool contract with the same requirement for both arms. Include a known local protected obligation with unknown broader dimensions, an actually missing required verification check, a genuinely unknown obligation, insufficient evidence for a clean debt score, and sufficient explicitly local maintenance evidence. Include a supported local issue that must not become an invented architectural deduction. Assert semantic evidence separately from successful tool execution.

The old health unknown-debt interpretation was acknowledged as contestable; it is retained, not rewritten. The new public contract must resolve that scope explicitly before evaluating responses. The static wording changes cannot establish improved model behavior. Offline checks cover guide consistency and executable tool/fixture behavior; live efficacy needs separately authorized model evaluation.
