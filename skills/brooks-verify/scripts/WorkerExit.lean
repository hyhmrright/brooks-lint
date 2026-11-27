import Std

namespace WorkerExit

abbrev Status := Fin 256

inductive Mode where
  | swallowed
  | propagated
  deriving DecidableEq

/-- Each element is an observed completed child. A skip stays distinct from
a command that ran and exited successfully. On command failure the output
and move fields are immaterial: neither variant attempts the move. -/
inductive Run where
  | skipped
  | ran (command : Status) (nonempty : Bool) (move : Status)
  deriving DecidableEq

/-- On the modeled path, setup, redirections, cleanup and diagnostic echo
succeed. Bash tests the command in an if condition, where errexit does not
abort the else branch. Its status can be saved before cleanup. -/
def worker (mode : Mode) : Run → Status
  | .skipped => 0
  | .ran rc nonempty move =>
    if rc = 0 then
      match mode with
      | .swallowed => move
      | .propagated => if nonempty then move else 1
    else
      match mode with
      | .swallowed => 0     -- Last command is a successful diagnostic echo.
      | .propagated => rc    -- Explicit return of the saved command status.

/-- bash -c runs the function as its final command with strict flags. -/
def child (mode : Mode) (run : Run) : Status := worker mode run

/-- Portable xargs contract for successfully launched, normally exited
children. The platform selects a nonzero aggregate when a child fails;
its numeric value can depend on the platform and the completed batch.
A child exiting 255 may prevent pending work from being started. -/
def aggregate (failureCode : Status) (children : List Status) : Status :=
  if children.any (fun s => decide (s ≠ 0)) then failureCode else 0

/-- The rightmost failing stage determines the two-stage pipefail result. -/
def pipeline (producer last : Status) : Status := if last = 0 then producer else last

def caller (mode : Mode) (producer failureCode : Status) (runs : List Run) : Status :=
  pipeline producer (aggregate failureCode (runs.map (child mode)))

theorem swallowedWitness :
    let run := Run.ran 23 true 0
    worker .swallowed run = 0 ∧
    child .swallowed run = 0 ∧
    aggregate 123 [child .swallowed run] = 0 ∧
    caller .swallowed 0 123 [run] = 0 := ⟨rfl, rfl, rfl, rfl⟩

theorem propagation (producer failureCode rc : Status) (nonempty : Bool) (move : Status)
    (runs : List Run) (failed : rc ≠ 0) (aggregateNonzero : failureCode ≠ 0)
    (executed : Run.ran rc nonempty move ∈ runs) :
    worker .propagated (.ran rc nonempty move) = rc ∧
    child .propagated (.ran rc nonempty move) = rc ∧
    aggregate failureCode (runs.map (child .propagated)) ≠ 0 ∧
    caller .propagated producer failureCode runs ≠ 0 := by
  have hw : worker .propagated (.ran rc nonempty move) = rc := by
    simp only [worker, failed, if_false]
  have hc : child .propagated (.ran rc nonempty move) = rc := hw
  have present := List.mem_map_of_mem (f := child .propagated) executed
  rw [hc] at present
  have detected : (runs.map (child .propagated)).any (fun s => decide (s ≠ 0)) = true :=
    List.any_eq_true.mpr ⟨rc, present, decide_eq_true failed⟩
  have ha : aggregate failureCode (runs.map (child .propagated)) = failureCode := by
    simp only [aggregate, detected, if_true]
  refine ⟨hw, hc, ?_, ?_⟩
  · rw [ha]
    exact aggregateNonzero
  simpa only [caller, ha, pipeline, aggregateNonzero, if_false] using aggregateNonzero

/-- Positive control: only the producer can fail when all completed children
are successful. In particular a successful producer yields caller status 0. -/
theorem allSuccessful (mode : Mode) (producer failureCode : Status) (runs : List Run)
    (h : ∀ r ∈ runs, child mode r = 0) :
    caller mode producer failureCode runs = producer := by
  have hnone : (runs.map (child mode)).any (fun s => decide (s ≠ 0)) = false := by
    apply Bool.eq_false_iff.mpr
    intro found
    obtain ⟨s, mem, bad⟩ := List.any_eq_true.mp found
    obtain ⟨r, hr, eq⟩ := List.mem_map.mp mem
    exact of_decide_eq_true bad (eq ▸ h r hr)
  simp only [caller, aggregate, hnone, pipeline, Bool.false_eq_true, if_false, if_true]

end WorkerExit
