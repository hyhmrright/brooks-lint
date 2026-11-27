import Std

namespace Dedupe

/-- Costs refer to source operations on plain strings. Each list element visited
by membership counts as one comparison; a set lookup or insertion counts as
one operation regardless of its implementation. -/
structure Trace where
  output : List String
  comparisons : Nat := 0
  queries : Nat := 0
  inserts : Nat := 0
  deriving DecidableEq

/-- Left-to-right membership short-circuits on the first equal element. -/
def listLookup (x : String) : List String → Bool × Nat
  | [] => (false, 0)
  | y :: ys =>
    if x == y then (true, 1)
    else
      let (found, cost) := listLookup x ys
      (found, cost + 1)

def runList : List String → List String → Trace
  | [], out => { output := out }
  | x :: xs, out =>
    let (found, cost) := listLookup x out
    let rest := runList xs (if found then out else out ++ [x])
    { rest with comparisons := cost + rest.comparisons }

def listModel (xs : List String) := runList xs []

/-- An extensional set answers membership. Inserting x makes membership true
at x and preserves answers at every other string. -/
def put (seen : String → Bool) (x : String) (key : String) : Bool :=
  (x == key) || seen key

def runSet : List String → (String → Bool) → List String → Trace
  | [], _, out => { output := out }
  | x :: xs, seen, out =>
    if seen x then
      let rest := runSet xs seen out
      { rest with queries := 1 + rest.queries }
    else
      let rest := runSet xs (put seen x) (out ++ [x])
      { rest with queries := 1 + rest.queries, inserts := 1 + rest.inserts }

def setModel (xs : List String) := runSet xs (fun _ => false) []

/-- The accumulator of Lean's standard first-occurrence specification is
reversed. The source appends in forward order. Set membership agrees with
the specification's accumulator at every position in the input. -/
private theorem setOutput (xs rev : List String) (seen : String → Bool)
    (h : ∀ k, seen k = rev.elem k) :
    (runSet xs seen rev.reverse).output = List.eraseDups.loop xs rev := by
  induction xs generalizing rev seen with
  | nil => rfl
  | cons x xs ih =>
    cases hx : seen x with
    | true =>
      have hx' := (h x).symm.trans hx
      simpa only [runSet, List.eraseDups.loop, hx, hx', if_true, Bool.true_eq] using ih rev seen h
    | false =>
      have next : ∀ k, put seen x k = (x :: rev).elem k := by
        intro k
        by_cases eq : x = k
        · subst k
          simp [put]
        · simp [put, h, eq, Ne.symm eq]
      have hx' := (h x).symm.trans hx
      simpa only [runSet, List.eraseDups.loop, hx, hx', Bool.false_eq_true, if_false, List.reverse_cons] using ih (x :: rev) (put seen x) next

private theorem setCosts (xs : List String) (seen : String → Bool) (out : List String) :
    (runSet xs seen out).comparisons = 0 ∧
    (runSet xs seen out).queries = xs.length ∧
    (runSet xs seen out).inserts ≤ xs.length := by
  induction xs generalizing seen out with
  | nil => exact ⟨rfl, rfl, Nat.le_refl 0⟩
  | cons x xs ih =>
    cases hx : seen x with
    | true =>
      obtain ⟨hc, hq, hi⟩ := ih seen out
      simp [runSet, hx, hc, hq, Nat.add_comm]
      omega
    | false =>
      obtain ⟨hc, hq, hi⟩ := ih (put seen x) (out ++ [x])
      simp [runSet, hx, hc, hq, Nat.add_comm, hi]

theorem setContract (xs : List String) :
    (setModel xs).output = xs.eraseDups ∧
    (setModel xs).comparisons = 0 ∧
    (setModel xs).queries = xs.length ∧
    (setModel xs).inserts ≤ xs.length :=
  ⟨setOutput xs [] (fun _ => false) (fun _ => rfl), setCosts xs _ []⟩

private theorem listLookupMiss (x : String) (out : List String) (h : x ∉ out) :
    listLookup x out = (false, out.length) := by
  induction out with
  | nil => rfl
  | cons y ys ih =>
    simp only [List.mem_cons, not_or] at h
    simp [listLookup, h.1, ih h.2]

private theorem listMissCosts (xs out : List String) (unique : xs.Nodup)
    (fresh : ∀ x ∈ xs, x ∉ out) :
    (runList xs out).comparisons = (List.range' out.length xs.length).sum := by
  induction xs generalizing out with
  | nil => rfl
  | cons x xs ih =>
    obtain ⟨notInTail, tailUnique⟩ := List.nodup_cons.mp unique
    have miss := listLookupMiss x out (fresh x (by simp))
    have stillFresh : ∀ y ∈ xs, y ∉ out ++ [x] := by
      intro y hy
      have old := fresh y (List.mem_cons_of_mem _ hy)
      have ne : y ≠ x := fun eq => notInTail (eq ▸ hy)
      simp [old, ne]
    simp [runList, miss, ih (out ++ [x]) tailUnique stillFresh, List.range'_succ]

/-- On distinct inputs each lookup misses and visits every previously appended
string. List.range n sums the visit counts 0 through n − 1. -/
theorem listDistinctComparisons (xs : List String) (h : xs.Nodup) :
    (listModel xs).comparisons = (List.range xs.length).sum := by
  simpa [listModel, List.range_eq_range'] using listMissCosts xs [] h (by simp)

theorem listBudgetWitness :
    (listModel ["a","b","c","d"]).comparisons = 6 ∧
    (listModel ["a","b","c","d"]).comparisons > ["a","b","c","d"].length := by
  decide

end Dedupe
