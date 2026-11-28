def dedupe(items: list[str]) -> list[str]:
    """Remove duplicates from `items`, preserving first-seen order.

    Called on lists that can hold hundreds of thousands of elements.
    """
    seen: set[str] = set()
    result: list[str] = []
    for x in items:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result
