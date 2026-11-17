Only `changed` events are accepted. Return 202 after the queue accepts
the event and 503 if queue submission rejects. Acknowledgement is not downstream
delivery. Caller-supplied retries can submit the same event more than once.
