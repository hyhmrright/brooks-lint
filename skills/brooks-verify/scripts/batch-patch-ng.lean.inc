
namespace PatchNg

/-- State projected onto the two existing target paths. Backup cleanup is
    outside this trace. "open" records opening a target for writing. -/
structure Result where
  disk : BatchUpdate.Disk
  failures : List String
  mutations : List (String × String)

/-- Restricted to the one-line -old/+new hunks and LF inputs in the witnesses.
    The two reachable input texts are "old\n" and "unmatched\n". -/
def applyOne (r : Result) (path : String) : Result :=
  if r.disk path = "old\n" then
    { r with
      disk := BatchUpdate.write r.disk path "new\n"
      mutations := r.mutations ++ [("os.rename", path), ("open", path)] }
  else
    { r with failures := r.failures ++ [path] }

/-- PatchSet.apply checks each file and accumulates errors through the loop. -/
def run (disk : BatchUpdate.Disk) : Result :=
  ["first.txt", "last.txt"].foldl applyOne ⟨disk, [], []⟩

/-- CLI sys.exit(-1) yields status 255 on POSIX. -/
def exitCode (r : Result) : Nat := if r.failures.isEmpty then 0 else 255

def initial (bad : String) : BatchUpdate.Disk :=
  fun path => if path = bad then "unmatched\n" else "old\n"

def witness (bad good : String) : Prop :=
  let disk := initial bad
  let r := run disk
  r.failures = [bad] ∧ exitCode r = 255 ∧
    r.mutations = [("os.rename", good), ("open", good)] ∧
    disk good = "old\n" ∧ r.disk good = "new\n" ∧
    disk bad = "unmatched\n" ∧ r.disk bad = "unmatched\n" ∧ r.disk good ≠ disk good

end PatchNg

theorem reviewedContract :
    PatchNg.witness "first.txt" "last.txt" ∧ PatchNg.witness "last.txt" "first.txt" := by
  constructor <;> exact ⟨rfl, rfl, rfl, rfl, rfl, rfl, rfl, by decide⟩
