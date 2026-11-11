import test from "node:test";
import assert from "node:assert/strict";
import { deliver } from "../src/delivery/deliver.js";

const answering = (...statuses) => {
  const calls = [];
  return { calls, post: async (...args) => { calls.push(args); return { status: statuses[calls.length - 1] }; } };
};
const sleep = async () => {};

test("an accepted message is delivered once", async () => {
  const transport = answering(200);
  assert.deepEqual(await deliver({ id: "m1", url: "https://example.test/hook", body: {} }, { transport, sleep }), { kind: "ok" });
  assert.equal(transport.calls.length, 1);
});

test("an acknowledged message is not sent again", async () => {
  const transport = answering(200, 200);
  const message = { id: "m2", url: "https://example.test/hook", body: {} };
  await deliver(message, { transport, sleep });
  assert.deepEqual(await deliver(message, { transport, sleep }), { kind: "ok", skipped: true });
  assert.equal(transport.calls.length, 1);
});

test("a temporary answer is retried until the endpoint accepts", async () => {
  const transport = answering(503, 200);
  assert.deepEqual(await deliver({ id: "m3", url: "https://example.test/hook", body: {} }, { transport, sleep }), { kind: "ok" });
  assert.equal(transport.calls.length, 2);
});

test("three temporary answers end the delivery", async () => {
  const transport = answering(503, 503, 503, 200);
  assert.deepEqual(await deliver({ id: "m4", url: "https://example.test/hook", body: {} }, { transport, sleep }), { kind: "temporary" });
  assert.equal(transport.calls.length, 3);
});

test("a permanent answer is not retried", async () => {
  const transport = answering(400, 200);
  const result = await deliver({ id: "m5", url: "https://example.test/hook", body: {} }, { transport, sleep });
  assert.equal(result.kind, "permanent");
  assert.equal(transport.calls.length, 1);
});
