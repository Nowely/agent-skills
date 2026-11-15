import test from "node:test";
import assert from "node:assert/strict";

import { planDispatches } from "../src/planDispatches.js";

test("keeps multi-item requests atomic and uses input order", () => {
  const result = planDispatches({
    requests: [
      {
        id: "r-partial",
        householdId: "h1",
        items: ["carrot", "tomato", "tomato"],
      },
      {
        id: "r-carrot",
        householdId: "h2",
        items: ["carrot"],
      },
      {
        id: "r-tomato",
        householdId: "h3",
        items: ["tomato"],
      },
      {
        id: "r-unknown",
        householdId: "h4",
        items: ["missing"],
      },
    ],
    varieties: [{ id: "carrot" }, { id: "tomato" }],
    lots: [
      { id: "lot-z", varietyId: "tomato", packets: 1 },
      { id: "lot-a", varietyId: "carrot", packets: 1 },
    ],
  });

  assert.deepEqual(result, {
    packets: [
      {
        requestId: "r-carrot",
        householdId: "h2",
        varietyId: "carrot",
        lotId: "lot-a",
      },
      {
        requestId: "r-tomato",
        householdId: "h3",
        varietyId: "tomato",
        lotId: "lot-z",
      },
    ],
    skipped: [
      {
        requestId: "r-partial",
        varietyId: "tomato",
        reason: "out-of-stock",
      },
      {
        requestId: "r-unknown",
        varietyId: "missing",
        reason: "unknown-variety",
      },
    ],
    labels: ["r-carrot:carrot@lot-a", "r-tomato:tomato@lot-z"],
    lotUse: [
      {
        lotId: "lot-a",
        varietyId: "carrot",
        used: 1,
        remaining: 0,
      },
      {
        lotId: "lot-z",
        varietyId: "tomato",
        used: 1,
        remaining: 0,
      },
    ],
  });
});
