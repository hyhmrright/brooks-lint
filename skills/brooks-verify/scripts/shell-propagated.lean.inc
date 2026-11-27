open WorkerExit

theorem reviewedContract (producer failureCode rc : Status) (nonempty : Bool) (move : Status)
    (runs : List Run) (failed : rc ≠ 0) (aggregateNonzero : failureCode ≠ 0)
    (executed : Run.ran rc nonempty move ∈ runs) :
    worker .propagated (.ran rc nonempty move) = rc ∧
    child .propagated (.ran rc nonempty move) = rc ∧
    aggregate failureCode (runs.map (child .propagated)) ≠ 0 ∧
    caller .propagated producer failureCode runs ≠ 0 :=
  propagation producer failureCode rc nonempty move runs failed aggregateNonzero executed
