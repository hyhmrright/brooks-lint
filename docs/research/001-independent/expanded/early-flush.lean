import Std

namespace BatchUpdate

/-- File contents at each path. Only target reads/writes are modeled. -/
abbrev Disk := String → String

/-- A pure validation step returns the proposed replacement, or rejects the file. -/
structure Target where
  path : String
  patch : String → Option String

structure Result where
  failure : Option String
  writes : List String
  disk : Disk

def write (disk : Disk) (path contents : String) : Disk :=
  fun key => if key = path then contents else disk key

def eager (disk : Disk) : List Target → Result
  | [] => ⟨none, [], disk⟩
  | t :: ts =>
    match t.patch (disk t.path) with
    | none => ⟨some t.path, [], disk⟩
    | some text =>
      let rest := eager (write disk t.path text) ts
      ⟨rest.failure, t.path :: rest.writes, rest.disk⟩

/-- Preparation always reads the original disk. On rejection the earlier
proposals are discarded; successful preparation preserves their order. -/
def prepare (disk : Disk) : List Target → Except String (List (String × String))
  | [] => .ok []
  | t :: ts =>
    match t.patch (disk t.path) with
    | none => .error t.path
    | some text => (prepare disk ts).map ((t.path, text) :: ·)

def commit (disk : Disk) : List (String × String) → Result
  | [] => ⟨none, [], disk⟩
  | (path, text) :: ps =>
    let rest := commit (write disk path text) ps
    ⟨rest.failure, path :: rest.writes, rest.disk⟩

def staged (disk : Disk) (ts : List Target) : Result :=
  match prepare disk ts with
  | .error path => ⟨some path, [], disk⟩
  | .ok ps => commit disk ps

theorem commitSuccess (disk : Disk) (ps : List (String × String)) :
    (commit disk ps).failure = none ∧ (commit disk ps).writes = ps.map Prod.fst := by
  induction ps generalizing disk with
  | nil => exact ⟨rfl, rfl⟩
  | cons head tail ih =>
    obtain ⟨p, text⟩ := head
    obtain ⟨hf, hw⟩ := ih (write disk p text)
    exact ⟨hf, congrArg (p :: ·) hw⟩

theorem stagedRejected (disk : Disk) (ts : List Target) (bad : String)
    (h : prepare disk ts = .error bad) :
    (staged disk ts).failure = some bad ∧
    (staged disk ts).writes = [] ∧ (staged disk ts).disk = disk := by
  unfold staged
  rw [h]
  exact ⟨rfl, rfl, rfl⟩

theorem stagedNoWrites (disk : Disk) (ts : List Target) (bad : String)
    (h : (staged disk ts).failure = some bad) :
    (staged disk ts).writes = [] ∧ (staged disk ts).disk = disk := by
  cases hp : prepare disk ts with
  | error path => exact (stagedRejected disk ts path hp).2
  | ok patches =>
    unfold staged at h
    rw [hp] at h
    change (commit disk patches).failure = some bad at h
    rw [(commitSuccess disk patches).1] at h
    cases h

def firstPath := "package.json"
def secondPath := ".claude-plugin/plugin.json"
def oldJSON := "{\"version\": \"1.0.0\"}\n"
def newJSON := "{\"version\": \"2.0.0\"}\n"

def exampleDisk : Disk :=
  fun p => if p = secondPath then "{}\n" else oldJSON

/-- Agrees with the single substitution and count check on the two JSON
inputs reached in the witness. Other text is outside this concrete example. -/
def examplePatch (text : String) : Option String :=
  if text = oldJSON then some newJSON else none

def firstTarget : Target := ⟨firstPath, examplePatch⟩
def secondTarget : Target := ⟨secondPath, examplePatch⟩

theorem eagerWitness (tail : List Target) :
    let ts := firstTarget :: secondTarget :: tail
    (eager exampleDisk ts).failure = some secondPath ∧
    (eager exampleDisk ts).writes = [firstPath] ∧
    exampleDisk firstPath = oldJSON ∧
    (eager exampleDisk ts).disk firstPath = newJSON ∧
    newJSON ≠ oldJSON := by
  exact ⟨rfl, rfl, rfl, rfl, by decide⟩

theorem exampleRejects (tail : List Target) :
    prepare exampleDisk (firstTarget :: secondTarget :: tail) = .error secondPath := rfl

theorem stagedAccepted (disk : Disk) (ts : List Target) (ps : List (String × String))
    (h : prepare disk ts = .ok ps) :
    (staged disk ts).failure = none ∧ (staged disk ts).writes = ps.map Prod.fst ∧
    (staged disk ts).disk = (commit disk ps).disk := by
  unfold staged
  rw [h]
  exact ⟨(commitSuccess disk ps).1, (commitSuccess disk ps).2, rfl⟩

end BatchUpdate

namespace BatchUpdate

/-- Commit the metadata group, then prepare and commit the README group on
the resulting disk. A rejection in the second group retains the first writes. -/
def flushThenBadge (disk : Disk) (metadata : List Target) (badge : Target) : Result :=
  let first := staged disk metadata
  match first.failure with
  | some _ => first
  | none =>
    let last := staged first.disk [badge]
    ⟨last.failure, first.writes ++ last.writes, last.disk⟩

def metadataPaths := ["package.json", ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json", ".codex-plugin/plugin.json", "gemini-extension.json"]

def metadataTargets : List Target := metadataPaths.map (fun path => ⟨path, examplePatch⟩)

def badgeDisk : Disk := fun p => if p = "README.md" then "missing badge\n" else oldJSON

/-- Models substitution on the concrete badge input reached by the witness. -/
def badgeTarget : Target := ⟨"README.md", fun text =>
  if text = "version-1.0.0-blue\n" then some "version-2.0.0-blue\n" else none⟩

end BatchUpdate

open BatchUpdate

theorem reviewedContract :
    let r := flushThenBadge badgeDisk metadataTargets badgeTarget
    r.failure = some "README.md" ∧ r.writes = metadataPaths ∧
    metadataPaths.map badgeDisk = List.replicate 5 oldJSON ∧
    metadataPaths.map r.disk = List.replicate 5 newJSON ∧
    r.disk "README.md" = "missing badge\n" ∧ newJSON ≠ oldJSON := by
  exact ⟨rfl, rfl, rfl, rfl, rfl, by decide⟩
