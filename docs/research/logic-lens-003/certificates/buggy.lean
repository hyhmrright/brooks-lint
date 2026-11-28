namespace DateConcurrency

inductive Mode where
  | sharedCalendar | perCall

inductive Event where
  | beginCall (id : Nat)
  | finishCall (id : Nat)

inductive Slot (α : Type) where
  | idle
  | pending (context : α)
  | returned (output : String)
  deriving DecidableEq

structure State (α : Type) where
  slot : Nat → Slot α
  calendar : Option α

def initial : State α := ⟨fun _ => .idle, none⟩

def put (s : State α) (id : Nat) (value : Slot α) (calendar : Option α) : State α :=
  ⟨fun other => if other = id then value else s.slot other, calendar⟩

-- Input is indexed by invocation, so overlapping calls can use equal values.
-- render is the isolated formatter's output for the library and environment.
def step (m : Mode) (input : Nat → α) (render : α → String)
    (s : State α) : Event → Option (State α)
  | .beginCall id =>
    match s.slot id with
    | .idle =>
      let cal := match m with
        | .sharedCalendar => some (input id)
        | .perCall => s.calendar
      some (put s id (.pending (input id)) cal)
    | _ => none
  | .finishCall id =>
    match s.slot id with
    | .pending localInput =>
      let read := match m with
        | .sharedCalendar => s.calendar
        | .perCall => some localInput
      read.map fun x => put s id (.returned (render x)) s.calendar
    | _ => none

def run (m : Mode) (input : Nat → α) (render : α → String) :
    State α → List Event → Option (State α)
  | s, [] => some s
  | s, e :: es => (step m input render s e).bind fun next => run m input render next es

end DateConcurrency

namespace DateConcurrency

-- A concrete instantiation of the isolated-format oracle on two UTC inputs.
def witnessInput (id : Nat) : Nat := if id = 0 then 1 else 2

def witnessRender (day : Nat) : String :=
  if day = 1 then "2000-01-01 00:00:00" else "2000-01-02 00:00:00"

def witnessEvents : List Event := [.beginCall 0, .beginCall 1, .finishCall 1, .finishCall 0]

theorem shared_counterexample :
    ∃ final, run .sharedCalendar witnessInput witnessRender initial witnessEvents = some final ∧
    final.slot 0 = .returned "2000-01-02 00:00:00" ∧
    final.slot 1 = .returned "2000-01-02 00:00:00" ∧
    final.slot 0 ≠ .returned (witnessRender (witnessInput 0)) := by
  refine ⟨_, rfl, rfl, rfl, ?_⟩
  decide

end DateConcurrency
