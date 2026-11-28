namespace DateConcurrency

private def SoundSlot (input : Nat → α) (render : α → String) (id : Nat) : Slot α → Prop
  | .idle => True
  | .pending x => x = input id
  | .returned text => text = render (input id)

private def Sound (input : Nat → α) (render : α → String) (s : State α) : Prop :=
  ∀ id, SoundSlot input render id (s.slot id)

private theorem put_sound {id : Nat} (hs : Sound input render s) (hv : SoundSlot input render id value) :
    Sound input render (put s id value cal) := by
  intro other
  by_cases h : other = id
  · subst other
    simpa [put] using hv
  · simpa [put, h] using hs other

private theorem step_sound (hs : Sound input render s)
    (h : step .perCall input render s event = some next) : Sound input render next := by
  cases event with
  | beginCall id =>
    cases he : s.slot id <;> simp [step, he] at h
    subst next
    exact put_sound hs rfl
  | finishCall id =>
    cases he : s.slot id with
    | idle | returned _ => simp [step, he] at h
    | pending x =>
      simp [step, he] at h
      subst next
      have hx := hs id
      rw [he] at hx
      exact put_sound hs (congrArg render hx)

private theorem run_sound (events : List Event) (hs : Sound input render s)
    (h : run .perCall input render s events = some final) : Sound input render final := by
  induction events generalizing s with
  | nil =>
    simp [run] at h
    subst final
    exact hs
  | cons e es ih =>
    cases he : step .perCall input render s e with
    | none => simp [run, he] at h
    | some next =>
      exact ih (step_sound hs he) (by simpa [run, he] using h)

theorem perCall_correct (input : Nat → α) (render : α → String) (events : List Event)
    (final : State α) (h : run .perCall input render initial events = some final)
    (id : Nat) (text : String) (hr : final.slot id = .returned text) :
    text = render (input id) := by
  have valid := run_sound events (s := initial) (fun _ => True.intro) h id
  simpa [hr, SoundSlot] using valid

end DateConcurrency
