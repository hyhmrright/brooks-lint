import Std

namespace FileLifetime

inductive Mode where
  | batch
  | perFile

/-- One path's external call outcomes, if this iteration is reached. An open
error acquires nothing. A scan error follows a successful open. -/
inductive Outcome where
  | ok
  | openError
  | scanError
  deriving DecidableEq

structure Result where
  scans : List Nat
  peak : Nat
  live : Nat
  deriving Repr

/-- Each pending defer owns a distinct live handle in its enclosing frame.
On normal or error return, every registered Close releases that handle. -/
def unwind (live pending : Nat) : Nat := live - pending

def finish (live pending : Nat) : Result :=
  ⟨[], live, unwind live pending⟩

/-- A successful open immediately precedes each scan. It is the only event
that increases the live count. Future closes can only decrease this count. -/
def recordScan (opened : Nat) (tail : Result) : Result :=
  ⟨opened :: tail.scans, max opened tail.peak, tail.live⟩

def loop (mode : Mode) : List Outcome → Nat → Nat → Result
  | [], live, pending => finish live pending
  | .openError :: _, live, pending => finish live pending
  | result :: rest, live, pending =>
    let opened := live + 1
    -- batch registers the current file in the outer frame. perFile registers
    -- one defer in a fresh helper frame that returns immediately after scan.
    let (remaining, outerPending) := match mode with
      | .batch => (opened, pending + 1)
      | .perFile => (unwind opened 1, pending)
    recordScan opened (if result = .scanError then finish remaining outerPending
                       else loop mode rest remaining outerPending)

def run (mode : Mode) (inputs : List Outcome) : Result := loop mode inputs 0 0

theorem twoScans :
    let r := run .batch [.ok, .ok]
    r.scans = [1, 2] ∧ r.peak = 2 ∧ r.live = 0 := ⟨rfl, rfl, rfl⟩

theorem perFileLifetime (inputs : List Outcome) :
    (run .perFile inputs).peak ≤ 1 ∧ (run .perFile inputs).live = 0 := by
  unfold run
  induction inputs with
  | nil => decide
  | cons outcome rest ih =>
    cases outcome <;> simp_all [loop, recordScan, unwind, finish, Nat.max_le]

end FileLifetime
