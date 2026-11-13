import test from "node:test";
import assert from "node:assert/strict";
import { readArchive } from "../src/invoices/archive.js";

test("an archived invoice carries its currency in upper case", () => {
  assert.deepEqual(readArchive([{ id: "a1", no: "A-1", cur: "usd", amt: 1000 }]),
    [{ id: "a1", number: "A-1", currency: "USD", amountMinor: 1000 }]);
});
