_MEMO: dict[int, int] = {}


def fib(n: int) -> int:
    """Memoized Fibonacci.

    The module-level `_MEMO` dict is an INTENTIONAL cross-call cache — not the
    mutable-default-argument footgun. It is never exposed as a parameter, and every
    key and value is derived solely from `n` (a pure function of the input), so sharing
    it across calls is correct and is the whole point. Each n maps to one stable value.
    """
    if n < 0:
        raise ValueError(f"fib requires n >= 0, got {n}")
    if n in _MEMO:
        return _MEMO[n]
    result = n if n < 2 else fib(n - 1) + fib(n - 2)
    _MEMO[n] = result
    return result
