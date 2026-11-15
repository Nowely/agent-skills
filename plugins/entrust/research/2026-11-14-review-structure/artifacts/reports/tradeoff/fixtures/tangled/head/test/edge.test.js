import test from "node:test";
import assert from "node:assert/strict";

import { planDispatches } from "../src/planDispatches.js";
import { createRequestAdapter } from "../src/operatorAids.js";

const varieties = [
  { id: "bean", family: "fabaceae", treatment: "none" },
  { id: "garlic", family: "allium", treatment: "scarified" },
];

const submittedAt = "2027-01-01T00:00:00Z";

test("omitting operatorAids installs an identity adapter", () => {
  const source = {
    id: "r",
    householdId: "h",
    items: ["bean"],
    submittedAt,
    carriedOver: false,
    permits: [],
  };
  const adapt = createRequestAdapter(undefined, varieties);

  assert.equal(adapt(source), source);
});

test("variety-only aids resolve itemCodes without member data", () => {
  const operatorAids = {
    varieties: [{ id: "bean", aliases: ["Scarlet-Bean"] }],
  };
  const result = planDispatches({
    requests: [
      {
        id: "r",
        itemCodes: ["scarlet-bean"],
        householdId: "h",
        submittedAt,
      },
    ],
    varieties,
    lots: [
      { id: "lot-bean", varietyId: "bean", expiresOn: "2027-02-01", packets: 1 },
    ],
    cycleDate: "2027-01-01",
    operatorAids,
  });

  assert.deepEqual(result.packets, [
    {
      requestId: "r",
      householdId: "h",
      varietyId: "bean",
      lotId: "lot-bean",
    },
  ]);
  assert.deepEqual(result.skipped, []);
});

test("member-only aids supply defaults and explicit fields win", () => {
  const adapt = createRequestAdapter(
    {
      members: [
        {
          id: "member-17",
          aliases: ["M17"],
          householdId: "member-house",
          permits: ["SCARIFY"],
          carriedOver: true,
        },
      ],
    },
    varieties,
  );

  const withDefaults = adapt({
    id: "r1",
    items: ["garlic"],
    memberId: "m17",
    submittedAt,
  });
  assert.equal(withDefaults.householdId, "member-house");
  assert.equal(withDefaults.carriedOver, true);
  assert.deepEqual(withDefaults.permits, ["SCARIFY"]);

  const explicit = adapt({
    id: "r2",
    items: ["garlic"],
    memberId: "member-17",
    householdId: "explicit-house",
    carriedOver: false,
    permits: ["OTHER", "SCARIFY"],
    submittedAt,
  });
  assert.equal(explicit.householdId, "explicit-house");
  assert.equal(explicit.carriedOver, false);
  assert.deepEqual(explicit.permits, ["OTHER", "SCARIFY"]);
});

test("partial aids reject an unresolved household and unknown member", () => {
  const adapt = createRequestAdapter({}, varieties);

  assert.throws(
    () =>
      adapt({
        id: "r1",
        items: ["bean"],
        submittedAt,
      }),
    /needs householdId/,
  );

  assert.throws(
    () =>
      adapt({
        id: "r2",
        items: ["bean"],
        memberId: "missing",
        submittedAt,
      }),
    /Unknown member reference/,
  );
});

test("aids reject canonical and alias collisions during setup", () => {
  assert.throws(
    () =>
      createRequestAdapter(
        {
          varieties: [{ id: "bean", aliases: ["Garlic"] }],
        },
        varieties,
      ),
    /alias collides with canonical ID garlic/,
  );

  assert.throws(
    () =>
      createRequestAdapter(
        {
          varieties: [
            { id: "bean", aliases: ["shared"] },
            { id: "garlic", aliases: ["shared"] },
          ],
        },
        varieties,
      ),
    /Ambiguous variety alias/,
  );
});

test("unknown itemCodes reach the core as unknown varieties", () => {
  const result = planDispatches({
    requests: [
      {
        id: "r",
        itemCodes: ["mystery"],
        householdId: "h",
        submittedAt,
      },
    ],
    varieties,
    lots: [],
    cycleDate: "2027-01-01",
    operatorAids: {},
  });

  assert.deepEqual(result.skipped, [
    { requestId: "r", varietyId: "mystery", reason: "unknown-variety" },
  ]);
});

test("canonical items bypass alias substitution when aids are enabled", () => {
  const result = planDispatches({
    requests: [
      {
        id: "r",
        items: ["Scarlet-Bean"],
        householdId: "h",
        submittedAt,
      },
    ],
    varieties,
    lots: [
      { id: "lot-bean", varietyId: "bean", expiresOn: "2027-02-01", packets: 1 },
    ],
    cycleDate: "2027-01-01",
    operatorAids: {
      varieties: [{ id: "bean", aliases: ["Scarlet-Bean"] }],
    },
  });

  assert.deepEqual(result.skipped, [
    {
      requestId: "r",
      varietyId: "Scarlet-Bean",
      reason: "unknown-variety",
    },
  ]);
});

test("zero stock and an allium-only failed request leave later decisions unchanged", () => {
  const result = planDispatches({
    requests: [
      {
        id: "01-empty",
        householdId: "h1",
        items: ["garlic"],
        submittedAt,
        carriedOver: false,
        permits: ["SCARIFY"],
      },
      {
        id: "02-valid",
        householdId: "h1",
        items: ["bean"],
        submittedAt: "2027-01-01T00:01:00Z",
        carriedOver: false,
        permits: [],
      },
    ],
    varieties,
    lots: [
      { id: "empty-garlic", varietyId: "garlic", expiresOn: "2027-02-01", packets: 0 },
      { id: "bean-lot", varietyId: "bean", expiresOn: "2027-02-01", packets: 1 },
    ],
    cycleDate: "2027-01-01",
  });

  assert.deepEqual(result.skipped, [
    { requestId: "01-empty", varietyId: "garlic", reason: "out-of-stock" },
  ]);
  assert.deepEqual(result.packets, [
    {
      requestId: "02-valid",
      householdId: "h1",
      varietyId: "bean",
      lotId: "bean-lot",
    },
  ]);
});

test("planner does not mutate canonical request or lot objects", () => {
  const sourceRequest = Object.freeze({
    id: "r",
    householdId: "h",
    items: Object.freeze(["bean", "bean"]),
    submittedAt,
    carriedOver: false,
    permits: Object.freeze([]),
  });
  const sourceLot = Object.freeze({
    id: "bean-lot",
    varietyId: "bean",
    expiresOn: "2027-02-01",
    packets: 2,
  });

  const result = planDispatches({
    requests: Object.freeze([sourceRequest]),
    varieties: Object.freeze(varieties),
    lots: Object.freeze([sourceLot]),
    cycleDate: "2027-01-01",
  });

  assert.equal(sourceLot.packets, 2);
  assert.deepEqual(sourceRequest.items, ["bean", "bean"]);
  assert.equal(result.packets.length, 2);
  assert.deepEqual(result.lotUse, [
    {
      lotId: "bean-lot",
      varietyId: "bean",
      used: 2,
      remaining: 0,
    },
  ]);
});
