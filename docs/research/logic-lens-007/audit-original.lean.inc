open FibCache

-- Restate the observable contract using an independent Fibonacci definition.
def oracle007 : Nat → Nat
  | 0 => 0
  | 1 => 1
  | k + 2 => oracle007 (k + 1) + oracle007 k

theorem agrees007 (n : Nat) : fibSpec n = oracle007 n := by
  match n with
  | 0 | 1 => rfl
  | k + 2 => simp only [fibSpec, oracle007, agrees007 (k+1), agrees007 k]

def outcome007 : Int → Outcome
  | .negSucc _ => .valueError
  | .ofNat n => .value (oracle007 n)

theorem history007 (xs : List Int) (c : Cache)
    (h : ∀ k v, c k = some v → v = oracle007 k) :
    (calls .correct xs c).1 = xs.map outcome007 ∧
    ∀ k v, (calls .correct xs c).2 k = some v → v = oracle007 k := by
  have correct := original_calls xs c (fun k v hv => (h k v hv).trans (agrees007 k).symm)
  have agree : expected = outcome007 := by
    funext x
    cases x with
    | negSucc _ => rfl
    | ofNat n => exact congrArg Outcome.value (agrees007 n)
  exact ⟨correct.1.trans (by rw [agree]), fun k v hv => (correct.2 k v hv).trans (agrees007 k)⟩

theorem negative007 (x : Int) (c : Cache) (h : x < 0) :
    call .correct x c = (.valueError, c) := original_negative x c h

#print axioms history007
#print axioms negative007
