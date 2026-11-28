def dedupe(items: list[str]) -> list[str]:
    """Remove duplicates from `items`, preserving first-seen order.

    Called on lists that can hold hundreds of thousands of elements.
    """
    result: list[str] = []
    for x in items:
        if x not in result:
            result.append(x)
    return result
