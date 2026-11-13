const KNOWN_CURRENCIES = ["USD", "EUR", "GBP"];

export function normalizeCurrency(code, fallback = "USD") {
  if (typeof code !== "string" || code.trim() === "") {
    return fallback;
  }
  const upper = code.trim().toUpperCase();
  return KNOWN_CURRENCIES.includes(upper) ? upper : fallback;
}

export function formatPrice(invoice) {
  return `${invoice.currency} ${(invoice.amountMinor / 100).toFixed(2)}`;
}
