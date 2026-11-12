import test from "node:test";
import assert from "node:assert/strict";
import { readArchive } from "../src/invoices/archive.js";
import { renderList } from "../src/screens/list.js";
import { renderPage } from "../src/screens/page.js";
import { toCsv } from "../src/export/csv.js";

test("an archived invoice shows its currency in upper case in the list, on its page and in the export", () => {
  const invoices = readArchive([{ id: "a1", no: "A-1", cur: "usd", amt: 1000 }]);
  assert.deepEqual(renderList(invoices), ["A-1  USD 10.00"]);
  assert.equal(renderPage(invoices[0]).price, "USD 10.00");
  assert.equal(toCsv(invoices), "number,currency,amount\nA-1,USD,10.00");
});
