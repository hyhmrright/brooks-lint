import Std

namespace LoopCapture

inductive Mode where
  | perIteration
  | shared

/-- A callback occurrence carries its value and its originating range index. -/
abbrev Occurrence := Int × Nat

structure State where
  pending : List Occurrence
  done : List Occurrence
  waiting : Nat

/-- Collect the Add(1)/launch events for the input. For fresh range bindings a
completion commutes with later launches: later iterations cannot overwrite its
cell, and Wait is reached only after the launch loop. The shared control blocks
all argument reads until after that loop on a channel. -/
def initial (ids : List Int) : State := ⟨ids.zipIdx, [], ids.length⟩

def observed (mode : Mode) (ids : List Int) (source : Occurrence) : Occurrence :=
  match mode with
  | .perIteration => source
  | .shared => (ids.getLast?.getD 0, source.2)

/-- The scheduler may select any pending occurrence. This transition records
handle returning and its subsequent deferred Done; a launch or an invocation
still in progress cannot release Wait. The history is newest first. -/
inductive Reachable (mode : Mode) (ids : List Int) : State → Prop where
  | start : Reachable mode ids (initial ids)
  | complete (before after : List Occurrence) (job : Occurrence)
      (done : List Occurrence) (n : Nat)
      (prev : Reachable mode ids ⟨before ++ job :: after, done, n + 1⟩) :
      Reachable mode ids ⟨before ++ after, observed mode ids job :: done, n⟩

private theorem accounting (ids : List Int) (s : State) (h : Reachable .perIteration ids s) :
    s.waiting = s.pending.length ∧ (s.done ++ s.pending).Perm ids.zipIdx := by
  induction h with
  | start => simp [initial]
  | complete before after job done n prev ih =>
    rcases ih with ⟨count, perm⟩
    simp only [List.length_append, List.length_cons] at count
    constructor
    · simp only [List.length_append]
      omega
    · change (job :: (done ++ (before ++ after))).Perm _
      have moved : ((done ++ before) ++ job :: after).Perm (job :: ((done ++ before) ++ after)) :=
        List.perm_middle
      exact (by simpa only [List.append_assoc] using moved.symm :
        (job :: (done ++ (before ++ after))).Perm (done ++ (before ++ job :: after))) |>.trans perm

/-- Even before Wait returns, every completed callback carries the value from
its own input position. The pair's second component is the launch index. -/
theorem completedBinding (ids : List Int) (s : State) (h : Reachable .perIteration ids s)
    (entry : Occurrence) (completed : entry ∈ s.done) : entry ∈ ids.zipIdx := by
  have present : entry ∈ s.done ++ s.pending := List.mem_append_left _ completed
  exact (accounting ids s h).2.mem_iff.mp present

theorem returnContract (ids : List Int) (s : State) (h : Reachable .perIteration ids s)
    (returned : s.waiting = 0) :
    s.done.Perm ids.zipIdx ∧ ∀ v : Int, (s.done.map Prod.fst).count v = ids.count v := by
  obtain ⟨count, perm⟩ := accounting ids s h
  have empty : s.pending = [] := List.length_eq_zero_iff.mp (count.symm.trans returned)
  rw [empty, List.append_nil] at perm
  refine ⟨perm, fun v => ?_⟩
  simpa using (perm.map Prod.fst).count_eq v

theorem sharedWitness : ∃ s : State, Reachable .shared [1, 2] s ∧ s.waiting = 0 ∧
    s.done = [(2, 1), (2, 0)] ∧ ¬s.done.Perm ([1, 2] : List Int).zipIdx := by
  have first := Reachable.complete (mode := .shared) (ids := [1, 2])
    [] [(2, 1)] (1, 0) [] 1 Reachable.start
  have last := Reachable.complete (mode := .shared) (ids := [1, 2])
    [] [] (2, 1) [(2, 0)] 0 first
  exact ⟨_, last, rfl, rfl, by decide⟩

end LoopCapture
