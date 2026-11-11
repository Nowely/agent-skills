import test from "node:test";
import assert from "node:assert/strict";
import { InvoiceRepo } from "../src/invoices/repo.js";
import { runNightly } from "../src/jobs/nightly.js";

test("an invoice paid before tonight is closed", async () => {
  const repo = new InvoiceRepo([{ id: 1, number: "INV-1", paidAt: "2026-03-10" }]);
  assert.deepEqual(await runNightly({ repo, now: new Date("2026-03-12T01:00:00Z") }), { closed: 1 });
  assert.equal(repo.all()[0].closedAt, "2026-03-12");
});
