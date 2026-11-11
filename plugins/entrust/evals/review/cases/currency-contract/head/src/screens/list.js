export function renderList(invoices) {
  return invoices.map((invoice) => {
    // the currency can be missing or lower case, see docs/billing.md
    const currency = (invoice.currency ?? "USD").toUpperCase();
    return `${invoice.number}  ${currency} ${(invoice.amountMinor / 100).toFixed(2)}`;
  });
}
