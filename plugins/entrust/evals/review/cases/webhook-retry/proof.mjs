import assert from "node:assert/strict";

const answering = (...statuses) => {
  const calls = [];
  return { calls, post: async () => { calls.push(1); return { status: statuses[calls.length - 1] }; } };
};
const message = (id) => ({ id, url: "https://example.test/hook", body: {} });

export default {
  F1: async ({ head, base }) => {
    for (const [tree, expected, posts] of [[head, "delivered", 0], [base, "delivered", 1]]) {
      const { saveMessage } = await tree("src/delivery/outbox.js");
      const { deliver } = await tree("src/delivery/deliver.js");
      const { redeliver } = await tree("src/admin/redeliver.js");
      saveMessage(message("proof-f1"));
      const sleep = async () => {};
      assert.equal((await deliver(message("proof-f1"), { transport: answering(400), sleep })).kind, "permanent");
      const fixed = answering(200);
      assert.equal(await redeliver("proof-f1", { transport: fixed, sleep }), expected);
      assert.equal(fixed.calls.length, posts, "the head reports delivered without sending; the base sends");
    }
  },
  F2: async ({ head }) => {
    const { deliver } = await head("src/delivery/deliver.js");
    const slept = [];
    await deliver(message("proof-f2"), { transport: answering(503, 503, 503), sleep: async (ms) => { slept.push(ms); } });
    assert.deepEqual(slept, [500, 2000, 8000]);
  },
  X1: async ({ head }) => {
    const { send } = await head("src/delivery/send.js");
    const broken = { post: async () => { throw new Error("socket hang up"); } };
    assert.deepEqual(await send(message("proof-x1"), { idempotencyKey: "proof-x1", transport: broken }), { kind: "temporary" });
  },
};
