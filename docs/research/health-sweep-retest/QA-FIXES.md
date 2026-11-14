# QA loop-back corrections

The first QA identified three defects before any live call: the normalization compared both sides after stripping one LF (incorrect for two-to-one LF); the archived verifier checked final token totals but not each admission prefix; and JSON null could crash mechanical scoring. The original QA evidence and pre-QA simulation archive remain retained.

The sealed correction permits exactly equality or finalizer report equal to agent report plus one LF. Added LF, two missing LFs, other whitespace and content differences remain failures. The host-finalized LF count belongs to semantic artifact preparation; agent terminal LF delivery is evaluated separately to avoid duplicating its penalty in the normalized outcome. The required quoted Unicode/backslash literal now has its own rubric criterion.

Each admitted row binds cumulative elapsed time, exact remaining per-turn timeout and finish time; verification rejects admission after the token ceiling, backwards or out-of-range times, raw timeout mismatches, inconsistent stop states and execution after a failure. Real run timestamps must agree with cumulative elapsed within one second. The inherited executor includes up to three seconds bounded cleanup; it is explicitly included in cumulative time, not hidden as a pause. Synthetic clock controls are labeled and do not claim real timestamp evidence.

Valid non-object JSON is an assessable invalid artifact, not a whole-run exception. Nine targeted tests and the full 48-turn synthetic drill with seven stop controls pass. The complete QA gate is separate. No model was invoked.
