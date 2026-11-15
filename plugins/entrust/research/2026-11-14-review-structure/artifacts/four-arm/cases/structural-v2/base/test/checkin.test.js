import test from "node:test";
import assert from "node:assert/strict";
import { checkinVial } from "../src/checkin.js";

function makeHarness(overrides = {}) {
  const box = {
    rows: 3,
    cols: 3,
    maxVolumeUl: 500,
    maxThawCount: 2,
    slots: {},
    ...overrides,
  };
  const events = [];
  const ports = {
    labelQueue: {
      enqueue(job) {
        events.push({ type: "label", job });
      },
    },
    auditLog: {
      record(entry) {
        events.push({ type: "audit", entry });
      },
    },
  };
  return { box, ports, events };
}

function makeRequest(overrides = {}) {
  return {
    barcode: "VIAL-1001",
    studyId: "STUDY-ALPHA",
    collectedAtMs: 1_700_000_000_000,
    nowMs: 1_700_000_060_000,
    volumeUl: 250,
    thawCount: 0,
    ...overrides,
  };
}

test("assigns first open row-major slot and records label before audit", () => {
  const { box, ports, events } = makeHarness({
    slots: {
      A1: { barcode: "VIAL-0001", studyId: "STUDY-ALPHA", volumeUl: 100, thawCount: 0, checkedInAtMs: 1 },
    },
  });

  const result = checkinVial(box, makeRequest({ studyId: "  STUDY-ALPHA  " }), ports);

  assert.deepEqual(result, { ok: true, slot: "A2", flags: [] });
  assert.equal(box.slots.A2.studyId, "STUDY-ALPHA");
  assert.equal(events.length, 2);
  assert.equal(events[0].type, "label");
  assert.equal(events[1].type, "audit");
});

test("honors preferredSlot and tags at-thaw-limit vials", () => {
  const { box, ports } = makeHarness();
  const result = checkinVial(
    box,
    makeRequest({ preferredSlot: "C2", thawCount: 2 }),
    ports,
  );

  assert.deepEqual(result, { ok: true, slot: "C2", flags: ["AT_THAW_LIMIT"] });
  assert.equal(box.slots.C2.barcode, "VIAL-1001");
});

test("rejects invalid inputs and occupied slots without side effects", () => {
  const { box, ports, events } = makeHarness({
    slots: {
      B1: { barcode: "VIAL-0009", studyId: "S1", volumeUl: 100, thawCount: 0, checkedInAtMs: 1 },
    },
  });

  assert.deepEqual(
    checkinVial(box, makeRequest({ barcode: "bad", studyId: "" }), ports),
    { ok: false, code: "INVALID_BARCODE" },
  );
  assert.deepEqual(
    checkinVial(box, makeRequest({ preferredSlot: "B01" }), ports),
    { ok: false, code: "INVALID_SLOT" },
  );
  assert.deepEqual(
    checkinVial(box, makeRequest({ preferredSlot: "B1" }), ports),
    { ok: false, code: "SLOT_OCCUPIED" },
  );
  assert.equal(events.length, 0);
  assert.deepEqual(Object.keys(box.slots), ["B1"]);
});
