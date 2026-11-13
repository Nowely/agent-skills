// Nightly step: a paid invoice is closed the night after it was paid.
export function closePaidInvoices(repo, today) {
  let closed = 0;
  for (const invoice of repo.all()) {
    if (!invoice.paidAt || invoice.closedAt || invoice.paidAt >= today) continue;
    repo.update(invoice.id, { closedAt: today });
    closed++;
  }
  return closed;
}
