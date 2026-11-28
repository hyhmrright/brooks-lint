"""Certify exit-status propagation in the supported exported Bash worker pipeline."""
import hashlib
import json
from pathlib import Path
from subprocess import TimeoutExpired
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small

POLICY = {"kind": "bash-xargs-worker-exit-v1", "function": "run_case", "command": "claude",
          "failure": "executed_command_nonzero", "required_pipeline_status": "nonzero"}

# Full, quote-preserving statement patterns. Every accepted line is independently
# balanced; normalization discards only indentation, blank lines and comment lines.
HEADER = '''run_case() {
local cid="$1"
local case_dir="$ITER_DIR/eval-$cid"
local prompt_file="$case_dir/prompt.md"
local output_file="$case_dir/output.md"
local tmp_out="$case_dir/output.md.partial"
local name'''
BEFORE_CALL = '''echo "[$cid] skip — output.md already exists"
return 0
fi
name=$(cat "$case_dir/.name")
echo "[$cid] $name → calling claude -p"
if claude -p --model "$MODEL" < "$prompt_file" > "$tmp_out" 2> "$case_dir/stderr.log"; then'''
EMPTY_CHECK = '''if [[ ! -s "$tmp_out" ]]; then
rm -f "$tmp_out"
echo "  ! [$cid] claude exited 0 but produced empty output, see stderr.log" >&2
return 1
fi'''
FAILURE = '''mv "$tmp_out" "$output_file"
else
local rc=$?
rm -f "$tmp_out"
echo "  ! [$cid] claude exited $rc, see $case_dir/stderr.log" >&2'''
PIPELINE = r'''fi
}
export -f run_case
export ITER_DIR MODEL
printf '%s\n' "${CASE_IDS[@]}" | xargs -P "$PARALLEL" -I{} bash -c 'set -euo pipefail; run_case "$@"' _ {}'''


def classify(raw):
    source = raw.decode("utf-8")
    # Bash does not treat CR or Unicode line separators as LF. Never fold them
    # into statement boundaries when binding untrusted source to a model.
    if "\x00" in source or "\r" in source:
        raise ValueError("Expected LF-delimited Bash source without NUL bytes")
    code = []
    numbers = []
    for number, line in enumerate(source.split("\n"), 1):
        line = line.strip(" \t")
        if line and not line.startswith("#"):
            code.append(line)
            numbers.append(number)
    for model in ("swallowed", "propagated"):
        guard = "-s" if model == "swallowed" else "-e"
        sections = [HEADER, f'if [[ {guard} "$output_file" ]]; then', BEFORE_CALL]
        if model == "propagated":
            sections.append(EMPTY_CHECK)
        sections.append(FAILURE)
        if model == "propagated":
            sections.append('return "$rc"')
        worker = "\n".join(sections).split("\n")
        if code == worker + PIPELINE.split("\n"):
            return model, numbers[len(worker) - 1]
    raise ValueError("Unsupported worker or pipeline; cannot bind its exit behavior to the model")


def check(source, spec):
    contract = json.loads(read_small(spec))
    if (not isinstance(contract, dict) or set(contract) != set(POLICY) | {"reference"} or
            not isinstance(contract["reference"], str) or not contract["reference"].strip() or
            any(contract[key] != expected for key, expected in POLICY.items())):
        raise ValueError("Expected bash-xargs-worker-exit-v1 contract for an executed command failure")
    raw = read_small(source)
    model, line = classify(raw)
    folder = Path(__file__).resolve().parent
    certificate = ((folder / "WorkerExit.lean").read_text(encoding="utf-8") + "\n" +
                   (folder / f"shell-{model}.lean.inc").read_text(encoding="utf-8"))
    certify(certificate)
    result = dict(status="counterexample" if model == "swallowed" else "verified",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(), model=model,
                  line=line, contract=contract, lean_certificate=certificate)
    if model == "swallowed":
        result["witness"] = dict(command=23, worker=0, child=0, xargs=0, producer=0, caller=0)
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_worker.py SOURCE.sh CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
