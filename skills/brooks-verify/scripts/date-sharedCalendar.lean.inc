namespace DateConcurrency

-- A concrete instantiation of the isolated-format oracle on two UTC inputs.
def witnessInput (id : Nat) : Nat := if id = 0 then 1 else 2

def witnessRender (day : Nat) : String :=
  if day = 1 then "2000-01-01 00:00:00" else "2000-01-02 00:00:00"

def witnessEvents : List Event := [.beginCall 0, .beginCall 1, .finishCall 1, .finishCall 0]

theorem shared_counterexample :
    ∃ final, run .sharedCalendar witnessInput witnessRender initial witnessEvents = some final ∧
    final.slot 0 = .returned "2000-01-02 00:00:00" ∧
    final.slot 1 = .returned "2000-01-02 00:00:00" ∧
    final.slot 0 ≠ .returned (witnessRender (witnessInput 0)) := by
  refine ⟨_, rfl, rfl, rfl, ?_⟩
  decide

end DateConcurrency
