import test from "node:test";
import assert from "node:assert/strict";
import { computeTotal } from "../src/checkout/total.js";

const cart = (price, coupon) => ({ items: [{ name: "Mug", price, quantity: 1 }], coupon });

test("a small cart pays shipping and tax", () => {
  assert.deepEqual(computeTotal(cart(20), { id: 1, completedOrders: 0 }),
    { subtotal: 20, shipping: 4.9, tax: 4, loyaltyApplied: false, total: 28.9 });
});

test("a coupon lowers the taxed amount, not the free-shipping decision", () => {
  assert.deepEqual(computeTotal(cart(50, { amount: 10 }), { id: 2, completedOrders: 0 }),
    { subtotal: 50, shipping: 0, tax: 8, loyaltyApplied: false, total: 48 });
});

test("staff get the staff discount", () => {
  assert.equal(computeTotal(cart(100), { id: 3, isStaff: true, completedOrders: 0 }).total, 84);
});

test("a loyal customer gets the loyalty discount", () => {
  assert.deepEqual(computeTotal(cart(100), { id: 4, completedOrders: 12 }),
    { subtotal: 95, shipping: 0, tax: 19, loyaltyApplied: true, total: 114 });
});

test("staff do not get the loyalty discount", () => {
  assert.equal(computeTotal(cart(100), { id: 5, isStaff: true, completedOrders: 12 }).loyaltyApplied, false);
});
