import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const implementation = resolve(root, process.env.CASE_IMPL || 'head/src/intake.js');
const { createIntake, IntakeError } = await import(pathToFileURL(implementation));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function settle() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
  }
}

function harness(loadRule) {
  const events = [];
  const calls = [];
  const tasks = [];
  const intake = createIntake({
    loadRule: async kind => {
      calls.push(kind);
      if (loadRule) return loadRule(kind);
      return { maxKg: 20 };
    },
    emit: event => events.push(structuredClone(event)),
    schedule: task => tasks.push(task)
  });
  return {
    intake,
    events,
    calls,
    async drain() {
      while (tasks.length > 0) tasks.shift()();
      await settle();
    }
  };
}

function started(id, count) {
  return { type: 'intake.started', shipmentId: id, count };
}

function failed(id, code, crateId) {
  return { type: 'intake.failed', shipmentId: id, code, crateId };
}

test('emits a complete ordered trace and summary', async () => {
  const h = harness(kind => ({ maxKg: kind === 'glass' ? 5 : 20 }));
  const result = await h.intake.processShipment({
    id: 'S-100',
    crates: [
      { id: 'A', kind: 'grain', kg: 8 },
      { id: 'B', kind: 'glass', kg: 5 },
      { id: 'C', kind: 'grain', kg: 2 }
    ]
  });
  assert.deepEqual(result, { shipmentId: 'S-100', count: 3, totalKg: 15, kinds: ['glass', 'grain'] });
  const expected = [
    started('S-100', 3),
    { type: 'crate.accepted', shipmentId: 'S-100', crateId: 'A', kind: 'grain', kg: 8 },
    { type: 'crate.accepted', shipmentId: 'S-100', crateId: 'B', kind: 'glass', kg: 5 },
    { type: 'crate.accepted', shipmentId: 'S-100', crateId: 'C', kind: 'grain', kg: 2 },
    { type: 'intake.completed', shipmentId: 'S-100', count: 3, totalKg: 15 }
  ];
  assert.deepEqual(h.events, expected);
  await h.drain();
  assert.deepEqual(h.events, expected, 'scheduled work must not add intake events');
});

test('handles an empty shipment with adjacent start and completion', async () => {
  const h = harness();
  assert.deepEqual(await h.intake.processShipment({ id: 'EMPTY', crates: [] }), {
    shipmentId: 'EMPTY', count: 0, totalKg: 0, kinds: []
  });
  assert.deepEqual(h.events, [
    started('EMPTY', 0),
    { type: 'intake.completed', shipmentId: 'EMPTY', count: 0, totalKg: 0 }
  ]);
  assert.deepEqual(h.calls, []);
});

test('rejects invalid shipment envelopes without events', async () => {
  for (const shipment of [null, { id: '', crates: [] }, { id: 'S', crates: null }]) {
    const h = harness();
    await assert.rejects(h.intake.processShipment(shipment), error => {
      assert.ok(error instanceof IntakeError);
      assert.equal(error.code, 'INVALID_SHIPMENT');
      return true;
    });
    assert.deepEqual(h.events, []);
    assert.deepEqual(h.calls, []);
  }
});

test('validates crates and emits one final failure', async () => {
  for (const crate of [null, { id: '', kind: 'grain', kg: 1 }, { id: 'A', kind: '', kg: 1 }, { id: 'A', kind: 'grain', kg: 0 }, { id: 'A', kind: 'grain', kg: Infinity }]) {
    const h = harness();
    await assert.rejects(h.intake.processShipment({ id: 'BAD', crates: [crate] }), { code: 'INVALID_CRATE' });
    assert.equal(h.events.length, 2);
    assert.deepEqual(h.events[0], started('BAD', 1));
    assert.deepEqual(h.events[1], { ...failed('BAD', 'INVALID_CRATE', typeof crate?.id === 'string' ? crate.id : null) });
    await h.drain();
    assert.equal(h.events.length, 2);
  }
});

test('reports duplicate crate IDs after earlier acceptances', async () => {
  const h = harness();
  await assert.rejects(h.intake.processShipment({
    id: 'DUP',
    crates: [
      { id: 'A', kind: 'grain', kg: 2 },
      { id: 'A', kind: 'glass', kg: 3 }
    ]
  }), error => {
    assert.equal(error.code, 'DUPLICATE_CRATE');
    assert.equal(error.crateId, 'A');
    assert.equal(error.kind, 'glass');
    return true;
  });
  assert.deepEqual(h.events, [
    started('DUP', 2),
    { type: 'crate.accepted', shipmentId: 'DUP', crateId: 'A', kind: 'grain', kg: 2 },
    failed('DUP', 'DUPLICATE_CRATE', 'A')
  ]);
  await h.drain();
});

test('reports loader failures with their cause', async () => {
  const cause = new Error('unavailable');
  const h = harness(() => { throw cause; });
  await assert.rejects(h.intake.processShipment({
    id: 'LOAD', crates: [{ id: 'G', kind: 'glass', kg: 2 }]
  }), error => {
    assert.ok(error instanceof IntakeError);
    assert.equal(error.code, 'RULE_LOAD_FAILED');
    assert.equal(error.crateId, 'G');
    assert.equal(error.kind, 'glass');
    assert.equal(error.cause, cause);
    return true;
  });
  assert.deepEqual(h.events, [started('LOAD', 1), failed('LOAD', 'RULE_LOAD_FAILED', 'G')]);
  await h.drain();
  assert.equal(h.events.length, 2);
});

test('rejects every invalid rule shape', async () => {
  for (const rule of [null, {}, { maxKg: 0 }, { maxKg: -1 }, { maxKg: Infinity }, { maxKg: '10' }]) {
    const h = harness(() => rule);
    await assert.rejects(h.intake.processShipment({
      id: 'RULE', crates: [{ id: 'A', kind: 'grain', kg: 1 }]
    }), { code: 'INVALID_RULE', crateId: 'A', kind: 'grain' });
    assert.deepEqual(h.events, [started('RULE', 1), failed('RULE', 'INVALID_RULE', 'A')]);
    await h.drain();
  }
});

test('stops at an overweight crate', async () => {
  const h = harness(kind => ({ maxKg: kind === 'glass' ? 10 : 20 }));
  await assert.rejects(h.intake.processShipment({
    id: 'WEIGHT',
    crates: [
      { id: 'A', kind: 'grain', kg: 5 },
      { id: 'B', kind: 'glass', kg: 11 },
      { id: 'C', kind: 'grain', kg: 1 }
    ]
  }), { code: 'OVERWEIGHT', crateId: 'B', kind: 'glass' });
  assert.deepEqual(h.events, [
    started('WEIGHT', 3),
    { type: 'crate.accepted', shipmentId: 'WEIGHT', crateId: 'A', kind: 'grain', kg: 5 },
    failed('WEIGHT', 'OVERWEIGHT', 'B')
  ]);
  await h.drain();
  assert.equal(h.events.some(event => event.crateId === 'C'), false);
});

test('waits for each rule before accepting its crate', async () => {
  const grain = deferred();
  const glass = deferred();
  const h = harness(kind => kind === 'grain' ? grain.promise : glass.promise);
  const processing = h.intake.processShipment({
    id: 'ORDER',
    crates: [
      { id: 'A', kind: 'grain', kg: 1 },
      { id: 'B', kind: 'glass', kg: 2 }
    ]
  });
  await settle();
  assert.deepEqual(h.calls, ['grain']);
  assert.deepEqual(h.events, [started('ORDER', 2)]);

  grain.resolve({ maxKg: 10 });
  await settle();
  assert.deepEqual(h.calls, ['grain', 'glass']);
  assert.deepEqual(h.events.slice(0, 2), [
    started('ORDER', 2),
    { type: 'crate.accepted', shipmentId: 'ORDER', crateId: 'A', kind: 'grain', kg: 1 }
  ]);
  assert.equal(h.events.some(event => event.crateId === 'B'), false);

  glass.resolve({ maxKg: 10 });
  assert.deepEqual(await processing, { shipmentId: 'ORDER', count: 2, totalKg: 3, kinds: ['glass', 'grain'] });
  assert.deepEqual(h.events.map(event => event.type), ['intake.started', 'crate.accepted', 'crate.accepted', 'intake.completed']);
  await h.drain();
});
