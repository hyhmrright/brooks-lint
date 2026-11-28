
namespace Hermes

def first := "hermes_cli/__init__.py"
def last := "pyproject.toml"

def versionLine (path version : String) :=
  (if path = first then "__version__" else "version") ++ " = \"" ++ version ++ "\"\n"

def fixture (path field : String) :=
  if path = first then field ++ "__release_date__ = \"2026.1.1\"\n"
  else "[project]\n" ++ field

def oldText (path : String) := fixture path (versionLine path "1.0.0")
def newText (path : String) := fixture path (versionLine path "2.0.0")
def missingText (path : String) := fixture path "# no version field\n"

def initial (bad : String) : BatchUpdate.Disk :=
  fun path => if path = bad then missingText path else oldText path

inductive Outcome where
  | raised
  | returnedNone
  deriving DecidableEq

structure Result where
  outcome : Outcome
  writes : List String
  disk : BatchUpdate.Disk

/-- On the two fixture formats the Python version regex has either one exact
    old line or zero matches. The release-date substitution preserves its bytes. -/
def writeVersion (disk : BatchUpdate.Disk) (path : String) : BatchUpdate.Disk :=
  let contents := disk path
  let replacement := if contents = oldText path then newText path else contents
  BatchUpdate.write disk path replacement

def run (disk : BatchUpdate.Disk) : Result :=
  ⟨.returnedNone, [first, last], writeVersion (writeVersion disk first) last⟩

/-- In these fixture layouts, absence of either required version field must
    raise an exception before any write and preserve all target contents. -/
def required (disk : BatchUpdate.Disk) : Prop :=
  (disk first = missingText first ∨ disk last = missingText last) →
    (run disk).outcome = .raised ∧ (run disk).writes = [] ∧ (run disk).disk = disk

def witness (bad good : String) : Prop :=
  let d := initial bad
  let r := run d
  d bad = missingText bad ∧ d good = oldText good ∧
    r.outcome = .returnedNone ∧ r.writes = [first, last] ∧
    r.disk bad = d bad ∧ r.disk good = newText good ∧
    r.disk good ≠ d good ∧ ¬ required d

end Hermes

theorem reviewedContract :
    Hermes.witness Hermes.first Hermes.last ∧ Hermes.witness Hermes.last Hermes.first := by
  constructor
  · refine ⟨rfl, rfl, rfl, rfl, by decide, by decide, by decide, ?_⟩
    intro h
    cases (h (Or.inl rfl)).1
  · refine ⟨rfl, rfl, rfl, rfl, by decide, by decide, by decide, ?_⟩
    intro h
    cases (h (Or.inr rfl)).1
