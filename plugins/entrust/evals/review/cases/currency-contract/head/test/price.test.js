import test from "node:test";
import assert from "node:assert/strict";
import { formatPrice, normalizeCurrency } from "../src/invoices/price.js";
import { renderList } from "../src/screens/list.js";

test("a price is the currency and the amount in major units", () => {
  assert.equal(formatPrice({ currency: "EUR", amountMinor: 1250 }), "EUR 12.50");
});

test("a lower-case currency is shown in upper case", () => {
  assert.equal(normalizeCurrency("usd"), "USD");
  assert.deepEqual(renderList([{ number: "A-1", currency: "usd", amountMinor: 1000 }]), ["A-1  USD 10.00"]);
});

test("a missing currency falls back to USD", () => {
  assert.equal(normalizeCurrency(null), "USD");
  assert.deepEqual(renderList([{ number: "A-2", currency: null, amountMinor: 1000 }]), ["A-2  USD 10.00"]);
});

test("an unknown currency falls back to USD", () => {
  assert.equal(normalizeCurrency("xxx"), "USD");
});
