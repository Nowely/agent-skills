import test from "node:test";
import assert from "node:assert/strict";
import { badgeLabel } from "../src/orders/badge.js";

const now = new Date("2026-03-20T09:00:00Z");

test("a shipped order past its promised date is delayed", () => {
  assert.equal(badgeLabel({ id: "a", status: "shipped", promisedAt: "2026-03-01" }, now), "Delayed");
});

test("a shipped order promised for later keeps its label", () => {
  assert.equal(badgeLabel({ id: "b", status: "shipped", promisedAt: "2026-04-01" }, now), "Shipped");
});

test("an order without a status falls back to Unknown", () => {
  assert.equal(badgeLabel({ id: "c", promisedAt: null }, now), "Unknown");
});

test("a custom fallback label is used for an unknown status", () => {
  assert.equal(badgeLabel({ id: "d", status: "refunded", promisedAt: null }, now, { fallbackLabel: "?" }), "?");
});
