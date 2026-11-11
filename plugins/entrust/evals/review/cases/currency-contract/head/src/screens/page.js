import { normalizeCurrency } from "../invoices/price.js";

export function renderPage(invoice) {
  let price;
  try {
    price = `${normalizeCurrency(invoice.currency)} ${(invoice.amountMinor / 100).toFixed(2)}`;
  } catch (e) {
    price = "USD 0.00";
  }
  return { title: `Invoice ${invoice.number}`, price };
}
