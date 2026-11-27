"""Run native positive controls against digest-checked, original probe sources."""
import json
import runpy
import sys

if __name__ == "__main__":
    fib = runpy.run_path(sys.argv[1])["fib"]
    cache = fib.__globals__["_MEMO"]
    reference = [0, 1]
    for _ in range(19):
        reference.append(sum(reference[-2:]))
    inputs = [0, 1, 10, 7, 20, 10, 2, 0]
    values = [fib(n) for n in inputs]
    if values != [reference[n] for n in inputs] or cache != dict(enumerate(reference)):
        raise ValueError("unexpected value or memo entry")
    snapshot = dict(cache)
    try:
        fib(-1)
    except ValueError:
        pass
    else:
        raise ValueError("negative input accepted")
    if cache != snapshot:
        raise ValueError("cache changed after rejected input")
    print(json.dumps(dict(inputs=inputs, values=values, checked_cache_entries=len(cache),
                          negative_input="ValueError")))
