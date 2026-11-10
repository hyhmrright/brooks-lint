export function releaseTest(quote) {
  return typeof quote(10) === "number";
}
