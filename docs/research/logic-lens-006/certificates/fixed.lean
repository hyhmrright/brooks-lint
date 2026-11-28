namespace WordList

inductive UnitClass | word | comma | space | other
  deriving DecidableEq

-- No regex flags. ECMAScript's word and whitespace classes on UTF-16 units.
def classify (u : UInt16) : UnitClass :=
  let n := u.toNat
  if (48 ≤ n && n ≤ 57) || (65 ≤ n && n ≤ 90) || n == 95 || (97 ≤ n && n ≤ 122)
    then .word
  else if n == 44 then .comma
  else if (9 ≤ n && n ≤ 13) || n == 32 || n == 160 || n == 5760 ||
    (8192 ≤ n && n ≤ 8202) || n == 8232 || n == 8233 || n == 8239 ||
    n == 8287 || n == 12288 || n == 65279 then .space
  else .other

inductive Pattern
  | atom (c : UnitClass)
  | seq (left right : Pattern)
  | star (body : Pattern)
  | optional (body : Pattern)

-- Whole-string membership; concatenation partitions the entire input.
inductive Star (p : List UnitClass → Prop) : List UnitClass → Prop
  | nil : Star p []
  | cons {x xs} : p x → Star p xs → Star p (x ++ xs)

def Accepts : Pattern → List UnitClass → Prop
  | .atom c, s => s = [c]
  | .seq a b, s => ∃ x y, s = x ++ y ∧ Accepts a x ∧ Accepts b y
  | .star a, s => Star (Accepts a) s
  | .optional a, s => s = [] ∨ Accepts a s

def plus (p : Pattern) := Pattern.seq p (.star p)
def word := plus (.atom .word)
def spaces := Pattern.star (.atom .space)
def separator := Pattern.seq (.atom .comma) spaces
def strictPattern := Pattern.seq word (.star (.seq separator word))
def loosePattern := Pattern.star (.seq word (.seq (.optional (.atom .comma)) spaces))

-- The contract constructs a list from nonempty words. Each word after the
-- first has one leading comma and a freely chosen amount of whitespace.
inductive ValidList : List UnitClass → Prop
  | last (more : Nat) : ValidList (List.replicate (more + 1) .word)
  | before (more padding : Nat) {rest} : ValidList rest →
      ValidList (List.replicate (more + 1) .word ++
        [.comma] ++ List.replicate padding .space ++ rest)

end WordList

namespace WordList

private theorem atomStar (c : UnitClass) (s : List UnitClass) :
    Accepts (.star (.atom c)) s ↔ ∃ n, s = List.replicate n c := by
  constructor
  · intro h
    change Star _ s at h
    induction h with
    | nil => exact ⟨0, rfl⟩
    | cons first _ ih =>
      obtain ⟨n, rfl⟩ := ih
      change _ = [c] at first
      subst_vars
      exact ⟨n+1, by simp [List.replicate_succ]⟩
  · rintro ⟨n, rfl⟩
    induction n with
    | zero => exact Star.nil
    | succ n ih =>
      exact Star.cons (x := [c]) rfl ih

private theorem wordSpec (s : List UnitClass) :
    Accepts word s ↔ ∃ n, s = List.replicate (n+1) .word := by
  constructor
  · rintro ⟨x, y, rfl, first, tail⟩
    change x = [.word] at first
    obtain ⟨n, rfl⟩ := (atomStar _ _).mp tail
    exact ⟨n, by simp [first, List.replicate_succ]⟩
  · rintro ⟨n, rfl⟩
    exact ⟨[.word], _, by simp [List.replicate_succ], rfl,
      (atomStar _ _).mpr ⟨n, rfl⟩⟩

private theorem sepSpec (s : List UnitClass) :
    Accepts separator s ↔ ∃ n, s = [.comma] ++ List.replicate n .space := by
  constructor
  · rintro ⟨x, y, rfl, first, tail⟩
    change x = [.comma] at first
    obtain ⟨n, rfl⟩ := (atomStar _ _).mp tail
    exact ⟨n, by rw [first]⟩
  · rintro ⟨n, rfl⟩
    exact ⟨_, _, rfl, rfl, (atomStar _ _).mpr ⟨n, rfl⟩⟩

theorem strict_correct (s : List UnitClass) : Accepts strictPattern s ↔ ValidList s := by
  constructor
  · rintro ⟨first, tail, rfl, hfirst, htail⟩
    change Star _ tail at htail
    induction htail generalizing first with
    | nil =>
      obtain ⟨n, rfl⟩ := (wordSpec _).mp hfirst
      simpa using ValidList.last n
    | cons next _ ih =>
      obtain ⟨sep, w, rfl, hsep, hw⟩ := next
      obtain ⟨n, rfl⟩ := (wordSpec _).mp hfirst
      obtain ⟨k, rfl⟩ := (sepSpec _).mp hsep
      simpa [List.append_assoc] using ValidList.before n k (ih w hw)
  · intro h
    induction h with
    | last n =>
      exact ⟨_, [], by simp, (wordSpec _).mpr ⟨n, rfl⟩, Star.nil⟩
    | before n k _ ih =>
      obtain ⟨w, tail, rfl, hw, htail⟩ := ih
      refine ⟨_, _, ?_, (wordSpec _).mpr ⟨n, rfl⟩,
        Star.cons (x := ([.comma] ++ List.replicate k .space) ++ w)
          ⟨_, _, rfl, (sepSpec _).mpr ⟨k, rfl⟩, hw⟩ htail⟩
      simp [List.append_assoc]

theorem strict_utf16 (s : List UInt16) :
    Accepts strictPattern (s.map classify) ↔ ValidList (s.map classify) :=
  strict_correct _

end WordList
