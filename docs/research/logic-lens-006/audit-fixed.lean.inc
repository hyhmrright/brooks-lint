example (s : List WordList.UnitClass) :
    WordList.Accepts WordList.strictPattern s ↔ WordList.ValidList s :=
  WordList.strict_correct s
#print axioms WordList.strict_correct
example (s : List UInt16) :
    WordList.Accepts WordList.strictPattern (s.map WordList.classify) ↔
      WordList.ValidList (s.map WordList.classify) := WordList.strict_utf16 s
