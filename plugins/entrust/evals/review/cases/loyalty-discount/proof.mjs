import assert from "node:assert/strict";

const cart = (price, coupon) => ({ items: [{ name: "Mug", price, quantity: 1 }], coupon });

export default {
  F1: async ({ head }) => {
    const { renderSummary } = await head("src/checkout/summary.js");
    const same = cart(100);
    const first = renderSummary(same, { id: "proof-f1", completedOrders: 12 });
    const second = renderSummary(same, { id: "proof-f1", completedOrders: 12 });
    assert.equal(first.total, 114);
    assert.equal(second.total, 108.3);
    assert.deepEqual(second.lines, ["1 x Mug @ 90.25"]);
  },
  F2: async ({ head, base }) => {
    const loyal = { id: "proof-f2", completedOrders: 12 };
    assert.equal((await base("src/checkout/total.js")).computeTotal(cart(51), loyal).shipping, 0);
    const totals = (await head("src/checkout/total.js")).computeTotal(cart(51), loyal);
    assert.equal(totals.shipping, 4.9);
    assert.equal(totals.subtotal, 48.45);
  },
  F3: async ({ head }) => {
    const { isLoyal } = await head("src/checkout/loyalty.js");
    assert.equal(isLoyal({ id: "proof-f3", completedOrders: 5 }), false);
  },
  F4: async ({ head }) => {
    const { isLoyal } = await head("src/checkout/loyalty.js");
    assert.equal(isLoyal({ id: "proof-f4", completedOrders: 1 }), false);
    assert.equal(isLoyal({ id: "proof-f4", completedOrders: 9 }), false);
  },
};
