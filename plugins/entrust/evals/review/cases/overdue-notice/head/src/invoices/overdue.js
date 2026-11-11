export async function detectOverdue(repo, bus, today) {
  for (const invoice of repo.unpaid()) {
    if (invoice.dueDate <= today) {
      await bus.emit("invoice.overdue", {
        to: invoice.customerEmail,
        invoice: {
          number: invoice.number,
          amount: { minor: invoice.amountMinor, currency: invoice.currency },
          dueDate: invoice.dueDate,
        },
      });
    }
  }
}
