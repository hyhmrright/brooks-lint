# Operating context

The gateway may invoke transport twice. Each transport invocation may send up to three times. Timeout is an unknown outcome. Consider all timeouts, first-send acknowledgement, and acknowledgement on the third or fourth physical send.

Contract: A logical write has a maximum of three physical send attempts across both gateway retries and transport retries. A token is consumed before every send, including timed-out sends; there is no token refund for an unknown outcome.
