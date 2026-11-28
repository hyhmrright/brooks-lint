
/-- Exact two-file input of the per-section CLI regression. The context
    function below only describes the two texts reached in this witness. -/
def cookbookDisk : BatchUpdate.Disk :=
  fun path => if path = "last.txt" then "unmatched\n" else "old\n"

def cookbookTargets : List BatchUpdate.Target :=
  let update := fun (contents : String) => if contents = "old\n" then some "new\n" else none
  [⟨"first.txt", update⟩, ⟨"last.txt", update⟩]

theorem reviewedContract :
    let r := BatchUpdate.eager cookbookDisk cookbookTargets
    r.failure = some "last.txt" ∧ r.writes = ["first.txt"] ∧
    cookbookDisk "first.txt" = "old\n" ∧ r.disk "first.txt" = "new\n" ∧
    r.disk "last.txt" = "unmatched\n" ∧ r.disk "first.txt" ≠ cookbookDisk "first.txt" := by
  exact ⟨rfl, rfl, rfl, rfl, rfl, by decide⟩
