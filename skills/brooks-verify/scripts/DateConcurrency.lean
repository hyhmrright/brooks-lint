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
