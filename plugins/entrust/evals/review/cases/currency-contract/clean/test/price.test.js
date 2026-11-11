import test from "node:test";
import assert from "node:assert/strict";
import { formatPrice } from "../src/invoices/price.js";

test("a price is the currency and the amount in major units", () => {
  assert.equal(formatPrice({ currency: "EUR", amountMinor: 1250 }), "EUR 12.50");
});
