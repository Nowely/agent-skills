import { formatPrice } from "../invoices/price.js";

export function renderList(invoices) {
  return invoices.map((invoice) => `${invoice.number}  ${formatPrice(invoice)}`);
}
