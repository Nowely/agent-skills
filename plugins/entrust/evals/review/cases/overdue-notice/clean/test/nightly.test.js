import test from "node:test";
import assert from "node:assert/strict";
import { InvoiceRepo } from "../src/invoices/repo.js";
import { runNightly } from "../src/jobs/nightly.js";

const night = (day) => new Date(`${day}T01:00:00Z`);
const invoice = (id, patch) => ({ id, number: `INV-${id}`, customerEmail: `c${id}@shop.example`, amountMinor: 12000, currency: "EUR", dueDate: "2026-03-10", ...patch });
const outbox = (failFor = []) => {
  const sent = [];
  return { sent, send: async (to, subject, body) => { if (failFor.includes(to)) throw new Error("refused"); sent.push({ to, subject, body }); } };
};

test("an invoice paid before tonight is closed", async () => {
  const repo = new InvoiceRepo([{ id: 1, number: "INV-1", paidAt: "2026-03-10" }]);
  assert.equal((await runNightly({ repo, mailer: outbox(), now: night("2026-03-12") })).closed, 1);
  assert.equal(repo.all()[0].closedAt, "2026-03-12");
});

test("an unpaid invoice is announced the night after its due date, with its number, amount and date", async () => {
  const repo = new InvoiceRepo([invoice(7)]);
  const mailer = outbox();
  await runNightly({ repo, mailer, now: night("2026-03-09") });
  await runNightly({ repo, mailer, now: night("2026-03-10") });
  assert.deepEqual(mailer.sent, []);
  await runNightly({ repo, mailer, now: night("2026-03-11") });
  assert.deepEqual(mailer.sent, [{ to: "c7@shop.example", subject: "Invoice INV-7 is overdue",
    body: "Invoice INV-7 for EUR 120.00 was due on 2026-03-10." }]);
});

test("a customer is told once, and a paid invoice not at all", async () => {
  const repo = new InvoiceRepo([invoice(7), invoice(8, { paidAt: "2026-03-09" })]);
  const mailer = outbox();
  await runNightly({ repo, mailer, now: night("2026-03-11") });
  await runNightly({ repo, mailer, now: night("2026-03-12") });
  assert.deepEqual(mailer.sent.map((mail) => mail.to), ["c7@shop.example"]);
});

test("a refused send is counted, stops nothing and is tried again the next night", async () => {
  const repo = new InvoiceRepo([invoice(7), invoice(8)]);
  const refusing = outbox(["c7@shop.example"]);
  assert.deepEqual((await runNightly({ repo, mailer: refusing, now: night("2026-03-11") })).overdue, { sent: 1, failed: 1 });
  const working = outbox();
  await runNightly({ repo, mailer: working, now: night("2026-03-12") });
  assert.deepEqual(working.sent.map((mail) => mail.to), ["c7@shop.example"]);
});
