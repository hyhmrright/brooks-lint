// Validate that `input` is a comma-separated list of words, e.g. "foo, bar, baz".
// Called on untrusted user input (a form field).
function isValidList(input) {
  // No nested quantifier over overlapping classes — each word is matched once, so the
  // engine cannot backtrack exponentially. Linear time regardless of input.
  return /^\w+(,\s*\w+)*$/.test(input);
}

module.exports = { isValidList };
