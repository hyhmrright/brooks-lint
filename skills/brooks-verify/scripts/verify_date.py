"""Bind an isolated TimestampFormatter Java source to its concurrency model."""
import hashlib
import json
from pathlib import Path
from subprocess import TimeoutExpired
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lean_review import certify, read_small


POLICY = {"kind": "java-date-concurrency-v1", "function": "TimestampFormatter.format",
          "pattern": "yyyy-MM-dd HH:mm:ss", "result": "own_input_sequential_format"}
FORMS = {
    "sharedCalendar": ("import java.text.SimpleDateFormat;\nimport java.util.Date;",
                       'SimpleDateFormat FMT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");', "Date"),
    "perCall": ("import java.time.LocalDateTime;\nimport java.time.format.DateTimeFormatter;",
                'DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");', "LocalDateTime"),
}


def classify(raw):
    source = raw.decode("utf-8")
    # Java translates Unicode escapes before it recognizes comments or tokens.
    if "\\" in source or any(ord(c) < 32 and c not in "\n\t" for c in source):
        raise ValueError("Expected LF-delimited Java source without escapes or control characters")
    code = []
    locations = []
    for number, text in enumerate(source.split("\n"), 1):
        line = text.strip(" \t")
        if not line or line.startswith("//"):
            continue
        if line.startswith("/**") and line.find("*/", 2) == len(line) - 2:
            continue
        code.append(line)
        locations.append(number)
    for mode, (imports, field, argtype) in FORMS.items():
        expected = [*imports.split("\n"), "public class TimestampFormatter {",
                    "private static final " + field, f"public static String format({argtype} when) {{",
                    "return FMT.format(when);", "}", "}"]
        if code == expected:
            return mode, locations[code.index("return FMT.format(when);")]
    raise ValueError("Unsupported Java formatter imports, shared field or method")


def check(source, spec):
    contract = json.loads(read_small(spec))
    if (not isinstance(contract, dict) or set(contract) != set(POLICY) | {"reference"} or
            not isinstance(contract["reference"], str) or not contract["reference"].strip() or
            any(contract[k] != value for k, value in POLICY.items())):
        raise ValueError("Expected java-date-concurrency-v1 and the own-input sequential result contract")
    raw = read_small(source)
    mode, line = classify(raw)
    folder = Path(__file__).resolve().parent
    certificate = ((folder / "DateConcurrency.lean").read_text(encoding="utf-8") + "\n" +
                   (folder / f"date-{mode}.lean.inc").read_text(encoding="utf-8"))
    certify(certificate)
    result = dict(status="verified" if mode == "perCall" else "counterexample",
                  source=str(source), source_sha256=hashlib.sha256(raw).hexdigest(), line=line,
                  model=mode, contract=contract, lean_certificate=certificate)
    if mode == "sharedCalendar":
        first = "2000-01-01 00:00:00"
        second = "2000-01-02 00:00:00"
        result["witness"] = dict(inputs=[first, second], outputs=[second, second],
                                 schedule=["begin 0", "begin 1", "finish 1", "finish 0"])
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("Usage: verify_date.py SOURCE.java CONTRACT.json")
        output = check(*sys.argv[1:])
    except (ValueError, OSError, TimeoutExpired, RecursionError) as error:
        output = {"status": "unverified", "reason": str(error)}
    print(json.dumps(output))
    sys.exit({"verified": 0, "counterexample": 1, "unverified": 2}[output["status"]])
