# Runtime research guide

Revision 2. These are experimental diagnostic rules. Book-source verification,
independent human review, and evidence of model benefit remain pending.

### Step 1 — Respect the requested task

Apply this guide only to an explicitly requested runtime reliability review in a
research session. When the user asks for syntax or behavior explanation, answer
that request directly. Do not start an audit, recommend resilience patterns, or
claim a review was completed because the snippet uses a network call.

### Step 2 — Establish the contract and evidence boundary

List the relevant entry point, dependency, deadline owner, attempt budget,
resource limits, and expected behavior where supplied. Record each fact's source:
code, configuration, an authored fixture contract, an observed test, or an explicit
assumption. Distinguish an authored experiment from production observations.

Inspect available callers, transport behavior, and configuration before asserting
protection is absent. An unavailable artifact is unknown, not absent protection.
Stay inside the supplied input boundary. When further inspection is unavailable,
record the missing artifact and the conclusion it prevents; do not fill the gap
from adjacent examples or general expectations.

### Step 3 — Separate response completion from cancellation of work

Trace when the caller returns, who owns expiry, whether cancellation reaches the
dependency, how the transport reacts, and when occupied resources are released.
A raced timeout promise can stop waiting while the operation continues. Signal
forwarding alone does not establish effective cancellation; inspect the receiving
implementation or supplied observations. Conversely, a missing leaf timer is not
a defect when an effective caller-owned bound meets the contract.

Differentiate completion, timeout, caller cancellation, and explicit driver
teardown. Measure before artificial cleanup if a supplied reproducer permits it.
Do not require request-serving deadlines for a finite offline job whose documented
contract permits long execution and bounds concurrency. Long duration alone does
not establish a deadline failure.

When outcome depends on scheduling, separate underlying settlement, boundary
observation, caller delivery, and resource release. Trace the relevant event order
and a contrasting permitted order; do not infer a resource leak from a response
that loses arbitration after work has released its resources. State which event
the contract calls success and how exact-boundary ties and intervening
cancellation are resolved. If those rules are missing, show how at least two
compatible rules produce different judgments of the same observation.

Trace rejection as well as normal completion. Establish which inputs are valid,
when validation occurs relative to timer/listener/slot acquisition, and which
owner cleans up a synchronous throw or asynchronous rejection. A resource retained
until an observed deadline is temporary retention, not proof of a permanent leak.
If accepted inputs or rejection behavior are unspecified, report that missing
contract before calling the observed rejection path a defect.

### Step 4 — Trace attempt ownership across the whole path

Identify each supplied retry owner, its stopping condition, transient-error
classification, and cancellation behavior. Count total attempts including the
initial call; check whether the transport retries internally. Independent layers
can multiply downstream attempts. Compare the traced total with a supplied
whole-request budget before asserting a violation.

A local limit neither proves amplification nor bounds the complete request when
outer owners are unknown. Do not invent a global limit, backoff policy, write
semantics, or production traffic. A single accountable owner can meet the contract;
the presence of retry code is not itself a finding. Note side effects or retry
safety only where the supplied operation contract supports the claim.

### Step 5 — Trace finite admission and competing work

Identify which routes share workers, queue positions, connections, or other
capacity. Trace controlled arrivals, occupancy, admission, rejection, release, and
recovery against the declared behavior of each route. Distinguish permitted
optional overload from rejection that violates an essential-route contract.

Inspect both workers and queues; unbounded waiting can defeat a bounded worker
count. Check cancellation and failure cleanup where evidenced. Reserved bounded
capacity can protect work in one process. Separate processes are not mandatory,
and shared process placement alone does not prove contention. Compare aggregate
resources and offered traffic before attributing an observed benefit to isolation.
Synthetic occupancy does not establish production CPU or memory exhaustion,
process failure isolation, or availability under arbitrary traffic.

### Step 6 — Diagnose before proposing a remedy

Use the Iron Law for every supported finding:
**Symptom → Source → Consequence → Remedy**. Establish the symptom, inspected cause,
violated contract, and bounded consequence before choosing a remedy. Attach file
and symbol evidence, observed results where available, and the assumptions needed
for the causal chain. Calibrate explicit severity to demonstrated impact and
reach; a missing pattern alone does not justify Critical severity.

For protected behavior, explain which evidenced control meets which contract
without claiming universal safety. For unresolved behavior, describe the visible
local behavior, the specific missing artifacts and why they matter, and the
conditional alternatives. Withhold a definitive defect, clean verdict, and
severity when the missing evidence prevents them. In a fixed-input experiment,
record this unresolved assessment; in an interactive review, ask a focused
question. A hypothetical repair is not an established finding. For each unresolved issue,
make the alternatives explicit: under rule A, the observed result meets or
violates the contract; under rule B, explain how that judgment changes. Identify
the smallest missing artifact that would decide between them. Distinguish this
reasoning from simply listing two observed schedules.

### Step 7 — Report the research result and its limits

Keep experimental runtime observations in a labeled research artifact. Report
supported findings, bounded protection, or unresolved questions according to the
evidence; do not demand findings in every review. Include no numeric runtime or
combined Health Score and invent no public risk identifiers or book citations.
Verified source mapping remains separate from a causal code trace. Do not map a
runtime issue to a core risk merely to attach a code; demonstrate that core
risk's defining mechanism separately. A bounded runtime protection alone cannot
justify a whole-codebase Health Score.

Compare any runtime observation with core findings already produced. Describe
overlap once and do not duplicate the same underlying failure, affected resource,
or remedy merely because different layers or guidance describe it. Core findings
retain their existing classification and score semantics. Additional supported
evidence can refine a diagnosis without becoming an extra finding or deduction.

State uninspected context and experimental limitations. An offline reproducer
establishes its own controlled behavior, not diagnostic accuracy, model benefit,
production exposure, or successful release readiness.
