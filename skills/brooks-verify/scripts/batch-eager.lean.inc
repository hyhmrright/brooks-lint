open BatchUpdate

theorem reviewedContract (tail : List Target) :
    let ts := firstTarget :: secondTarget :: tail
    (eager exampleDisk ts).failure = some secondPath ∧
    (eager exampleDisk ts).writes = [firstPath] ∧
    exampleDisk firstPath = oldJSON ∧
    (eager exampleDisk ts).disk firstPath = newJSON ∧
    newJSON ≠ oldJSON := eagerWitness tail
