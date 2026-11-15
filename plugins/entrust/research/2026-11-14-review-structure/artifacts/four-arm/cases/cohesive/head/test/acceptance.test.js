import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound } from '../src/round.js';

const command = (overrides = {}) => ({
  id: 'a', table: 'north', home: 3, away: 1, expectedRevision: 0, ...overrides,
});

function fixture() {
  const writes = [];
  const round = createRound(['north', 'south', 'east'], receipt => writes.push(receipt));
  return { round, writes };
}

function rejected(round, writes, request, code) {
  const before = round.snapshot();
  const effects = writes.slice();
  assert.throws(() => round.submit(request), error => error.message === code);
  assert.deepEqual(round.snapshot(), before);
  assert.deepEqual(writes, effects);
}

test('stale operator can refresh and replay older results without another append', () => {
  const { round, writes } = fixture();
  const first = round.submit(command());
  const second = command({ id: 'b', table: 'south' });
  rejected(round, writes, second, 'STALE_REVISION');
  round.submit({ ...second, expectedRevision: 1 });
  assert.deepEqual(round.submit(command()), first);
  assert.deepEqual(round.submit(command({ expectedRevision: 100, ignored: 'metadata' })), first);
  assert.equal(round.snapshot().revision, 2);
  assert.equal(writes.length, 2);
});

test('replay precedes sealing and ID conflict precedes every other guard', () => {
  const { round, writes } = fixture();
  const first = round.submit(command());
  round.seal();
  round.seal();
  assert.deepEqual(round.submit(command()), first);
  rejected(round, writes, command({ table: 'missing', home: -1 }), 'ID_REUSED');
  rejected(round, writes, command({ id: 'b', table: 'missing', home: -1 }), 'ROUND_SEALED');
  assert.deepEqual(round.snapshot(), { revision: 1, results: [first] });
  assert.deepEqual(writes, [first]);
});

test('each payload field participates in replay identity', () => {
  for (const change of [{ table: 'south' }, { home: 4 }, { away: 2 }]) {
    const { round, writes } = fixture();
    round.submit(command());
    rejected(round, writes, command({ ...change, expectedRevision: 1 }), 'ID_REUSED');
  }
});

test('empty round can be sealed with no revision or persistence effect', () => {
  const { round, writes } = fixture();
  round.seal();
  round.seal();
  rejected(round, writes, command(), 'ROUND_SEALED');
  assert.deepEqual(round.snapshot(), { revision: 0, results: [] });
  assert.deepEqual(writes, []);
});

test('stale precedes unknown table, existing table and invalid score', () => {
  const { round, writes } = fixture();
  round.submit(command());
  rejected(round, writes, command({ id: 'b', table: 'missing', home: -1 }), 'STALE_REVISION');
  rejected(round, writes, command({ id: 'b', home: -1 }), 'STALE_REVISION');
});

test('unknown table precedes invalid score', () => {
  const { round, writes } = fixture();
  rejected(round, writes, command({ table: 'missing', home: -1 }), 'UNKNOWN_TABLE');
});

test('a second ID cannot overwrite a table, even with the same score', () => {
  const { round, writes } = fixture();
  round.submit(command());
  rejected(round, writes, command({ id: 'b', expectedRevision: 1 }), 'TABLE_RECORDED');
  rejected(round, writes, command({ id: 'b', expectedRevision: 1, home: -1 }), 'TABLE_RECORDED');
});

test('score domain rejects invalid numbers in either position without consuming IDs', () => {
  for (const score of [-1, 100, 1.5, NaN, Infinity, -Infinity]) {
    for (const field of ['home', 'away']) {
      const { round, writes } = fixture();
      rejected(round, writes, command({ [field]: score }), 'INVALID_SCORE');
      assert.equal(round.submit(command()).revision, 1);
      assert.equal(writes.length, 1);
    }
  }
  const { round, writes } = fixture();
  rejected(round, writes, command({ away: 3 }), 'INVALID_SCORE');
});

test('persistence sees the old snapshot and failure preserves the original exception and retry', () => {
  const failure = new Error('disk full');
  const writes = [];
  let fail = true;
  let round;
  round = createRound(['north', 'south'], receipt => {
    assert.deepEqual(round.snapshot(), { revision: 0, results: [] });
    assert.deepEqual(receipt, { id: 'a', table: 'north', home: 3, away: 1, revision: 1 });
    if (fail) throw failure;
    writes.push(receipt);
  });
  assert.throws(() => round.submit(command()), error => error === failure);
  assert.deepEqual(round.snapshot(), { revision: 0, results: [] });
  fail = false;
  const receipt = round.submit(command());
  assert.deepEqual(round.snapshot(), { revision: 1, results: [receipt] });
  assert.deepEqual(writes, [receipt]);
});

test('a failure after an accepted game preserves that game and the next revision', () => {
  const failure = new Error('append unavailable');
  const writes = [];
  let fail = false;
  const round = createRound(['north', 'south'], receipt => {
    if (fail) throw failure;
    writes.push(receipt);
  });
  const first = round.submit(command());
  const next = command({ id: 'b', table: 'south', expectedRevision: 1 });
  fail = true;
  assert.throws(() => round.submit(next), error => error === failure);
  assert.deepEqual(round.snapshot(), { revision: 1, results: [first] });
  assert.deepEqual(round.submit(command()), first);
  fail = false;
  const second = round.submit(next);
  assert.equal(second.revision, 2);
  assert.deepEqual(writes, [first, second]);
});

test('caller mutation cannot change stored payload or snapshot contents', () => {
  const { round, writes } = fixture();
  const request = command();
  const receipt = round.submit(request);
  const expected = { id: 'a', table: 'north', home: 3, away: 1, revision: 1 };
  request.home = 90;
  try { receipt.home = 80; } catch (error) { assert.ok(error instanceof TypeError); }
  const view = round.snapshot();
  view.results[0].home = 70;
  view.results.length = 0;
  view.revision = 100;
  assert.deepEqual(round.submit(command()), expected);
  assert.deepEqual(round.snapshot(), { revision: 1, results: [expected] });
  assert.deepEqual(writes, [expected]);
});

test('rounds have independent ID, revision and seal state', () => {
  const first = fixture();
  const second = fixture();
  first.round.submit(command());
  first.round.seal();
  assert.equal(second.round.submit(command({ home: 6 })).revision, 1);
  assert.equal(second.writes.length, 1);
  assert.equal(first.round.snapshot().results[0].home, 3);
});
