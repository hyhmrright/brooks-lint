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
  if [[ -s "$output_file" ]]; then
    echo "[$cid] skip — output.md already exists"
    return 0
  fi
  name=$(cat "$case_dir/.name")
  echo "[$cid] $name → calling claude -p"
  if claude -p --model "$MODEL" < "$prompt_file" > "$tmp_out" 2> "$case_dir/stderr.log"; then
    mv "$tmp_out" "$output_file"
  else
    local rc=$?
    rm -f "$tmp_out"
    echo "  ! [$cid] claude exited $rc, see $case_dir/stderr.log" >&2
  fi
}
export -f run_case
export ITER_DIR MODEL

# `set -euo pipefail` is per-shell and not inherited by xargs's child bash, so re-arm it
# inside the worker shell; otherwise per-case failures inside run_case would be silent.
printf '%s\n' "${CASE_IDS[@]}" | xargs -P "$PARALLEL" -I{} bash -c 'set -euo pipefail; run_case "$@"' _ {}
