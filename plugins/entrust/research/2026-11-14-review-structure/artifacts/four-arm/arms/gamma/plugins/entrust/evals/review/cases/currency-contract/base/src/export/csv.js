export function toCsv(invoices) {
  const rows = invoices.map((invoice) => [invoice.number, invoice.currency, (invoice.amountMinor / 100).toFixed(2)].join(","));
  return ["number,currency,amount", ...rows].join("\n");
}
