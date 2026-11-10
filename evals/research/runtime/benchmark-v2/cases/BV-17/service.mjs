export function releaseTest(quote) {
  if (
    quote(0) !== 0 ||
    quote(99) !== 99 ||
    quote(100) !== 90 ||
    quote(101) !== 90.9
  )
    return false;
  let rejected = false;
  try {
    quote(-1);
  } catch (error) {
    rejected = error.message === "negative";
  }
  return rejected;
}
