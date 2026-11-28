open LoopCapture

theorem reviewedContract (ids : List Int) (s : State) (h : Reachable .perIteration ids s)
    (returned : s.waiting = 0) :
    s.done.Perm ids.zipIdx ∧ ∀ v : Int, (s.done.map Prod.fst).count v = ids.count v :=
  returnContract ids s h returned
