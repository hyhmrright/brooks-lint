open FibCache

theorem poisonedHit007 :
    (call .wrongStore 0 empty).1 = .value 0 ∧
    (call .wrongStore 0 empty).2 0 = some 1 ∧
    ¬ Valid (call .wrongStore 0 empty).2 ∧
    (calls .wrongStore [0, 0] empty).1 = [.value 0, .value 1] ∧
    (calls .wrongStore [0, 0] empty).1 ≠ [0, 0].map expected :=
  wrong_store_counterexample

#print axioms poisonedHit007
