open BatchUpdate

theorem reviewedContract (disk : Disk) (targets : List Target) (bad : String)
    (rejected : prepare disk targets = .error bad) :
    (staged disk targets).failure = some bad ∧
    (staged disk targets).writes = [] ∧
    (staged disk targets).disk = disk := stagedRejected disk targets bad rejected
