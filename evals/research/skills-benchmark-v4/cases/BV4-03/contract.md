The public checkout accepts validated nonnegative integer cents and basis points only. Rounding policy (per line or per invoice) is not supplied; both are in production elsewhere.

Prospective numeric scope: checkout is invoked only through request. Valid lines are a dense array of at most 1000 integer cents, each 0 through 1000000 inclusive. The discount rate is fixed at 5000 basis points. Other arrays or values are rejected upstream; no direct-call guarantees outside this domain. This bounded domain is a new task restriction, not a claim that historical unbounded arithmetic was safe.
