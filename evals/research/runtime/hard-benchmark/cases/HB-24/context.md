# Operating context

Closed-state requests can overlap and complete in either order. The open cooldown is10ms; older requests need not finish during cooldown. A half-open trial may therefore overlap an old completion. Completion delivery may be duplicated. All clock values share a monotonic domain; callbacks execute serially.

The deployment contract supplied for review does not specify: The breaker completion contract: are pre-open completions barred from releasing half-open probes, or can any success deliberately close the breaker? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
