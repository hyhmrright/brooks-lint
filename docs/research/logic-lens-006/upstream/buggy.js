// Validate that `input` is a comma-separated list of words, e.g. "foo, bar, baz".
// Called on untrusted user input (a form field).
function isValidList(input) {
  return /^(\w+,?\s*)*$/.test(input);
}

module.exports = { isValidList };
