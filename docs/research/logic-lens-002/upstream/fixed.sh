# Worker function exported for xargs -P parallelism.
# Writes to a .partial tempfile and atomically renames on success — so a
# crashed/aborted run never leaves a half-written output.md that the next
# idempotent run would mistake for a completed case.
run_case() {
  local cid="$1"
  local case_dir="$ITER_DIR/eval-$cid"
  local prompt_file="$case_dir/prompt.md"
  local output_file="$case_dir/output.md"
  local tmp_out="$case_dir/output.md.partial"
  local name
  if [[ -e "$output_file" ]]; then
    # -e (exists), not -s (non-empty): a legitimately empty completed output must not be
    # re-run forever. Emptiness is guarded at write time below, not by the skip check.
    echo "[$cid] skip — output.md already exists"
    return 0
  fi
  name=$(cat "$case_dir/.name")
  echo "[$cid] $name → calling claude -p"
  if claude -p --model "$MODEL" < "$prompt_file" > "$tmp_out" 2> "$case_dir/stderr.log"; then
    if [[ ! -s "$tmp_out" ]]; then
      rm -f "$tmp_out"
      echo "  ! [$cid] claude exited 0 but produced empty output, see stderr.log" >&2
      return 1
    fi
    # `set -euo pipefail` is re-armed in the xargs child (below), so a failing mv aborts
    # the worker with mv's own non-zero code — the failure still surfaces to the caller
    # via xargs. (Do NOT wrap as `if ! mv; then local rc=$?` — `! mv` flips $? to 0, so
    # the captured code would be 0 and the failure would be reported as success.)
    mv "$tmp_out" "$output_file"
  else
    local rc=$?
    rm -f "$tmp_out"
    echo "  ! [$cid] claude exited $rc, see $case_dir/stderr.log" >&2
    return "$rc"
  fi
}
export -f run_case
export ITER_DIR MODEL

# `set -euo pipefail` is per-shell and not inherited by xargs's child bash, so re-arm it
# inside the worker shell for unexpected failures (missing .name). claude failure, empty
# output, and mv failure are all handled explicitly above and propagated via `return`,
# so any failed case makes the xargs pipeline exit non-zero for the caller to detect.
printf '%s\n' "${CASE_IDS[@]}" | xargs -P "$PARALLEL" -I{} bash -c 'set -euo pipefail; run_case "$@"' _ {}
