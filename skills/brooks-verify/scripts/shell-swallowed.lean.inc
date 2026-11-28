open WorkerExit

theorem reviewedContract :
    let run := Run.ran 23 true 0
    worker .swallowed run = 0 ∧ child .swallowed run = 0 ∧
    aggregate 123 [child .swallowed run] = 0 ∧
    caller .swallowed 0 123 [run] = 0 := swallowedWitness
