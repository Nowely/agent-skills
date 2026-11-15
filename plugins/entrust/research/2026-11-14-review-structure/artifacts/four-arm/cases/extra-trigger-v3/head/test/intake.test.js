import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntake, IntakeError } from '../src/intake.js';

function recorder() {
  const events = [];
  return { events, emit: event => events.push(event) };
}

test('summarizes crates and emits decisions in input order', async () => {
  const { events, emit } = recorder();
  const intake = createIntake({
    loadRule: async kind => ({ maxKg: kind === 'glass' ? 5 : 20 }),
    emit
  });

  const result = await intake.processShipment({
    id: 'S-1',
    crates: [
      { id: 'A', kind: 'grain', kg: 8 },
      { id: 'B', kind: 'glass', kg: 5 },
      { id: 'C', kind: 'grain', kg: 2 }
    ]
  });

  assert.deepEqual(result, { shipmentId: 'S-1', count: 3, totalKg: 15, kinds: ['glass', 'grain'] });
  assert.deepEqual(events.map(event => event.type), [
    'intake.started',
    'crate.accepted',
    'crate.accepted',
    'crate.accepted',
    'intake.completed'
  ]);
  assert.deepEqual(events.slice(1, 4).map(event => event.crateId), ['A', 'B', 'C']);
});

test('handles an empty shipment', async () => {
  const { events, emit } = recorder();
  const intake = createIntake({ loadRule: async () => ({ maxKg: 1 }), emit });
  assert.deepEqual(await intake.processShipment({ id: 'EMPTY', crates: [] }), {
    shipmentId: 'EMPTY', count: 0, totalKg: 0, kinds: []
  });
  assert.deepEqual(events, [
    { type: 'intake.started', shipmentId: 'EMPTY', count: 0 },
    { type: 'intake.completed', shipmentId: 'EMPTY', count: 0, totalKg: 0 }
  ]);
});

test('stops after an overweight crate', async () => {
  const { events, emit } = recorder();
  const intake = createIntake({ loadRule: async () => ({ maxKg: 10 }), emit });
  await assert.rejects(intake.processShipment({
    id: 'S-2',
    crates: [
      { id: 'A', kind: 'grain', kg: 4 },
      { id: 'B', kind: 'grain', kg: 11 },
      { id: 'C', kind: 'grain', kg: 1 }
    ]
  }), error => {
    assert.ok(error instanceof IntakeError);
    assert.equal(error.code, 'OVERWEIGHT');
    assert.equal(error.crateId, 'B');
    return true;
  });
  assert.deepEqual(events.map(event => [event.type, event.crateId]), [
    ['intake.started', undefined],
    ['crate.accepted', 'A'],
    ['intake.failed', 'B']
  ]);
});

test('wraps loader failures and emits a final failure', async () => {
  const { events, emit } = recorder();
  const cause = new Error('rule store unavailable');
  const intake = createIntake({ loadRule: async () => { throw cause; }, emit });
  await assert.rejects(intake.processShipment({
    id: 'S-3', crates: [{ id: 'A', kind: 'glass', kg: 2 }]
  }), error => {
    assert.equal(error.code, 'RULE_LOAD_FAILED');
    assert.equal(error.cause, cause);
    assert.equal(error.kind, 'glass');
    return true;
  });
  assert.deepEqual(events.at(-1), {
    type: 'intake.failed', shipmentId: 'S-3', code: 'RULE_LOAD_FAILED', crateId: 'A'
  });
});

test('rejects malformed crates and duplicate IDs', async t => {
  await t.test('malformed', async () => {
    const { events, emit } = recorder();
    const intake = createIntake({ loadRule: async () => ({ maxKg: 10 }), emit });
    await assert.rejects(intake.processShipment({
      id: 'S-4', crates: [{ id: 'A', kind: 'grain', kg: 0 }]
    }), { code: 'INVALID_CRATE' });
    assert.equal(events.at(-1).code, 'INVALID_CRATE');
  });

  await t.test('duplicate', async () => {
    const intake = createIntake({ loadRule: async () => ({ maxKg: 10 }) });
    await assert.rejects(intake.processShipment({
      id: 'S-5',
      crates: [
        { id: 'A', kind: 'grain', kg: 2 },
        { id: 'A', kind: 'grain', kg: 3 }
      ]
    }), { code: 'DUPLICATE_CRATE' });
  });
});
