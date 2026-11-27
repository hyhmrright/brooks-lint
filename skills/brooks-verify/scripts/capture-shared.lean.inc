open LoopCapture

theorem reviewedContract : ∃ s : State, Reachable .shared [1, 2] s ∧ s.waiting = 0 ∧
    s.done = [(2, 1), (2, 0)] ∧ ¬s.done.Perm ([1, 2] : List Int).zipIdx :=
  sharedWitness
