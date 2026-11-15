import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound } from '../src/round.js';

test('records two different games in acceptance order', () => {
  const writes = [];
  const round = createRound(['north', 'south'], receipt => writes.push(receipt));
  const first = round.submit({ id: 'a', table: 'north', home: 0, away: 99, expectedRevision: 0 });
  const second = round.submit({ id: 'b', table: 'south', home: 4, away: 2, expectedRevision: 1 });
  assert.deepEqual(first, { id: 'a', table: 'north', home: 0, away: 99, revision: 1 });
  assert.equal(second.revision, 2);
  assert.deepEqual(round.snapshot(), { revision: 2, results: [first, second] });
  assert.deepEqual(writes, [first, second]);
});

test('unknown table and tied score have no persistence effect', () => {
  const writes = [];
  const round = createRound(['north'], receipt => writes.push(receipt));
  assert.throws(() => round.submit({ id: 'a', table: 'missing', home: 1, away: 2, expectedRevision: 0 }), /^Error: UNKNOWN_TABLE$/);
  assert.throws(() => round.submit({ id: 'a', table: 'north', home: 2, away: 2, expectedRevision: 0 }), /^Error: INVALID_SCORE$/);
  assert.deepEqual(round.snapshot(), { revision: 0, results: [] });
  assert.deepEqual(writes, []);
});
