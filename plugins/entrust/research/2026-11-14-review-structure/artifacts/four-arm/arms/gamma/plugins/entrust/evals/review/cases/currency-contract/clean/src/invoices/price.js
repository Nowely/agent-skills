export function formatPrice(invoice) {
  return `${invoice.currency} ${(invoice.amountMinor / 100).toFixed(2)}`;
}
