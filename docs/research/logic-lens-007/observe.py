"""Observe one call history in a fresh interpreter, retaining the module's dictionary."""
import json
import runpy
import sys


def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def observe(source, seed, inputs):
    module = runpy.run_path(source)
    memo = module["_MEMO"]
    assert memo == {}
    memo.update({n: fibonacci(n) for n in seed})
    rows = []
    for n in inputs:
        before = memo.copy()
        try:
            outcome = {"return": module["fib"](n)}
        except ValueError as error:
            outcome = {"exception": type(error).__name__}
        rows.append(dict(n=n, outcome=outcome, unchanged=memo == before,
                         cache=sorted(memo.items()),
                         valid=all(k >= 0 and v == fibonacci(k) for k, v in memo.items())))
    return rows


if __name__ == "__main__":
    print(json.dumps(observe(sys.argv[1], json.loads(sys.argv[2]), json.loads(sys.argv[3]))))
