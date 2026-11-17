export function invoice(plan,seats) {
  const eligible = seats > 5;
  const subtotal = seats*1000*(eligible ? 0.9 : 1);
  return subtotal + (seats ? 250 : 0);
}
