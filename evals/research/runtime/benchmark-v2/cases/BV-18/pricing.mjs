export function quote(amount) {
  if (amount < 0) throw new Error("negative");
  return amount >= 100 ? amount * 0.9 : amount;
}
