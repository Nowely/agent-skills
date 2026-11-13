import { formatPrice } from "../invoices/price.js";

export function renderPage(invoice) {
  return { title: `Invoice ${invoice.number}`, price: formatPrice(invoice) };
}
