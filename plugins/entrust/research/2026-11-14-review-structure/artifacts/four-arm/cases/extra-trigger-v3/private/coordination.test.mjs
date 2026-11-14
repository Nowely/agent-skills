import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntake as createHead, IntakeError as HeadError } from '../head/src/intake.js';
import { createIntake as createAlternative, IntakeError as AlternativeError } from './alternative/src/intake.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function settle() {
  for (let index = 0; index < 8; index += 1) await Promise.resolve();
}

function shipment() {
  return {
    id: 'TRANSIENT',
    crates: [
      { id: 'A', kind: 'grain', kg: 1 },
      { id: 'B', kind: 'glass', kg: 1 }
    ]
  };
}

function transientHarness(createIntake, holdGlass = false) {
  const grain = deferred();
  const glass = deferred();
  const cause = new Error('transient glass failure');
  const calls = [];
  const events = [];
  let glassCalls = 0;
  const intake = createIntake({
    loadRule: kind => {
      calls.push(kind);
      if (kind === 'grain') return grain.promise;
      glassCalls += 1;
      if (glassCalls === 1) return holdGlass ? glass.promise : Promise.reject(cause);
      return { maxKg: 10 };
    },
    emit: event => events.push(structuredClone(event))
  });
  return { intake, grain, glass, cause, calls, events };
}

const acceptedA = { type: 'crate.accepted', shipmentId: 'TRANSIENT', crateId: 'A', kind: 'grain', kg: 1 };
const acceptedB = { type: 'crate.accepted', shipmentId: 'TRANSIENT', crateId: 'B', kind: 'glass', kg: 1 };
const started = { type: 'intake.started', shipmentId: 'TRANSIENT', count: 2 };

test('head retries a settled speculative failure on demand', async () => {
  const h = transientHarness(createHead);
  const processing = h.intake.processShipment(shipment());
  await settle();
  assert.deepEqual(h.calls, ['grain', 'glass']);
  assert.deepEqual(h.events, [started], 'the speculative rejection itself emits nothing');

  h.grain.resolve({ maxKg: 10 });
  assert.deepEqual(await processing, { shipmentId: 'TRANSIENT', count: 2, totalKg: 2, kinds: ['glass', 'grain'] });
  assert.deepEqual(h.calls, ['grain', 'glass', 'glass']);
  assert.deepEqual(h.events, [
    started,
    acceptedA,
    acceptedB,
    { type: 'intake.completed', shipmentId: 'TRANSIENT', count: 2, totalKg: 2 }
  ]);
});

test('lazy alternative reports its first awaited transient failure', async () => {
  const h = transientHarness(createAlternative);
  const processing = h.intake.processShipment(shipment());
  await settle();
  assert.deepEqual(h.calls, ['grain']);

  h.grain.resolve({ maxKg: 10 });
  await assert.rejects(processing, error => {
    assert.ok(error instanceof AlternativeError);
    assert.equal(error.code, 'RULE_LOAD_FAILED');
    assert.equal(error.cause, h.cause);
    assert.equal(error.crateId, 'B');
    return true;
  });
  assert.deepEqual(h.calls, ['grain', 'glass']);
  assert.deepEqual(h.events, [
    started,
    acceptedA,
    { type: 'intake.failed', shipmentId: 'TRANSIENT', code: 'RULE_LOAD_FAILED', crateId: 'B' }
  ]);
});

test('head reports rejection of an in-flight load awaited for acceptance', async () => {
  const h = transientHarness(createHead, true);
  const processing = h.intake.processShipment(shipment());
  await settle();
  assert.deepEqual(h.calls, ['grain', 'glass']);

  h.grain.resolve({ maxKg: 10 });
  await settle();
  assert.deepEqual(h.events, [started, acceptedA]);
  h.glass.reject(h.cause);
  await assert.rejects(processing, error => {
    assert.ok(error instanceof HeadError);
    assert.equal(error.code, 'RULE_LOAD_FAILED');
    assert.equal(error.cause, h.cause);
    assert.equal(error.crateId, 'B');
    return true;
  });
  assert.deepEqual(h.calls, ['grain', 'glass'], 'an awaited in-flight attempt is not retried');
  assert.deepEqual(h.events, [
    started,
    acceptedA,
    { type: 'intake.failed', shipmentId: 'TRANSIENT', code: 'RULE_LOAD_FAILED', crateId: 'B' }
  ]);
});
