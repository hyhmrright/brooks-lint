# Health tool retest: second recovery execution

The separately frozen [second recovery](../../health-tool-retest-recovery2.md)
completed the original schedule: 48 responses, including the previous 18
byte-preserved responses and 30 newly completed turns. There were 50 total
attempts including the two prior failures, which remain in their separate
archives. The verifier confirmed 48 executed, zero failed in the composite and
zero not run. Total observed tokens were 1,698,231; failed-attempt usage is
unknown. The requested and CLI-selected model was `gpt-6.1-terra`, effort
`low`, CLI `0.167.1`; this is not independent provider identity attestation.

Mechanical inspection shows zero recorded scoring-tool calls in both arms. In
arm B, zero of 18 required-tool responses passed the required-call check, while
all three prohibited-tool responses avoided calls. Some answers state that a
code-mode host was disabled; the captured events do not by themselves establish
why no dynamic scoring call occurred. This is a workflow observation, not proof
that the scorer was executed, that semantic answers were correct, or that the
skill itself is ineffective. Cases are same-workflow development examples, not
independent holdouts. The completed same-workflow semantic review and its limitations are in
[semantic-review.md](semantic-review.md); they are not independent human validation.

`raw-recovery.tar.gz` preserves the merged raw run and execution records. Its
SHA-256 is in `SHA256SUMS`. A heuristic scan found no recognizable API keys or
token fields; it cannot prove absence of arbitrary secrets.
