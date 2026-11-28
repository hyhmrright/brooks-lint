open FileLifetime

theorem reviewedContract (inputs : List Outcome) :
    (run .perFile inputs).peak ≤ 1 ∧ (run .perFile inputs).live = 0 :=
  perFileLifetime inputs
