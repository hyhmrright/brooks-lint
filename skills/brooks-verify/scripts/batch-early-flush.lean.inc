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
