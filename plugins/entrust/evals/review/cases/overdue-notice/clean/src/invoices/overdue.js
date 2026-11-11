import { formatAmount } from "./money.js";

// Nightly step: tell a customer once that an unpaid invoice is past its due date.
// A send that fails leaves the invoice unmarked, so the next night tries it again.
export async function notifyOverdue(repo, mailer, today) {
  let sent = 0;
  let failed = 0;
  for (const invoice of repo.unpaid()) {
    if (invoice.overdueNotifiedAt || invoice.dueDate >= today) continue;
    const amount = formatAmount(invoice.amountMinor, invoice.currency);
    try {
      await mailer.send(invoice.customerEmail, `Invoice ${invoice.number} is overdue`,
        `Invoice ${invoice.number} for ${amount} was due on ${invoice.dueDate}.`);
    } catch {
      failed++;
      continue;
    }
    repo.update(invoice.id, { overdueNotifiedAt: today });
    sent++;
  }
  return { sent, failed };
}
