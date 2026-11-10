# Operating context

Launch two hedges, select one winner, and before the loser acknowledges cancellation attempt two replacements. Also consider a loser already completed, duplicate acknowledgement, and explicit cleanup. Cancellation request and acknowledgement are separate events.

Contract: The pool capacity of two bounds physically running operations, not just unresolved client promises. Cancellation is a request; the transport remains running until acknowledgeCancel or complete. Winner delivery need not await loser drainage.
