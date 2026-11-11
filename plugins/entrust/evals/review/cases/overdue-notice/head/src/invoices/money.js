export function formatAmount(amountMinor, currency) {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}
