import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntake, IntakeError } from '../src/intake.js';

test('summarizes a shipment', async () => {
  const intake = createIntake({
    loadRule: async () => ({ maxKg: 20 })
  });

  assert.deepEqual(await intake.processShipment({
    id: 'S-1',
    crates: [
      { id: 'A', kind: 'grain', kg: 8 },
      { id: 'B', kind: 'glass', kg: 4 }
    ]
  }), {
    shipmentId: 'S-1',
    count: 2,
    totalKg: 12,
    kinds: ['glass', 'grain']
  });
});

test('rejects an invalid shipment envelope', async () => {
  const intake = createIntake({ loadRule: async () => ({ maxKg: 20 }) });
  await assert.rejects(intake.processShipment(null), error => {
    assert.ok(error instanceof IntakeError);
    assert.equal(error.code, 'INVALID_SHIPMENT');
    return true;
  });
});
