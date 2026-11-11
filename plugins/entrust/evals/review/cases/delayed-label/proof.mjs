import assert from "node:assert/strict";

const noon = new Date("2026-03-20T12:00:00Z");
const transport = (orders) => ({ get: async () => orders });

export default {
  F1: async ({ head }) => {
    const { badgeLabel } = await head("src/orders/badge.js");
    assert.equal(badgeLabel({ id: "a", status: "shipped", promisedAt: "2026-03-20" }, noon), "Delayed");
  },
  F2: async ({ head }) => {
    const order = { id: "a", status: "shipped", promisedAt: "2026-03-01" };
    assert.equal((await head("src/orders/list.js")).renderList([order], noon)[0].label, "Delayed");
    assert.match((await head("src/orders/export.js")).toCsv([order]), /a,Shipped,/);
  },
  F3: async ({ head }) => {
    const { fetchOrders, ContractError } = await head("src/api/client.js");
    await assert.rejects(fetchOrders(transport([{ id: "a", promisedAt: null }])), ContractError);
    await assert.rejects(fetchOrders(transport([{ id: "a", status: "refunded", promisedAt: null }])), ContractError);
  },
  F4: async ({ head }) => {
    const { badgeLabel } = await head("src/orders/badge.js");
    assert.equal(badgeLabel({ id: "a", status: "shipped", promisedAt: "not a date" }, noon), "Shipped");
  },
  X1: async ({ head }) => {
    const pickup = { id: "a", status: "shipped", promisedAt: null };
    assert.deepEqual(await (await head("src/api/client.js")).fetchOrders(transport([pickup])), [pickup]);
    assert.equal((await head("src/orders/badge.js")).badgeLabel(pickup, noon), "Shipped");
    assert.ok(new Date(null) < noon, "without the check the order would be delayed");
  },
  X2: async ({ head }) => {
    const { fetchOrders, ContractError } = await head("src/api/client.js");
    await assert.rejects(fetchOrders(transport([{ id: "a", status: "shipped", promisedAt: "not a date" }])), ContractError);
  },
};
