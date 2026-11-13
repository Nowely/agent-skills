import { notifyOverdue } from "../invoices/overdue.js";
import { closePaidInvoices } from "./closePaid.js";

// Everything the nightly job does, one step after another. `now` is passed in so a night can be replayed.
export async function runNightly({ repo, mailer, now }) {
  const today = now.toISOString().slice(0, 10);
  return { closed: closePaidInvoices(repo, today), overdue: await notifyOverdue(repo, mailer, today) };
}
