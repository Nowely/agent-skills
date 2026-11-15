import assert from 'node:assert/strict';
import { createIntake as createHead } from '../head/src/intake.js';
import { createIntake as createAlternative } from './alternative/src/intake.js';

function deferred() {
  let resolve;
  const promise = new Promise(res => { resolve = res; });
  return { promise, resolve };
}

async function settle() {
  for (let index = 0; index < 6; index += 1) await Promise.resolve();
}

const shipment = {
  id: 'COMPARE',
  crates: [
    { id: 'A', kind: 'grain', kg: 1 },
    { id: 'B', kind: 'glass', kg: 2 },
    { id: 'C', kind: 'steel', kg: 3 }
  ]
};

async function overlapObservation() {
  const gates = { grain: deferred(), glass: deferred(), steel: deferred() };
  const calls = [];
  const events = [];
  const tasks = [];
  const intake = createHead({
    loadRule: kind => { calls.push(kind); return gates[kind].promise; },
    emit: event => events.push(event),
    schedule: task => tasks.push(task)
  });
  const processing = intake.processShipment(shipment);
  while (tasks.length > 0) tasks.shift()();
  await settle();
  const beforeFirstRelease = [...calls];
  assert.deepEqual(beforeFirstRelease, ['grain', 'glass', 'steel']);

  gates.glass.resolve({ maxKg: 20 });
  gates.steel.resolve({ maxKg: 20 });
  await settle();
  assert.deepEqual(events.map(event => event.type), ['intake.started']);
  gates.grain.resolve({ maxKg: 20 });
  const result = await processing;
  assert.equal(result.totalKg, 6);
  return { callsBeforeFirstRelease: beforeFirstRelease, eventTypesWhileFirstRulePending: ['intake.started'] };
}

async function lazyObservation() {
  const gates = { grain: deferred(), glass: deferred(), steel: deferred() };
  const calls = [];
  const intake = createAlternative({
    loadRule: kind => { calls.push(kind); return gates[kind].promise; }
  });
  const processing = intake.processShipment(shipment);
  await settle();
  const beforeFirstRelease = [...calls];
  assert.deepEqual(beforeFirstRelease, ['grain']);

  gates.grain.resolve({ maxKg: 20 });
  await settle();
  const afterFirstRelease = [...calls];
  assert.deepEqual(afterFirstRelease, ['grain', 'glass']);
  gates.glass.resolve({ maxKg: 20 });
  await settle();
  const afterSecondRelease = [...calls];
  assert.deepEqual(afterSecondRelease, ['grain', 'glass', 'steel']);
  gates.steel.resolve({ maxKg: 20 });
  const result = await processing;
  assert.equal(result.totalKg, 6);
  return {
    callsBeforeFirstRelease: beforeFirstRelease,
    callsAfterFirstRelease: afterFirstRelease,
    callsAfterSecondRelease: afterSecondRelease
  };
}

async function unusedLoadObservation(createIntake, useScheduler) {
  const calls = [];
  const tasks = [];
  const intake = createIntake({
    loadRule: kind => { calls.push(kind); return { maxKg: kind === 'grain' ? 1 : 20 }; },
    schedule: useScheduler ? task => tasks.push(task) : undefined
  });
  await assert.rejects(intake.processShipment({
    id: 'EARLY-FAILURE',
    crates: [
      { id: 'A', kind: 'grain', kg: 2 },
      { id: 'B', kind: 'glass', kg: 2 }
    ]
  }), { code: 'OVERWEIGHT' });
  while (tasks.length > 0) tasks.shift()();
  await settle();
  return calls.filter(kind => kind === 'glass').length;
}

const observation = {
  successfulShipment: {
    head: await overlapObservation(),
    alternative: await lazyObservation()
  },
  earlyFailure: {
    headUnusedGlassLoads: await unusedLoadObservation(createHead, true),
    alternativeUnusedGlassLoads: await unusedLoadObservation(createAlternative, false)
  }
};
assert.equal(observation.earlyFailure.headUnusedGlassLoads, 1);
assert.equal(observation.earlyFailure.alternativeUnusedGlassLoads, 0);
console.log(JSON.stringify(observation, null, 2));
