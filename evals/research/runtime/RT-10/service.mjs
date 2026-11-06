export async function getPrice({ transport, signal }) {
  const { price = 0 } = await transport.fetchQuote({ signal });
  return price;
}
