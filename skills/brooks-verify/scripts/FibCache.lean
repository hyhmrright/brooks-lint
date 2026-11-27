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
