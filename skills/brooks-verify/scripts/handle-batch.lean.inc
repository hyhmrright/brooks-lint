open FileLifetime

theorem reviewedContract :
    let r := run .batch [.ok, .ok]
    r.scans = [1, 2] ∧ r.peak = 2 ∧ r.live = 0 := twoScans
