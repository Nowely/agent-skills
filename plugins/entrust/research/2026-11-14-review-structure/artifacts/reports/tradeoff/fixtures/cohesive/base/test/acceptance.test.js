import test from "node:test";
import assert from "node:assert/strict";
import { createReminder } from "../reminder.js";

function fakeScheduler() {
  let now = 0;
  const jobs = new Map();

  const scheduler = {
    schedule(delayMs, callback) {
      const handle = {};
      jobs.set(handle, { at: now + delayMs, callback });
      return handle;
    },

    cancel(handle) {
      jobs.delete(handle);
    },
  };

  function elapse(ms) {
    assert.ok(Number.isInteger(ms) && ms >= 0);
    now += ms;
  }

  function flush() {
    for (;;) {
      const next = [...jobs.entries()]
        .filter(([, job]) => job.at <= now)
        .sort((a, b) => a[1].at - b[1].at)[0];

      if (!next) {
        return;
      }

      const [handle, job] = next;
      jobs.delete(handle);
      job.callback();
    }
  }

  return {
    scheduler,
    elapse,
    flush,

    advance(ms) {
      elapse(ms);
      flush();
    },

    pending() {
      return jobs.size;
    },
  };
}

function setup(overrides = {}) {
  const clock = fakeScheduler();
  const sent = [];
  const reminder = createReminder({
    text: "Tea break",
    delayMs: 10,
    onSend: (text) => sent.push(text),
    scheduler: clock.scheduler,
    ...overrides,
  });

  return { clock, sent, reminder };
}

test("sends automatically without calls to reminder methods", () => {
  const { clock, sent, reminder } = setup();

  clock.advance(9);
  assert.deepEqual(sent, []);

  clock.advance(1);
  assert.deepEqual(sent, ["Tea break"]);

  assert.deepEqual(reminder.snapshot(), {
    text: "Tea break",
    state: "sent",
  });

  clock.advance(100);
  assert.deepEqual(sent, ["Tea break"]);
  assert.equal(clock.pending(), 0);
});

test("zero delay is deferred until scheduler delivery", () => {
  const { clock, sent, reminder } = setup({ delayMs: 0 });

  assert.deepEqual(sent, []);
  assert.equal(reminder.snapshot().state, "pending");

  clock.flush();

  assert.deepEqual(sent, ["Tea break"]);
  assert.equal(reminder.snapshot().state, "sent");
});

for (const method of ["sendNow", "cancel"]) {
  test(`${method} completes once and cancels pending delivery`, () => {
    const { clock, sent, reminder } = setup();
    const expectedState = method === "sendNow" ? "sent" : "cancelled";
    const expectedMessages = method === "sendNow" ? ["Tea break"] : [];

    assert.equal(reminder[method](), true);
    assert.equal(clock.pending(), 0);
    assert.deepEqual(sent, expectedMessages);

    assert.equal(reminder.sendNow(), false);
    assert.equal(reminder.cancel(), false);

    clock.advance(100);

    assert.deepEqual(sent, expectedMessages);
    assert.equal(reminder.snapshot().state, expectedState);
  });
}

test("cancellation can win after nominal delay but before callback starts", () => {
  const { clock, sent, reminder } = setup();

  clock.elapse(100);
  assert.equal(reminder.cancel(), true);
  clock.flush();

  assert.deepEqual(sent, []);
  assert.equal(reminder.snapshot().state, "cancelled");
  assert.equal(clock.pending(), 0);
});

test("manual sending can win before a delayed callback starts", () => {
  const { clock, sent, reminder } = setup();

  clock.elapse(100);
  assert.equal(reminder.sendNow(), true);
  assert.equal(clock.pending(), 0);

  clock.flush();

  assert.deepEqual(sent, ["Tea break"]);
  assert.equal(reminder.snapshot().state, "sent");
});

test("snapshots are detached, passive, and do not postpone delivery", () => {
  const { clock, sent, reminder } = setup();

  const snapshot = reminder.snapshot();
  snapshot.text = "Changed";
  snapshot.state = "cancelled";

  clock.advance(6);

  assert.deepEqual(reminder.snapshot(), {
    text: "Tea break",
    state: "pending",
  });
  assert.deepEqual(sent, []);

  clock.elapse(4);

  assert.equal(reminder.snapshot().state, "pending");
  assert.deepEqual(sent, []);

  clock.flush();

  assert.deepEqual(sent, ["Tea break"]);
});

test("reminders sharing a scheduler remain independent", () => {
  const clock = fakeScheduler();
  const sent = [];

  const first = createReminder({
    text: "First",
    delayMs: 5,
    onSend: (text) => sent.push(text),
    scheduler: clock.scheduler,
  });
  const second = createReminder({
    text: "Second",
    delayMs: 10,
    onSend: (text) => sent.push(text),
    scheduler: clock.scheduler,
  });

  assert.equal(first.cancel(), true);

  clock.advance(5);
  assert.deepEqual(sent, []);

  clock.advance(5);
  assert.deepEqual(sent, ["Second"]);
  assert.equal(second.snapshot().state, "sent");
  assert.equal(clock.pending(), 0);
});

test("state is terminal before a reentrant onSend runs", () => {
  const clock = fakeScheduler();
  const observations = [];
  let reminder;

  reminder = createReminder({
    text: "Tea break",
    delayMs: 0,
    scheduler: clock.scheduler,
    onSend(text) {
      observations.push({
        text,
        state: reminder.snapshot().state,
        sendAgain: reminder.sendNow(),
        cancel: reminder.cancel(),
      });
    },
  });

  clock.flush();

  assert.deepEqual(observations, [{
    text: "Tea break",
    state: "sent",
    sendAgain: false,
    cancel: false,
  }]);
  assert.equal(clock.pending(), 0);
});

for (const delivery of ["manual", "automatic"]) {
  test(`${delivery} delivery propagates handler errors without retry`, () => {
    const failure = new Error("Receiver failed");
    let calls = 0;

    const { clock, reminder } = setup({
      onSend() {
        calls += 1;
        throw failure;
      },
    });

    const deliver = delivery === "manual"
      ? () => reminder.sendNow()
      : () => clock.advance(10);

    assert.throws(deliver, (error) => error === failure);

    assert.equal(reminder.snapshot().state, "sent");
    assert.equal(reminder.sendNow(), false);
    assert.equal(reminder.cancel(), false);
    assert.equal(clock.pending(), 0);

    clock.advance(100);
    assert.equal(calls, 1);
  });
}

test("text is delivered without trimming or other transformations", () => {
  const { clock, sent } = setup({ text: "  Tea break\n" });

  clock.advance(10);

  assert.deepEqual(sent, ["  Tea break\n"]);
});

test("invalid inputs fail before scheduling", () => {
  const clock = fakeScheduler();
  let registrations = 0;
  const scheduler = {
    schedule(delayMs, callback) {
      registrations += 1;
      return clock.scheduler.schedule(delayMs, callback);
    },
    cancel: clock.scheduler.cancel,
  };

  const valid = {
    text: "Tea break",
    delayMs: 10,
    onSend() {},
    scheduler,
  };

  for (const text of ["", null, 42]) {
    assert.throws(
      () => createReminder({ ...valid, text }),
      TypeError,
    );
  }

  for (const onSend of [null, undefined, "send"]) {
    assert.throws(
      () => createReminder({ ...valid, onSend }),
      TypeError,
    );
  }

  for (const delayMs of [
    undefined,
    -1,
    0.5,
    NaN,
    Infinity,
    2147483648,
    "10",
  ]) {
    assert.throws(
      () => createReminder({ ...valid, delayMs }),
      RangeError,
    );
  }

  assert.equal(registrations, 0);
});

test("maximum supported delay is accepted", () => {
  const { clock, sent } = setup({ delayMs: 2147483647 });

  clock.advance(2147483646);
  assert.deepEqual(sent, []);

  clock.advance(1);
  assert.deepEqual(sent, ["Tea break"]);
});
