import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetCheckinPath = process.env.TARGET_CHECKIN_PATH
  ? path.resolve(process.env.TARGET_CHECKIN_PATH)
  : path.resolve(__dirname, "../head/src/checkin.js");

const { checkinVial } = await import(pathToFileURL(targetCheckinPath).href);

function createFixture(boxOverrides = {}) {
  const box = {
    rows: 3,
    cols: 3,
    maxVolumeUl: 500,
    maxThawCount: 2,
    slots: {},
    ...boxOverrides,
  };
  const calls = [];
  const ports = {
    labelQueue: {
      enqueue(job) {
        calls.push({ port: "labelQueue", payload: structuredClone(job) });
      },
    },
    auditLog: {
      record(entry) {
        calls.push({ port: "auditLog", payload: structuredClone(entry) });
      },
    },
  };
  return { box, ports, calls };
}

function validReq(overrides = {}) {
  return {
    barcode: "VIAL-AB12",
    studyId: "ST-100",
    collectedAtMs: 1_000,
    nowMs: 1_000,
    volumeUl: 500,
    thawCount: 0,
    ...overrides,
  };
}

function assertErrorNoEffects(box, request, ports, calls, expectedCode) {
  const beforeSlots = structuredClone(box.slots);
  const beforeCallsLen = calls.length;
  const res = checkinVial(box, request, ports);
  assert.deepEqual(res, { ok: false, code: expectedCode });
  assert.deepEqual(box.slots, beforeSlots);
  assert.equal(calls.length, beforeCallsLen);
}

test("control: pairwise error priority across all 10 levels with zero side effects", () => {
  const { box, ports, calls } = createFixture({
    slots: {
      A1: {
        barcode: "VIAL-EXIST",
        studyId: "OTHER",
        hazardClass: "bsl2",
        volumeUl: 100,
        thawCount: 0,
        checkedInAtMs: 500,
      },
      C2: {
        barcode: "VIAL-URG1",
        studyId: "OTHER",
        hazardClass: "bsl2",
        volumeUl: 100,
        thawCount: 2,
        checkedInAtMs: 500,
      },
    },
  });

  // 1 > 2..9
  assertErrorNoEffects(
    box,
    validReq({
      barcode: "vial-lower",
      studyId: "",
      collectedAtMs: 50,
      nowMs: 10,
      volumeUl: 0,
      thawCount: -1,
      hazardClass: "invalid",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "INVALID_BARCODE",
  );

  // 2 > 3..9
  assertErrorNoEffects(
    box,
    validReq({
      studyId: " \t ",
      collectedAtMs: 50,
      nowMs: 10,
      volumeUl: 0,
      thawCount: -1,
      hazardClass: "invalid",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "INVALID_STUDY",
  );

  // 3 > 4..9
  assertErrorNoEffects(
    box,
    validReq({
      collectedAtMs: 11,
      nowMs: 10,
      volumeUl: -5,
      thawCount: -1,
      hazardClass: "invalid",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "INVALID_TIMESTAMP",
  );

  // 4 > 5..9
  assertErrorNoEffects(
    box,
    validReq({
      volumeUl: 500.01,
      thawCount: -1,
      hazardClass: "invalid",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "VOLUME_OUT_OF_RANGE",
  );

  // 5 > 6..9
  assertErrorNoEffects(
    box,
    validReq({
      thawCount: 0.5,
      hazardClass: "invalid",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "INVALID_THAW_COUNT",
  );

  // 6 > 7..9
  assertErrorNoEffects(
    box,
    validReq({
      barcode: "VIAL-EXIST",
      thawCount: 3,
      hazardClass: "bsl3",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "INVALID_HAZARD_CLASS",
  );

  // 7 > 8..9
  assertErrorNoEffects(
    box,
    validReq({
      barcode: "VIAL-EXIST",
      thawCount: 3,
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "THAW_LIMIT_EXCEEDED",
  );

  // 8 > 9.1..9.4
  assertErrorNoEffects(
    box,
    validReq({
      barcode: "VIAL-EXIST",
      preferredSlot: "bad",
    }),
    ports,
    calls,
    "DUPLICATE_BARCODE",
  );

  // 9.1 INVALID_SLOT (including leading zero) > 9.2..9.4
  assertErrorNoEffects(
    box,
    validReq({ preferredSlot: "A01", thawCount: 2 }),
    ports,
    calls,
    "INVALID_SLOT",
  );

  // 9.2 SLOT_OCCUPIED > 9.3 URGENT_ROW_MISMATCH & 9.4 CONTAINMENT_CONFLICT
  assertErrorNoEffects(
    box,
    validReq({ preferredSlot: "A1", thawCount: 2 }),
    ports,
    calls,
    "SLOT_OCCUPIED",
  );

  // 9.3 URGENT_ROW_MISMATCH > 9.4 CONTAINMENT_CONFLICT (at-limit requesting A2 adjacent to A1)
  assertErrorNoEffects(
    box,
    validReq({ preferredSlot: "A2", thawCount: 2 }),
    ports,
    calls,
    "URGENT_ROW_MISMATCH",
  );

  // 9.3 URGENT_ROW_MISMATCH > 9.4 CONTAINMENT_CONFLICT (below-limit requesting C1 adjacent to C2 while A3 is compatible)
  assertErrorNoEffects(
    box,
    validReq({ preferredSlot: "C1", thawCount: 0 }),
    ports,
    calls,
    "URGENT_ROW_MISMATCH",
  );

  // 9.4 CONTAINMENT_CONFLICT when urgent-row constraint is satisfied
  assertErrorNoEffects(
    box,
    validReq({ preferredSlot: "C1", thawCount: 2 }),
    ports,
    calls,
    "CONTAINMENT_CONFLICT",
  );
});

test("control: symmetric orthogonal BSL-2 containment, diagonals allowed, trimmed studyId equality", () => {
  const { box, ports, calls } = createFixture({
    rows: 4,
    cols: 3,
    slots: {
      B2: {
        barcode: "VIAL-CENT",
        studyId: "  ST-100 ",
        hazardClass: "bsl2",
        volumeUl: 100,
        thawCount: 0,
        checkedInAtMs: 100,
      },
    },
  });

  // All 4 orthogonal neighbors (A2, C2, B1, B3) reject cross-study standard vials
  for (const ortho of ["A2", "C2", "B1", "B3"]) {
    assertErrorNoEffects(
      box,
      validReq({ barcode: `VIAL-XX${ortho}`, studyId: "ST-200", hazardClass: "standard", preferredSlot: ortho }),
      ports,
      calls,
      "CONTAINMENT_CONFLICT",
    );
  }

  // Diagonals (A1, A3, C1, C3) succeed for cross-study standard vials
  const diagRes = checkinVial(
    box,
    validReq({ barcode: "VIAL-DIAG", studyId: "ST-200", hazardClass: "standard", preferredSlot: "A1" }),
    ports,
  );
  assert.equal(diagRes.ok, true);

  // Same trimmed studyId ("ST-100") allowed orthogonally at B3
  const sameRes = checkinVial(
    box,
    validReq({ barcode: "VIAL-SAME", studyId: " ST-100\n", hazardClass: "standard", preferredSlot: "B3" }),
    ports,
  );
  assert.equal(sameRes.ok, true);
  assert.equal(box.slots.B3.studyId, "ST-100");
});

test("control: custom urgentRow skipped during regular row-major scan and used on overflow", () => {
  const { box, ports, calls } = createFixture({
    rows: 2,
    cols: 2,
    urgentRow: "A",
  });

  // First below-limit vial skips urgentRow A and lands in B1
  const r1 = checkinVial(box, validReq({ barcode: "VIAL-R001", preferredSlot: null }), ports);
  assert.deepEqual(r1, { ok: true, slot: "B1", flags: [], overflowUsed: false });

  // Second below-limit vial lands in B2
  const r2 = checkinVial(box, validReq({ barcode: "VIAL-R002" }), ports);
  assert.deepEqual(r2, { ok: true, slot: "B2", flags: [], overflowUsed: false });

  // Third below-limit vial overflows into A1 with BSL2 + OVERFLOW_URGENT_ROW in exact order
  const r3 = checkinVial(
    box,
    validReq({ barcode: "VIAL-R003", hazardClass: "bsl2" }),
    ports,
  );
  assert.deepEqual(r3, {
    ok: true,
    slot: "A1",
    flags: ["BSL2", "OVERFLOW_URGENT_ROW"],
    overflowUsed: true,
  });

  // Verify labelQueue was called strictly before auditLog on each of the 3 check-ins
  assert.deepEqual(
    calls.map((c) => c.port),
    ["labelQueue", "auditLog", "labelQueue", "auditLog", "labelQueue", "auditLog"],
  );
  assert.equal(calls[5].payload.overflowUsed, true);
});

test("control: maxThawCount=0 treats thawCount=0 as at-limit without overflow", () => {
  const { box, ports } = createFixture({
    rows: 2,
    cols: 2,
    maxThawCount: 0,
  });

  const res = checkinVial(
    box,
    validReq({ barcode: "VIAL-ZERO", thawCount: 0, hazardClass: "bsl2" }),
    ports,
  );
  assert.deepEqual(res, {
    ok: true,
    slot: "B1",
    flags: ["BSL2", "AT_THAW_LIMIT"],
    overflowUsed: false,
  });
});

test("control: auto-allocation distinguishes BOX_FULL from NO_COMPATIBLE_SLOT", () => {
  const full = createFixture({
    rows: 1,
    cols: 1,
    slots: {
      A1: { barcode: "VIAL-FULL", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 0, checkedInAtMs: 1 },
    },
  });
  assertErrorNoEffects(full.box, validReq(), full.ports, full.calls, "BOX_FULL");

  const incompatible = createFixture({
    rows: 2,
    cols: 1,
    slots: {
      B1: { barcode: "VIAL-URG9", studyId: "S1", hazardClass: "standard", volumeUl: 50, thawCount: 2, checkedInAtMs: 1 },
    },
  });
  // A1 is open, but an at-limit vial can only occupy urgentRow B, which is full -> NO_COMPATIBLE_SLOT
  assertErrorNoEffects(
    incompatible.box,
    validReq({ thawCount: 2 }),
    incompatible.ports,
    incompatible.calls,
    "NO_COMPATIBLE_SLOT",
  );
});
