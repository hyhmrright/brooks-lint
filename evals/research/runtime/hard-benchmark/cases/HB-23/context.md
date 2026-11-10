# Operating context

Closed-state requests can overlap and complete in either order. The open cooldown is10ms; older requests need not finish during cooldown. A half-open trial may therefore overlap an old completion. Completion delivery may be duplicated. All clock values share a monotonic domain; callbacks execute serially.

Contract: A half-open probe lease can be settled only by the outcome for the exact epoch and probe sequence that acquired it. A late pre-open request may update its own metrics but cannot release or decide the half-open probe. At most one probe is admitted in that epoch.
