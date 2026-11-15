import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk } from './desk.js';

function fakeClock() {
  let now = 0, next = 0;
  const jobs = new Map();
  return {
    now: () => now,
    setTimeout(fn, delay) {
      const id = ++next;
      jobs.set(id, { at: now + delay, fn });
      return id;
    },
    clearTimeout(id) { jobs.delete(id); },
    pending: () => jobs.size,
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const due = [...jobs].filter(([, job]) => job.at <= end)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!due) break;
        const [id, job] = due;
        jobs.delete(id);
        now = job.at;
        job.fn();
      }
      now = end;
    }
  };
}

function setup(onExpire = () => {}, onError = () => {}) {
  const clock = fakeClock();
  return { clock, desk: createDesk({ clock, onExpire, onError }) };
}

test('deadline autonomously expires exactly once and permits reuse', () => {
  const events = [];
  const { clock, desk } = setup(id => events.push(id));
  desk.reserve('A', 10);
  clock.advance(9);
  assert.deepEqual(events, []);
  assert.equal(desk.has('A'), true);
  clock.advance(1);
  assert.deepEqual(events, ['A']);
  assert.equal(desk.has('A'), false);
  clock.advance(20);
  assert.deepEqual(events, ['A']);
  desk.reserve('A', 2);
  clock.advance(2);
  assert.deepEqual(events, ['A', 'A']);
});

test('cancel and close release scheduled work and suppress delivery', () => {
  const events = [];
  const { clock, desk } = setup(id => events.push(id));
  desk.reserve('A', 4); desk.reserve('B', 4);
  assert.equal(desk.cancel('A'), true);
  assert.equal(desk.cancel('A'), false);
  assert.equal(clock.pending(), 1);
  desk.close(); desk.close();
  assert.equal(clock.pending(), 0);
  assert.equal(desk.has('B'), false);
  assert.throws(() => desk.cancel('B'));
  assert.throws(() => desk.reserve('C', 1));
  clock.advance(10);
  assert.deepEqual(events, []);
});

test('equal deadlines preserve registration order and allow cancellation at boundary', () => {
  const events = [];
  let desk;
  const env = setup(id => {
    events.push(id);
    if (id === 'A') {
      assert.equal(desk.cancel('A'), false);
      assert.equal(desk.cancel('B'), true);
    }
  });
  desk = env.desk;
  desk.reserve('A', 5); desk.reserve('B', 5); desk.reserve('C', 5);
  env.clock.advance(5);
  assert.deepEqual(events, ['A', 'C']);
  assert.equal(env.clock.pending(), 0);
});

test('callback can re-reserve same ID and error reporting cannot stop others', () => {
  const events = [], errors = [];
  let desk;
  const env = setup(id => {
    events.push(id);
    if (id === 'A' && events.length === 1) {
      assert.equal(desk.has('A'), false);
      desk.reserve('A', 2);
      throw new Error('notification failed');
    }
  }, (error, id) => { errors.push([error.message, id]); throw Error('report failed'); });
  desk = env.desk;
  desk.reserve('A', 1); desk.reserve('B', 1);
  env.clock.advance(3);
  assert.deepEqual(events, ['A', 'B', 'A']);
  assert.deepEqual(errors, [['notification failed', 'A']]);
});

test('validates reservation arguments and rejects active duplicates', () => {
  const { desk, clock } = setup();
  for (const [id, duration] of [['', 1], [1, 1], ['x', 0], ['x', -1], ['x', Infinity], ['x', NaN], ['x', '1']]) {
    assert.throws(() => desk.reserve(id, duration), TypeError);
  }
  desk.reserve('x', 1);
  assert.throws(() => desk.reserve('x', 1));
  assert.equal(clock.pending(), 1);
});
