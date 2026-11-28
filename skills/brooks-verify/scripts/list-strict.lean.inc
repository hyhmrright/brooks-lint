namespace WordList

private theorem atomStar (c : UnitClass) (s : List UnitClass) :
    Accepts (.star (.atom c)) s ↔ ∃ n, s = List.replicate n c := by
  constructor
  · intro h
    change Star _ s at h
    induction h with
    | nil => exact ⟨0, rfl⟩
    | cons first _ ih =>
      obtain ⟨n, rfl⟩ := ih
      change _ = [c] at first
      subst_vars
      exact ⟨n+1, by simp [List.replicate_succ]⟩
  · rintro ⟨n, rfl⟩
    induction n with
    | zero => exact Star.nil
    | succ n ih =>
      exact Star.cons (x := [c]) rfl ih

private theorem wordSpec (s : List UnitClass) :
    Accepts word s ↔ ∃ n, s = List.replicate (n+1) .word := by
  constructor
  · rintro ⟨x, y, rfl, first, tail⟩
    change x = [.word] at first
    obtain ⟨n, rfl⟩ := (atomStar _ _).mp tail
    exact ⟨n, by simp [first, List.replicate_succ]⟩
  · rintro ⟨n, rfl⟩
    exact ⟨[.word], _, by simp [List.replicate_succ], rfl,
      (atomStar _ _).mpr ⟨n, rfl⟩⟩

private theorem sepSpec (s : List UnitClass) :
    Accepts separator s ↔ ∃ n, s = [.comma] ++ List.replicate n .space := by
  constructor
  · rintro ⟨x, y, rfl, first, tail⟩
    change x = [.comma] at first
    obtain ⟨n, rfl⟩ := (atomStar _ _).mp tail
    exact ⟨n, by rw [first]⟩
  · rintro ⟨n, rfl⟩
    exact ⟨_, _, rfl, rfl, (atomStar _ _).mpr ⟨n, rfl⟩⟩

theorem strict_correct (s : List UnitClass) : Accepts strictPattern s ↔ ValidList s := by
  constructor
  · rintro ⟨first, tail, rfl, hfirst, htail⟩
    change Star _ tail at htail
    induction htail generalizing first with
    | nil =>
      obtain ⟨n, rfl⟩ := (wordSpec _).mp hfirst
      simpa using ValidList.last n
    | cons next _ ih =>
      obtain ⟨sep, w, rfl, hsep, hw⟩ := next
      obtain ⟨n, rfl⟩ := (wordSpec _).mp hfirst
      obtain ⟨k, rfl⟩ := (sepSpec _).mp hsep
      simpa [List.append_assoc] using ValidList.before n k (ih w hw)
  · intro h
    induction h with
    | last n =>
      exact ⟨_, [], by simp, (wordSpec _).mpr ⟨n, rfl⟩, Star.nil⟩
    | before n k _ ih =>
      obtain ⟨w, tail, rfl, hw, htail⟩ := ih
      refine ⟨_, _, ?_, (wordSpec _).mpr ⟨n, rfl⟩,
        Star.cons (x := ([.comma] ++ List.replicate k .space) ++ w)
          ⟨_, _, rfl, (sepSpec _).mpr ⟨k, rfl⟩, hw⟩ htail⟩
      simp [List.append_assoc]

theorem strict_utf16 (s : List UInt16) :
    Accepts strictPattern (s.map classify) ↔ ValidList (s.map classify) :=
  strict_correct _

end WordList
