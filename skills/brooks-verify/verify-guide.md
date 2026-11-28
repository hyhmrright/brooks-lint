# Contract Verification Guide

### Step 1: Identify the source and obligation

Obtain the complete Python module, Bash script, Go file, Java class or CommonJS module at the revision under discussion. Record its path
and revision when available. A PR is optional. Never extract and rewrite a function
from a larger module to make it pass the checker's input rules.

Cite a requirement, policy, or independently supplied specification for this function.
Confirm the units, accepted input domain, and inclusive or exclusive endpoints.
If the available evidence admits multiple interpretations, report the missing
decision and ask for the governing contract. Copying the return expression into
the contract cannot establish that the implementation satisfies its owner's intent.

### Step 2: Encode the contract

For integer predicates, the checker accepts a module containing one plain function with one positional
parameter and one return statement. Module and function docstrings and plain
`int` and `bool` annotations are allowed. Compare either the parameter or `parameter % divisor`
with an integer literal on the right. The divisor must be a positive or negative
integer literal. Zero and variable divisors yield `unverified`. Use Python floor
remainder semantics. A nonzero remainder has the sign of the divisor. Combine
comparisons with Boolean constants, parentheses, and `and`, `or` and `not`. The mathematical domain is all plain
Python integers. Record any narrower application preconditions separately.

Save an independent integer contract with exactly four string fields. For example,
a shipping policy that grants free shipping at 5,000 cents or more might yield:

```json
{
  "function": "free_shipping",
  "parameter": "subtotal",
  "reference": "Shipping policy v2, section 4 (amount in cents)",
  "predicate": "subtotal >= 5000"
}
```

For a standalone typed Python `list[str] -> list[str]` deduplication function,
use the named contract below when the requirement calls for first-occurrence
order and both operation budgets. A string comparison unit is one visited
element in a list membership scan. A set membership query is one source-level
probe regardless of its hash-table implementation. The supported patterns
initialize empty local containers, iterate the input once, guard an append by
membership, and return the output. The set variant also adds unseen values
to the set. The checker matches every AST node, up to local renaming and an
optional docstring. A variant outside these patterns yields `unverified`.
Use a trusted installation including `scripts/Dedupe.lean`.

```json
{
  "kind": "stable-dedupe-v1",
  "function": "dedupe",
  "parameter": "items",
  "reference": "Your source of the ordering requirement and operation budgets",
  "output": "first_occurrences",
  "max_list_comparisons": "input_length",
  "max_set_queries": "input_length"
}
```

For a multi-file update with the supported field-match and patch workflow, use
`scripts/verify_batch.py` instead. Supply `kind: validate-before-write-v1`,
`function: main`, `failure: target_pattern_mismatch`, `required_writes: none`,
`target_contents: unchanged`, and a `reference` identifying the requirement as
JSON strings. This backend checks module initialization, helper and caller
together and never imports the reviewed source. A verified result covers a
rejected target match before commit. A later external validator failure, a
write failure and a crash are separate obligations. Preserve the supplied disk
witness and write trace when reporting a counterexample.

For the supported exported Bash worker and its parallel xargs pipeline, use
`scripts/verify_worker.py`. Supply the contract kind
`bash-xargs-worker-exit-v1`, function `run_case`, command `claude`, failure
`executed_command_nonzero`, required_pipeline_status `nonzero`, and an independent
`reference`. The checker recognizes the two complete probe workflows. Other
worker bodies and invocations yield `unverified`. The proof concerns commands
that executed and exited normally. It assumes successful setup, cleanup and
diagnostics, and xargs returning nonzero when any completed child fails.

For a Go batch that opens and scans each path in sequence, use
`scripts/verify_handles.py` with the following contract. Count only handles
opened by this invocation. The checker matches the full supported source
form with the defer in the outer function or in a single-path helper.
It preserves line boundaries and rejects unknown statements and directives.
The source-to-model match is trusted. For the isolated file, assume
`os.Open` returns a fresh handle on success and none on failure, `scan`
borrows the handle and returns normally with success or an error, and each
deferred close releases its handle. The proof covers arbitrary finite batches
including early returns from open and scan errors. Record the open-handle
peak and the count remaining at function return as separate obligations.

```json
{
  "kind": "go-file-lifetime-v1",
  "function": "processFiles",
  "max_live": 1,
  "live_at_return": 0,
  "reference": "Your requirement for the batch's peak and final handle counts"
}
```

For the supported Go 1.22 `fanOut`, use `scripts/verify_capture.py`. Keep the
leading `//go:build go1.22` line. The whole-source matcher distinguishes the
range declaration that binds a fresh variable from the synchronized control
that assigns to one variable and gates all readers until the loop ends.

```json
{
  "kind": "go-loop-capture-v1",
  "function": "fanOut",
  "go_semantics": "1.22",
  "binding": "iteration_value",
  "at_return": "each_input_occurrence_once",
  "reference": "Your requirement for per-iteration arguments and completion before return"
}
```

Count each input position separately, including repeats. A worker takes its
index from its launch and carries that index with its callback argument in the
model. The Lean proof allows every completion order. On return, completed
(value, index) pairs form a permutation of the indexed input. This also proves
the count for each value. Callback order is unspecified.

The source binding, Go range and synchronization semantics are trusted.
Assume the file is included with Go 1.22 semantics, input values are stable,
the callback consumes its argument and returns normally, and the isolated
WaitGroup operations succeed. To project an execution, group the launches and
retain the worker completion order. Fresh iteration cells make later range
assignments independent of earlier argument reads. The shared control's
channel close orders every assignment before every read. A worker with a
callback in progress remains pending. Its deferred Done follows callback
return; Wait is reached only after the last launch. The claim applies when
fanOut returns. The contract covers argument delivery and callback completion;
external work started by the callback needs its own contract.

For Python's supported memoized `fib`, use `scripts/verify_cache.py`. Supply
the independent contract below. The checker reads the AST of the whole module,
including the initializer, negative guard, lookup, recursive calls and write.
It recognizes a write of the returned value and the regression that writes
`result + 1`. Other executable forms yield `unverified`.

```json
{
  "kind": "python-fib-cache-v1",
  "function": "fib",
  "cache": "_MEMO",
  "invariant": "fibonacci_entries",
  "across_calls": "correct_results",
  "negative": "ValueError_unchanged",
  "reference": "Your requirement for Fibonacci results and shared-cache behavior"
}
```

Assume sequential calls with plain integers, standard Python builtins, sufficient
resources and exclusive ownership of the dictionary. The source-to-model match
is trusted. Lean threads the updated cache through the left recursive call,
the right recursive call and each subsequent top-level call. Starting from an
empty cache or any cache of correct entries, each returned value equals the
Fibonacci specification and every entry remains correct. A negative input
raises `ValueError` with the same cache. For a counterexample, report both
the first corrupting write and the subsequent read.

For a Java formatter shared by concurrent callers, use `scripts/verify_date.py`
with the complete supported `TimestampFormatter` class. Its field initializer,
imports, method signature, pattern and return statement bind the source to
the corresponding library model. Other forms yield `unverified`.

```json
{
  "kind": "java-date-concurrency-v1",
  "function": "TimestampFormatter.format",
  "pattern": "yyyy-MM-dd HH:mm:ss",
  "result": "own_input_sequential_format",
  "reference": "Your requirement for per-call results under concurrent access"
}
```

Use isolated formatting of each method's own input type as the reference.
Assume a fixed formatter configuration, standard JDK classes, stable non-null
inputs in the formatter's domain, and normal completion. The checker trusts
the whole-source match and the relevant library semantics. In the
`SimpleDateFormat` witness two calls set the same calendar before the first
call reads its date fields. This models one possible interleaving. For
`DateTimeFormatter`, each invocation uses its own print context with the
immutable shared formatter. For every admitted trace and every call that
returns, Lean checks equality with the isolated result for that call. The
contract concerns interference; the calendar conversion and pattern rendering
are supplied by the sequential JDK formatter. Report scheduling assumptions,
each call's own input and the expected and observed strings.

For the supported JavaScript `isValidList` module, use `scripts/verify_list.py`
with the language contract below. Each input is a primitive JavaScript string.
A word contains one or more ASCII letters, digits or underscores. A valid list
contains at least one word. Each later word follows one comma and zero or more
ECMAScript whitespace or line-terminator units. The entire string must match.

```json
{
  "kind": "js-word-list-language-v1",
  "function": "isValidList",
  "language": "nonempty_comma_separated_words",
  "reference": "Your requirement for the accepted list syntax"
}
```

The checker binds the complete module to one of two anchored, flagless
expressions. Lean interprets concatenation, optional matching and repetition
over classified UTF-16 units. It compares that language with an independent
grammar that builds lists from word lengths and separator padding. The
source matcher, the classification table and the correspondence between
these regex operators and standard JavaScript builtins are trusted. The
result concerns Boolean acceptance only. Matching cost remains unverified.

### Step 3: Run the installed checker

From this skill's directory, pass paths to the original module and contract:

```sh
# Integer predicates and stable deduplication
python3 -I scripts/lean_review.py SOURCE.py CONTRACT.json
# Target match failure during batch preparation
python3 -I scripts/verify_batch.py SOURCE.py CONTRACT.json
# Exit status of an exported Bash worker and xargs pipeline
python3 -I scripts/verify_worker.py SOURCE.sh CONTRACT.json
# Peak and final count of handles owned by a Go batch
python3 -I scripts/verify_handles.py SOURCE.go CONTRACT.json
# Per-iteration capture and completion in the supported Go 1.22 fanOut
python3 -I scripts/verify_capture.py SOURCE.go CONTRACT.json
# Fibonacci results and dictionary integrity across sequential Python calls
python3 -I scripts/verify_cache.py SOURCE.py CONTRACT.json
# Date formatting under concurrent calls
python3 -I scripts/verify_date.py SOURCE.java CONTRACT.json
# Whole-string acceptance for a comma-separated list of words
python3 -I scripts/verify_list.py SOURCE.js CONTRACT.json
```

Capture stdout and the exit code. The checker reads the module as data and
translates its supported syntax to Lean. A bounded search proposes a candidate integer
witness when it finds a mismatch. Lean must certify the conflicting outputs at
that input. When the search finds no witness, `verified` requires a Lean proof
of equivalence over all integers. An inconclusive proof yields `unverified`. If execution is unavailable or the process fails without a
valid result, report the reason and mark verification incomplete.

### Step 4: Interpret and report the result

Report the mode, checker status, source path, function, contract reference and
input domain. For a certified result, include the relevant source line, source SHA-256,
and the generated Lean certificate or its artifact path. The decoded
`lean_certificate` text can be saved as `Review.lean` and replayed with
`lean Review.lean`.

| Status | Exit | What the evidence supports |
|---|---:|---|
| `verified` | 0 | Lean certified the selected typed obligation for every input in the reported domain. |
| `counterexample` | 1 | Lean checked the conflicting outputs at the reported input. Include expected and actual outputs or operation counts, then establish whether that input can reach the function under the stated contract. |
| `unverified` | 2 | Report the diagnostic, such as unsupported syntax, a missing executable or an uncertified obligation. |

For a reachable mismatch, explain the defect using the Iron Law:
**Symptom → Source → Consequence → Remedy**. Anchor the source in the governing
requirement and exact implementation. When an application precondition excludes
the returned witness, retain the mathematical result and mark behavior on the
permitted domain unresolved. Before attributing a regression to a change, check
the base revision against its applicable contract. Keep this result scoped to
contract verification and omit decay risk codes and Health Scores.
