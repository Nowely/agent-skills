import test from "node:test";
import assert from "node:assert/strict";
import { deliver } from "../src/delivery/deliver.js";

const answering = (...statuses) => {
  const calls = [];
  return { calls, post: async (...args) => { calls.push(args); return { status: statuses[calls.length - 1] }; } };
};

test("an accepted message is delivered once", async () => {
  const transport = answering(200);
  assert.deepEqual(await deliver({ id: "m1", url: "https://example.test/hook", body: {} }, { transport }), { kind: "ok" });
  assert.equal(transport.calls.length, 1);
});

test("an acknowledged message is not sent again", async () => {
  const transport = answering(200, 200);
  const message = { id: "m2", url: "https://example.test/hook", body: {} };
  await deliver(message, { transport });
  assert.deepEqual(await deliver(message, { transport }), { kind: "ok", skipped: true });
  assert.equal(transport.calls.length, 1);
});
