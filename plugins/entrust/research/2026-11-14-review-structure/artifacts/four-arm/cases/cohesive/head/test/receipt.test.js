import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound } from '../src/round.js';

test('operator can look up a receipt by ID without another submission', () => {
  const writes = [];
  const round = createRound(['north'], receipt => writes.push(receipt));
  assert.equal(round.receipt('missing'), null);
  const receipt = round.submit({ id: 'a', table: 'north', home: 2, away: 1, expectedRevision: 0 });
  round.seal();
  const found = round.receipt('a');
  assert.deepEqual(found, receipt);
  try { found.home = 99; } catch (error) { assert.ok(error instanceof TypeError); }
  assert.equal(round.receipt('a').home, 2);
  assert.deepEqual(writes, [receipt]);
  assert.equal(round.snapshot().revision, 1);
});
