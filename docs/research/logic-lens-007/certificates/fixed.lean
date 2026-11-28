namespace FibCache

-- Extensional view of the integer dictionary on its reachable natural keys.
abbrev Cache := Nat → Option Nat

def empty : Cache := fun _ => none

def fibSpec : Nat → Nat
  | 0 => 0
  | 1 => 1
  | n + 2 => fibSpec (n + 1) + fibSpec n

def Valid (c : Cache) : Prop := ∀ k v, c k = some v → v = fibSpec k

inductive Store where
  | correct | wrongStore

def finish (s : Store) (n result : Nat) (c : Cache) : Nat × Cache :=
  let written := match s with
    | .correct => result
    | .wrongStore => result + 1
  (result, fun k => if k = n then some written else c k)

-- Both recursive calls can mutate the shared dictionary. Evaluate left first.
def evalNat (s : Store) : Nat → Cache → Nat × Cache
  | 0, c => match c 0 with
    | some v => (v, c)
    | none => finish s 0 0 c
  | 1, c => match c 1 with
    | some v => (v, c)
    | none => finish s 1 1 c
  | n + 2, c => match c (n + 2) with
    | some v => (v, c)
    | none =>
      let left := evalNat s (n + 1) c
      let right := evalNat s n left.2
      finish s (n + 2) (left.1 + right.1) right.2

inductive Outcome where
  | value (v : Nat)
  | valueError
  deriving DecidableEq

def call (s : Store) (x : Int) (c : Cache) : Outcome × Cache :=
  match x with
  | .negSucc _ => (.valueError, c)
  | .ofNat n => let r := evalNat s n c; (.value r.1, r.2)

def expected : Int → Outcome
  | .negSucc _ => .valueError
  | .ofNat n => .value (fibSpec n)

def calls (s : Store) : List Int → Cache → List Outcome × Cache
  | [], c => ([], c)
  | x :: xs, c =>
    let first := call s x c
    let rest := calls s xs first.2
    (first.1 :: rest.1, rest.2)

theorem empty_valid : Valid empty := by simp [Valid, empty]

end FibCache

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
