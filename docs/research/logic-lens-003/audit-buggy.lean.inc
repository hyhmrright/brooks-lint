open DateConcurrency

theorem interferes003 :
    ∃ s, run .sharedCalendar witnessInput witnessRender initial
      [.beginCall 0, .beginCall 1, .finishCall 1, .finishCall 0] = some s ∧
      witnessRender (witnessInput 0) = "2000-01-01 00:00:00" ∧
      s.slot 0 = .returned "2000-01-02 00:00:00" ∧
      s.slot 1 = .returned "2000-01-02 00:00:00" := by
  obtain ⟨s, reached, first, second, _⟩ := shared_counterexample
  exact ⟨s, reached, rfl, first, second⟩

#print axioms interferes003
