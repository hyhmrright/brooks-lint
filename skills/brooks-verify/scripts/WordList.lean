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
