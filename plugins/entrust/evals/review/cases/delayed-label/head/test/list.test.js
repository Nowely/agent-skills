import test from "node:test";
import assert from "node:assert/strict";
import { renderList } from "../src/orders/list.js";

test("each order is listed with its status label", () => {
  const rows = renderList([{ id: "a", status: "paid", promisedAt: null }]);
  assert.deepEqual(rows, [{ id: "a", label: "Paid" }]);
});
