namespace WordList

theorem empty_counterexample : Accepts loosePattern [] ∧ ¬ ValidList [] := by
  refine ⟨Star.nil, ?_⟩
  intro h
  generalize heq : ([] : List UnitClass) = s at h
  cases h <;> simp [List.replicate_succ] at heq

end WordList
