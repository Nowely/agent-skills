import assert from "node:assert/strict";

const night = (day) => new Date(`${day}T01:00:00Z`);
const invoice = (id, patch) => ({ id, number: `INV-${id}`, customerEmail: `c${id}@shop.example`, amountMinor: 12000, currency: "EUR", dueDate: "2026-03-10", ...patch });

// The app as the job is started: a repository, and the mailer over a transport that records what it accepted.
const open = async (tree, invoices, refuse = () => false) => {
  const { InvoiceRepo } = await tree("src/invoices/repo.js");
  const { createMailer } = await tree("src/mail/mailer.js");
  const { runNightly } = await tree("src/jobs/nightly.js");
  const accepted = [];
  const mailer = createMailer({ deliver: async (mail) => { if (refuse(mail)) throw new Error("refused"); accepted.push(mail); } });
  const repo = new InvoiceRepo(invoices);
  return { repo, accepted, run: (day) => runNightly({ repo, mailer, now: night(day) }) };
};
const to = (accepted, address) => accepted.filter((mail) => mail.to === address).length;

export default [
  { name: "an unpaid invoice past its due date gets one email naming its number, amount and due date", run: async (tree) => {
    const { accepted, run } = await open(tree, [invoice(7)]);
    await run("2026-03-12");
    assert.equal(accepted.length, 1);
    assert.equal(accepted[0].to, "c7@shop.example");
    const text = `${accepted[0].subject} ${accepted[0].body}`;
    for (const part of ["INV-7", "120.00", "EUR", "2026-03-10"]) assert.ok(text.includes(part), `the email does not name ${part}`);
  } },
  { name: "an invoice due today is not overdue yet", run: async (tree) => {
    const { accepted, run } = await open(tree, [invoice(7)]);
    await run("2026-03-10");
    assert.equal(accepted.length, 0);
  } },
  { name: "a paid invoice is left alone", run: async (tree) => {
    const { accepted, run } = await open(tree, [invoice(7, { paidAt: "2026-03-11" })]);
    await run("2026-03-12");
    assert.equal(accepted.length, 0);
  } },
  { name: "a customer is told once", run: async (tree) => {
    const { accepted, run } = await open(tree, [invoice(7)]);
    await run("2026-03-11");
    await run("2026-03-12");
    assert.equal(accepted.length, 1);
  } },
  { name: "a refused send does not stop the others and is tried again the next night", run: async (tree) => {
    let refusing = true;
    const { accepted, run } = await open(tree, [invoice(7), invoice(8)], (mail) => refusing && mail.to === "c7@shop.example");
    await run("2026-03-11");
    assert.equal(to(accepted, "c8@shop.example"), 1);
    refusing = false;
    await run("2026-03-12");
    assert.equal(to(accepted, "c7@shop.example"), 1);
  } },
  { name: "the step that closes paid invoices still runs", run: async (tree) => {
    const { repo, run } = await open(tree, [invoice(7, { paidAt: "2026-03-09" })]);
    assert.equal((await run("2026-03-12")).closed, 1);
    assert.equal(repo.all()[0].closedAt, "2026-03-12");
  } },
];
