open DateConcurrency

theorem fixed003 {α : Type} (inputs : Nat → α) (isolated : α → String)
    (schedule : List Event) (s : State α)
    (reachable : run .perCall inputs isolated initial schedule = some s) :
    ∀ i output, s.slot i = .returned output → output = isolated (inputs i) :=
  perCall_correct inputs isolated schedule s reachable

#print axioms fixed003
