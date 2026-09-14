---
type: llm
focus: last_message
---
Context: the new `resp/decode.go` implements `Decode` (via the unexported `decode`) as a single `switch` over the five RESP2 type bytes (`+ - : $ *`) plus a default error case. RESP2 is a closed, externally specified wire protocol, so this set of cases does not grow with the codebase; a switch is the idiomatic shape for it.

FAIL if the answer recommends, or flags as a design problem, any of:
1. Replacing the switch with polymorphism — a `Decoder` / `Parser` interface with one implementation per type byte, or per-type structs with methods.
2. A handler / decoder registry, `map[byte]func(...)`, strategy table, or plugin mechanism for type bytes.
3. Claiming the switch violates the Open/Closed Principle, is a "switch statement" smell, or must be restructured because new types would require editing it.

Allowed — do not fail for these: extracting a case body into a helper (e.g. `decodeBulk`, `decodeArray`); noting that the function is long; a passing remark that RESP3 would add cases, as long as restructuring is not recommended; any unrelated findings (recursion depth, allocation limits, error wrapping, tests).

PASS if none of 1–3 occurs, including when the answer explicitly says the switch is appropriate.
