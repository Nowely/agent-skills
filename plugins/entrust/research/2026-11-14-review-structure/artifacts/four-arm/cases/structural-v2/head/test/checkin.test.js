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

test("assigns first compatible non-urgent slot and emits label before audit", () => {
  const { box, ports, events } = makeHarness({
    slots: {
      A1: {
        barcode: "VIAL-0001",
        studyId: "STUDY-BETA",
        hazardClass: "bsl2",
        volumeUl: 100,
        thawCount: 0,
        checkedInAtMs: 1,
      },
    },
  });

  const result = checkinVial(box, makeRequest({ studyId: "  STUDY-ALPHA  " }), ports);

  assert.deepEqual(result, {
    ok: true,
    slot: "A3",
    flags: [],
    overflowUsed: false,
  });
  assert.deepEqual(box.slots.A3, {
    barcode: "VIAL-1001",
    studyId: "STUDY-ALPHA",
    hazardClass: "standard",
    volumeUl: 250,
    thawCount: 0,
    checkedInAtMs: 1_700_000_060_000,
  });
  assert.deepEqual(events, [
    {
      type: "label",
      job: { barcode: "VIAL-1001", slot: "A3", flags: [] },
    },
    {
      type: "audit",
      entry: {
        action: "CHECKIN",
        barcode: "VIAL-1001",
        slot: "A3",
        studyId: "STUDY-ALPHA",
        hazardClass: "standard",
        overflowUsed: false,
        timestampMs: 1_700_000_060_000,
      },
    },
  ]);
});

test("places at-limit vials exclusively in urgentRow with ordered flags", () => {
  const { box, ports } = makeHarness();

  const result = checkinVial(
    box,
    makeRequest({ thawCount: 2, hazardClass: "bsl2" }),
    ports,
  );

  assert.deepEqual(result, {
    ok: true,
    slot: "C1",
    flags: ["BSL2", "AT_THAW_LIMIT"],
    overflowUsed: false,
  });

  const badPreferred = checkinVial(
    box,
    makeRequest({ barcode: "VIAL-1002", thawCount: 2, preferredSlot: "A1" }),
    ports,
  );
  assert.deepEqual(badPreferred, { ok: false, code: "URGENT_ROW_MISMATCH" });
});

test("allows diagonal cross-study BSL-2 placement and same-study orthogonal placement", () => {
  const { box, ports } = makeHarness({
    slots: {
      B2: {
        barcode: "VIAL-0050",
        studyId: "STUDY-BETA",
        hazardClass: "bsl2",
        volumeUl: 200,
        thawCount: 0,
        checkedInAtMs: 1,
      },
    },
  });

  const diag = checkinVial(
    box,
    makeRequest({ barcode: "VIAL-1003", studyId: "STUDY-ALPHA", preferredSlot: "A1" }),
    ports,
  );
  assert.equal(diag.ok, true);

  const sameStudy = checkinVial(
    box,
    makeRequest({
      barcode: "VIAL-1004",
      studyId: "STUDY-BETA",
      hazardClass: "bsl2",
      preferredSlot: "B3",
    }),
    ports,
  );
  assert.equal(sameStudy.ok, true);
});

test("treats pre-existing records without hazardClass as standard when incoming vial is bsl2", () => {
  const { box, ports } = makeHarness({
    slots: {
      A1: {
        barcode: "VIAL-0099",
        studyId: "STUDY-LEGACY",
        volumeUl: 100,
        thawCount: 0,
        checkedInAtMs: 1,
      },
    },
  });

  const conflict = checkinVial(
    box,
    makeRequest({ hazardClass: "bsl2", preferredSlot: "A2" }),
    ports,
  );
  assert.deepEqual(conflict, { ok: false, code: "CONTAINMENT_CONFLICT" });
});

test("overflows below-limit vial into urgentRow only when no compatible regular slot exists", () => {
  const { box, ports } = makeHarness({
    rows: 2,
    cols: 2,
    urgentRow: "B",
    slots: {
      A1: {
        barcode: "VIAL-0001",
        studyId: "STUDY-BETA",
        hazardClass: "bsl2",
        volumeUl: 100,
        thawCount: 0,
        checkedInAtMs: 1,
      },
    },
  });

  // A2 is orthogonally adjacent to A1 (BSL-2, STUDY-BETA), so zero regular slots are compatible.
  // B1 is also adjacent to A1, leaving B2 as the sole compatible overflow slot.
  const result = checkinVial(
    box,
    makeRequest({ hazardClass: "bsl2" }),
    ports,
  );

  assert.deepEqual(result, {
    ok: true,
    slot: "B2",
    flags: ["BSL2", "OVERFLOW_URGENT_ROW"],
    overflowUsed: true,
  });
});

test("enforces error priority and leaves box and ports untouched on failure", () => {
  const { box, ports, events } = makeHarness({
    slots: {
      A1: {
        barcode: "VIAL-DUP1",
        studyId: "STUDY-BETA",
        hazardClass: "bsl2",
        volumeUl: 100,
        thawCount: 0,
        checkedInAtMs: 1,
      },
    },
  });
  const initialSlotsSnapshot = structuredClone(box.slots);

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        barcode: "bad",
        studyId: "",
        collectedAtMs: 20,
        nowMs: 10,
        volumeUl: -1,
        thawCount: -1,
        hazardClass: "bsl4",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_BARCODE" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        studyId: "   ",
        collectedAtMs: 20,
        nowMs: 10,
        volumeUl: -1,
        thawCount: -1,
        hazardClass: "bsl4",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_STUDY" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        collectedAtMs: 20,
        nowMs: 10,
        volumeUl: 0,
        thawCount: -1,
        hazardClass: "bsl4",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_TIMESTAMP" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        volumeUl: 501,
        thawCount: 1.5,
        hazardClass: "bsl4",
      }),
      ports,
    ),
    { ok: false, code: "VOLUME_OUT_OF_RANGE" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        thawCount: -1,
        hazardClass: "bsl4",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_THAW_COUNT" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        barcode: "VIAL-DUP1",
        thawCount: 99,
        hazardClass: "bsl4",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_HAZARD_CLASS" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        barcode: "VIAL-DUP1",
        thawCount: 99,
        preferredSlot: "Z99",
      }),
      ports,
    ),
    { ok: false, code: "THAW_LIMIT_EXCEEDED" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        barcode: "VIAL-DUP1",
        preferredSlot: "Z99",
      }),
      ports,
    ),
    { ok: false, code: "DUPLICATE_BARCODE" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        thawCount: 2,
        preferredSlot: "A01",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_SLOT" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        thawCount: 2,
        preferredSlot: "a1",
      }),
      ports,
    ),
    { ok: false, code: "INVALID_SLOT" },
  );

  assert.deepEqual(
    checkinVial(
      box,
      makeRequest({
        thawCount: 2,
        preferredSlot: "A1",
      }),
      ports,
    ),
    { ok: false, code: "SLOT_OCCUPIED" },
  );

  // Below-limit vial targeting C1 while compatible regular slots (e.g. A3) exist,
  // even if C1 also had a containment neighbor: URGENT_ROW_MISMATCH beats CONTAINMENT_CONFLICT.
  box.slots.C2 = {
    barcode: "VIAL-0002",
    studyId: "STUDY-BETA",
    hazardClass: "bsl2",
    volumeUl: 100,
    thawCount: 2,
    checkedInAtMs: 1,
  };
  const snapshotWithC2 = structuredClone(box.slots);

  assert.deepEqual(
    checkinVial(box, makeRequest({ preferredSlot: "C1" }), ports),
    { ok: false, code: "URGENT_ROW_MISMATCH" },
  );

  assert.deepEqual(box.slots, snapshotWithC2);
  assert.equal(events.length, 0);
  assert.deepEqual(box.slots.A1, initialSlotsSnapshot.A1);
});

test("distinguishes BOX_FULL from NO_COMPATIBLE_SLOT", () => {
  const full = makeHarness({
    rows: 1,
    cols: 1,
    slots: {
      A1: { barcode: "VIAL-0001", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
    },
  });
  assert.deepEqual(checkinVial(full.box, makeRequest(), full.ports), {
    ok: false,
    code: "BOX_FULL",
  });

  const blocked = makeHarness({
    rows: 1,
    cols: 2,
    slots: {
      A1: { barcode: "VIAL-0001", studyId: "STUDY-BETA", hazardClass: "bsl2", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
    },
  });
  assert.deepEqual(checkinVial(blocked.box, makeRequest(), blocked.ports), {
    ok: false,
    code: "NO_COMPATIBLE_SLOT",
  });
});

test("supports preferredSlot overflow into custom urgentRow and checks containment after urgent-row rule", () => {
  const { box, ports } = makeHarness({
    rows: 2,
    cols: 10,
    urgentRow: "A",
    slots: {
      // Fill B1..B9 and make B10 incompatible via A10 cross-study BSL-2
      B1: { barcode: "VIAL-2001", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B2: { barcode: "VIAL-2002", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B3: { barcode: "VIAL-2003", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B4: { barcode: "VIAL-2004", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B5: { barcode: "VIAL-2005", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B6: { barcode: "VIAL-2006", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B7: { barcode: "VIAL-2007", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B8: { barcode: "VIAL-2008", studyId: "STUDY-ALPHA", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      B9: { barcode: "VIAL-2009", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
      A10: { barcode: "VIAL-2010", studyId: "STUDY-OTHER", hazardClass: "bsl2", volumeUl: 50, thawCount: 2, checkedInAtMs: 1 },
    },
  });

  // Zero compatible slots outside urgentRow "A" (B10 conflicts with A10).
  // Preferred A9 is adjacent to A10 (BSL-2, STUDY-OTHER) -> overflow allowed, fails on CONTAINMENT_CONFLICT.
  assert.deepEqual(
    checkinVial(box, makeRequest({ preferredSlot: "A9" }), ports),
    { ok: false, code: "CONTAINMENT_CONFLICT" },
  );

  // Preferred A8 has no conflicting neighbors -> succeeds with overflowUsed: true.
  const ok = checkinVial(box, makeRequest({ preferredSlot: "A8", hazardClass: "bsl2" }), ports);
  assert.deepEqual(ok, {
    ok: true,
    slot: "A8",
    flags: ["BSL2", "OVERFLOW_URGENT_ROW"],
    overflowUsed: true,
  });
});

