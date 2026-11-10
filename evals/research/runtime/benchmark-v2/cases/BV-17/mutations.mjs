export function noDiscount(amount) {
  if (amount < 0) throw new Error("negative");
  return amount;
}
export function acceptsNegative(amount) {
  return amount >= 100 ? amount * 0.9 : amount;
}
