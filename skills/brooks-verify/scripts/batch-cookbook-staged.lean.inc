
/-- The CLI supplies a read-only snapshot to its parser. Each abstract target
    summarizes pure context checking and preparation on that snapshot. -/
theorem reviewedContract (disk : BatchUpdate.Disk) (ts : List BatchUpdate.Target)
    (bad : String) (h : BatchUpdate.prepare disk ts = .error bad) :
    (BatchUpdate.staged disk ts).failure = some bad ∧
    (BatchUpdate.staged disk ts).writes = [] ∧
    (BatchUpdate.staged disk ts).disk = disk :=
  BatchUpdate.stagedRejected disk ts bad h

private theorem preparationRejectsAt (disk : BatchUpdate.Disk)
    (prefixTargets : List BatchUpdate.Target) (target : BatchUpdate.Target)
    (suffixTargets : List BatchUpdate.Target) (mismatch : target.patch (disk target.path) = none) :
    ∃ bad, BatchUpdate.prepare disk (prefixTargets ++ target :: suffixTargets) = .error bad := by
  induction prefixTargets with
  | nil =>
    exact ⟨target.path, by
      change BatchUpdate.prepare disk (target :: suffixTargets) = _
      rw [BatchUpdate.prepare, mismatch]⟩
  | cons head tail ih =>
    cases hh : head.patch (disk head.path) with
    | none =>
      exact ⟨head.path, by
        change BatchUpdate.prepare disk (head :: (tail ++ target :: suffixTargets)) = _
        rw [BatchUpdate.prepare, hh]⟩
    | some text =>
      obtain ⟨bad, hb⟩ := ih
      exact ⟨bad, by
        change BatchUpdate.prepare disk (head :: (tail ++ target :: suffixTargets)) = _
        rw [BatchUpdate.prepare, hh]
        change (BatchUpdate.prepare disk (tail ++ target :: suffixTargets)).map _ = _
        rw [hb]
        rfl⟩

/-- A rejected context at any position prevents all target effects, even
    when an earlier context also fails. -/
theorem anyRejectedTargetNoWrites (disk : BatchUpdate.Disk)
    (prefixTargets : List BatchUpdate.Target) (target : BatchUpdate.Target)
    (suffixTargets : List BatchUpdate.Target) (mismatch : target.patch (disk target.path) = none) :
    let run := BatchUpdate.staged disk (prefixTargets ++ target :: suffixTargets)
    run.writes = [] ∧ run.disk = disk := by
  obtain ⟨bad, hb⟩ := preparationRejectsAt disk prefixTargets target suffixTargets mismatch
  exact (reviewedContract disk _ bad hb).2
