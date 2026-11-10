# Operating context

Launch two hedges, select one winner, and before the loser acknowledges cancellation attempt two replacements. Also consider a loser already completed, duplicate acknowledgement, and explicit cleanup. Cancellation request and acknowledgement are separate events.

The deployment contract supplied for review does not specify: The pool capacity accounting contract: does it bound physical operations or only client-visible unresolved operations? No unprovided caller, supervisor, database guarantee or SLA may be assumed.
