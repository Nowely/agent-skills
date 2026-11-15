import test from "node:test";
import assert from "node:assert/strict";

import { planDispatches } from "../head/src/planDispatches.js";

function request(id, items, submittedAt, overrides = {}) {
  return {
    id,
    householdId: overrides.householdId ?? `household-${id}`,
    items,
    submittedAt,
    carriedOver: overrides.carriedOver ?? false,
    permits: overrides.permits ?? [],
  };
}

function lot(id, varietyId, expiresOn, packets) {
  return { id, varietyId, expiresOn, packets };
}

test("ranks requests, applies FEFO and preserves each output order", () => {
  const result = planDispatches({
    cycleDate: "2027-01-01",
    varieties: [
      { id: "tomato", family: "solanaceae", treatment: "none" },
    ],
    lots: [
      lot("lot-late", "tomato", "2027-04-01", 2),
      lot("lot-old", "tomato", "2026-12-31", 5),
      lot("lot-b", "tomato", "2027-02-01", 1),
      lot("lot-edge", "tomato", "2027-01-01", 1),
      lot("lot-a", "tomato", "2027-02-01", 1),
    ],
    requests: [
      request("r-z", ["tomato"], "2027-01-02T00:00:00Z"),
      request("r-b", ["tomato", "tomato"], "2027-01-01T00:00:00Z"),
      request("r-wait", ["tomato"], "2027-01-03T00:00:00Z"),
      request("r-a", ["tomato"], "2027-01-01T00:00:00Z"),
      request("r-carry", ["tomato"], "2027-03-01T00:00:00Z", {
        carriedOver: true,
      }),
    ],
  });

  assert.deepEqual(result, {
    packets: [
      {
        requestId: "r-carry",
        householdId: "household-r-carry",
        varietyId: "tomato",
        lotId: "lot-edge",
      },
      {
        requestId: "r-a",
        householdId: "household-r-a",
        varietyId: "tomato",
        lotId: "lot-a",
      },
      {
        requestId: "r-b",
        householdId: "household-r-b",
        varietyId: "tomato",
        lotId: "lot-b",
      },
      {
        requestId: "r-b",
        householdId: "household-r-b",
        varietyId: "tomato",
        lotId: "lot-late",
      },
      {
        requestId: "r-z",
        householdId: "household-r-z",
        varietyId: "tomato",
        lotId: "lot-late",
      },
    ],
    skipped: [
      {
        requestId: "r-wait",
        varietyId: "tomato",
        reason: "out-of-stock",
      },
    ],
    labels: [
      "r-carry:tomato@lot-edge",
      "r-a:tomato@lot-a",
      "r-b:tomato@lot-b",
      "r-b:tomato@lot-late",
      "r-z:tomato@lot-late",
    ],
    lotUse: [
      {
        lotId: "lot-a",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-b",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-edge",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-late",
        varietyId: "tomato",
        used: 2,
        remaining: 0,
      },
    ],
  });
});

test("makes later lines observe reservations and rolls back a failed request", () => {
  const result = planDispatches({
    cycleDate: "2027-01-01",
    varieties: [
      { id: "carrot", family: "apiaceae", treatment: "none" },
      { id: "tomato", family: "solanaceae", treatment: "none" },
    ],
    lots: [
      lot("lot-carrot", "carrot", "2027-03-01", 1),
      lot("lot-tomato", "tomato", "2027-03-01", 1),
    ],
    requests: [
      request(
        "a-atomic",
        ["carrot", "tomato", "tomato"],
        "2027-01-01T00:00:00Z",
        { householdId: "household-A" },
      ),
      request(
        "b-after",
        ["carrot", "tomato"],
        "2027-01-01T00:00:00Z",
        { householdId: "household-B" },
      ),
    ],
  });

  assert.deepEqual(result, {
    packets: [
      {
        requestId: "b-after",
        householdId: "household-B",
        varietyId: "carrot",
        lotId: "lot-carrot",
      },
      {
        requestId: "b-after",
        householdId: "household-B",
        varietyId: "tomato",
        lotId: "lot-tomato",
      },
    ],
    skipped: [
      {
        requestId: "a-atomic",
        varietyId: "tomato",
        reason: "out-of-stock",
      },
    ],
    labels: [
      "b-after:carrot@lot-carrot",
      "b-after:tomato@lot-tomato",
    ],
    lotUse: [
      {
        lotId: "lot-carrot",
        varietyId: "carrot",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-tomato",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
    ],
  });
});

test("uses per-line rejection precedence and commits allium state only on success", () => {
  const at = (minute) =>
    `2027-01-01T00:${String(minute).padStart(2, "0")}:00Z`;

  const result = planDispatches({
    cycleDate: "2027-01-01",
    varieties: [
      { id: "onion", family: "allium", treatment: "none" },
      { id: "garlic", family: "allium", treatment: "scarified" },
      { id: "leek", family: "allium", treatment: "none" },
      { id: "tomato", family: "solanaceae", treatment: "none" },
    ],
    lots: [
      lot("lot-leek", "leek", "2027-03-01", 1),
      lot("lot-garlic", "garlic", "2027-03-01", 1),
      lot("lot-onion", "onion", "2027-03-01", 1),
      lot("lot-tomato", "tomato", "2027-03-01", 1),
    ],
    requests: [
      request("01-onion", ["onion"], at(1), {
        householdId: "household-A",
      }),
      request("02-permit-before-cap", ["tomato", "garlic"], at(2), {
        householdId: "household-A",
      }),
      request("03-cap", ["leek"], at(3), {
        householdId: "household-A",
      }),
      request("04-other-house-permit", ["garlic"], at(4), {
        householdId: "household-B",
      }),
      request("05-garlic-allowed", ["garlic"], at(5), {
        householdId: "household-B",
        permits: ["SCARIFY"],
      }),
      request("06-permit-before-stock", ["garlic"], at(6), {
        householdId: "household-C",
      }),
      request("07-other-house-cap", ["leek"], at(7), {
        householdId: "household-B",
      }),
      request("08-restored-tomato", ["tomato"], at(8), {
        householdId: "household-C",
      }),
    ],
  });

  assert.deepEqual(result, {
    packets: [
      {
        requestId: "01-onion",
        householdId: "household-A",
        varietyId: "onion",
        lotId: "lot-onion",
      },
      {
        requestId: "05-garlic-allowed",
        householdId: "household-B",
        varietyId: "garlic",
        lotId: "lot-garlic",
      },
      {
        requestId: "08-restored-tomato",
        householdId: "household-C",
        varietyId: "tomato",
        lotId: "lot-tomato",
      },
    ],
    skipped: [
      {
        requestId: "02-permit-before-cap",
        varietyId: "garlic",
        reason: "permit-required",
      },
      {
        requestId: "03-cap",
        varietyId: "leek",
        reason: "household-allium-limit",
      },
      {
        requestId: "04-other-house-permit",
        varietyId: "garlic",
        reason: "permit-required",
      },
      {
        requestId: "06-permit-before-stock",
        varietyId: "garlic",
        reason: "permit-required",
      },
      {
        requestId: "07-other-house-cap",
        varietyId: "leek",
        reason: "household-allium-limit",
      },
    ],
    labels: [
      "01-onion:onion@lot-onion",
      "05-garlic-allowed:garlic@lot-garlic",
      "08-restored-tomato:tomato@lot-tomato",
    ],
    lotUse: [
      {
        lotId: "lot-garlic",
        varietyId: "garlic",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-onion",
        varietyId: "onion",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-tomato",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
    ],
  });
});

test("restores provisional allium ownership after a same-request conflict", () => {
  const result = planDispatches({
    cycleDate: "2027-01-01",
    varieties: [
      { id: "onion", family: "allium", treatment: "none" },
      { id: "leek", family: "allium", treatment: "none" },
    ],
    lots: [
      lot("lot-onion", "onion", "2027-03-01", 1),
      lot("lot-leek", "leek", "2027-03-01", 1),
    ],
    requests: [
      request("01-two-allium", ["onion", "leek"], "2027-01-01T00:01:00Z", {
        householdId: "same-household",
      }),
      request("02-after-rollback", ["onion"], "2027-01-01T00:02:00Z", {
        householdId: "same-household",
      }),
    ],
  });

  assert.deepEqual(result, {
    packets: [
      {
        requestId: "02-after-rollback",
        householdId: "same-household",
        varietyId: "onion",
        lotId: "lot-onion",
      },
    ],
    skipped: [
      {
        requestId: "01-two-allium",
        varietyId: "leek",
        reason: "household-allium-limit",
      },
    ],
    labels: ["02-after-rollback:onion@lot-onion"],
    lotUse: [
      {
        lotId: "lot-onion",
        varietyId: "onion",
        used: 1,
        remaining: 0,
      },
    ],
  });
});

test("uses the first failing line and rolls back earlier unknown-line reservations", () => {
  const result = planDispatches({
    cycleDate: "2027-01-01",
    varieties: [
      { id: "tomato", family: "solanaceae", treatment: "none" },
    ],
    lots: [lot("lot-tomato", "tomato", "2027-03-01", 1)],
    requests: [
      request(
        "01-unknown-first",
        ["missing", "tomato"],
        "2027-01-01T00:01:00Z",
      ),
      request(
        "02-unknown-second",
        ["tomato", "other-missing"],
        "2027-01-01T00:02:00Z",
      ),
      request("03-after", ["tomato"], "2027-01-01T00:03:00Z"),
    ],
  });

  assert.deepEqual(result, {
    packets: [
      {
        requestId: "03-after",
        householdId: "household-03-after",
        varietyId: "tomato",
        lotId: "lot-tomato",
      },
    ],
    skipped: [
      {
        requestId: "01-unknown-first",
        varietyId: "missing",
        reason: "unknown-variety",
      },
      {
        requestId: "02-unknown-second",
        varietyId: "other-missing",
        reason: "unknown-variety",
      },
    ],
    labels: ["03-after:tomato@lot-tomato"],
    lotUse: [
      {
        lotId: "lot-tomato",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
    ],
  });
});
