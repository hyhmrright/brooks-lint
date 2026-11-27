namespace FibCache

private theorem finish_valid (c : Cache) (hc : Valid c) (n r : Nat) (hr : r = fibSpec n) :
    Valid (finish .correct n r c).2 := by
  intro k v hv
  by_cases h : k = n
  · subst k
    simpa [finish, hr, eq_comm] using hv
  · exact hc k v (by simpa [finish, h] using hv)

private theorem eval_ok (n : Nat) (c : Cache) (hc : Valid c) :
    (evalNat .correct n c).1 = fibSpec n ∧ Valid (evalNat .correct n c).2 := by
  cases n with
  | zero =>
    cases h : c 0 with
    | none =>
      simp only [evalNat, h]
      exact ⟨rfl, finish_valid c hc 0 0 rfl⟩
    | some v => simpa [evalNat, h] using And.intro (hc 0 v h) hc
  | succ n =>
    cases n with
    | zero =>
      cases h : c 1 with
      | none =>
        simp only [evalNat, h]
        exact ⟨rfl, finish_valid c hc 1 1 rfl⟩
      | some v => simpa [evalNat, h] using And.intro (hc 1 v h) hc
    | succ n =>
      cases h : c (n + 2) with
      | some v => simpa [evalNat, h] using And.intro (hc _ v h) hc
      | none =>
        have left := eval_ok (n + 1) c hc
        have right := eval_ok n (evalNat .correct (n + 1) c).2 left.2
        simp only [evalNat, h]
        constructor
        · simp only [finish, fibSpec, left.1, right.1]
        · apply finish_valid _ right.2
          simp only [finish, fibSpec, left.1, right.1]
termination_by n

theorem original_call (x : Int) (c : Cache) (hc : Valid c) :
    (call .correct x c).1 = expected x ∧ Valid (call .correct x c).2 := by
  cases x with
  | negSucc n => exact ⟨rfl, hc⟩
  | ofNat n =>
    have h := eval_ok n c hc
    exact ⟨congrArg Outcome.value h.1, h.2⟩

theorem original_calls (xs : List Int) (c : Cache) (hc : Valid c) :
    (calls .correct xs c).1 = xs.map expected ∧ Valid (calls .correct xs c).2 := by
  induction xs generalizing c with
  | nil => exact ⟨rfl, hc⟩
  | cons x xs ih =>
    have first := original_call x c hc
    have rest := ih (call .correct x c).2 first.2
    exact ⟨by simp only [calls, List.map_cons, first.1, rest.1], rest.2⟩

theorem original_negative (x : Int) (c : Cache) (hx : x < 0) :
    call .correct x c = (.valueError, c) := by
  cases x with
  | negSucc n => rfl
  | ofNat n => exact False.elim (Int.not_lt.mpr (Int.ofNat_nonneg n) hx)

end FibCache
