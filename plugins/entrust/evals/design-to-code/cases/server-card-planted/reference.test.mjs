// node --test evals/design-to-code/cases/server-card-planted/reference.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareReference, decodePng } from "./reference.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const card = decodePng(fs.readFileSync(path.join(HERE, "project/design/card-764/reference.png")));
const popover = decodePng(fs.readFileSync(path.join(HERE, "project/design/network-popover/reference.png")));
const crop = (img, x, y, w, h) => {
  const data = new Uint8Array(w * h * 3);
  for (let r = 0; r < h; r++) data.set(img.data.subarray(((y + r) * img.width + x) * 3, ((y + r) * img.width + x + w) * 3), r * w * 3);
  return { width: w, height: h, data };
};
const rows = (img, drop) => {
  const keep = [...Array(img.height).keys()].filter((r) => !drop.includes(r)), data = new Uint8Array(keep.length * img.width * 3);
  keep.forEach((r, i) => data.set(img.data.subarray(r * img.width * 3, (r + 1) * img.width * 3), i * img.width * 3));
  return { width: img.width, height: keep.length, data };
};

test("the design's own image is identical", () => assert.equal(compareReference(card, card).kind, "identical"));

test("the popover cut to its box, its shadow left out, is a crop of the design", () => {
  const r = compareReference(popover, crop(popover, 21, 13, 265, 112));
  assert.equal(r.kind, "cropped");
  assert.deepEqual([r.dx, r.dy], [21, 13]);
});

test("the band with the planted line cut off the card's top is drawn content cut away", () => {
  const r = compareReference(card, crop(card, 0, 26, card.width, card.height - 26));
  assert.equal(r.kind, "cut content");
  assert.ok(r.ink > 20, `${r.ink} drawn pixels`);
});

test("rows taken out of the middle, or a painted pixel, is no crop of the design", () => {
  assert.equal(compareReference(card, rows(card, [60, 61, 62, 63])).kind, "edited");
  const painted = { ...card, data: card.data.slice() };
  painted.data.fill(0, 3 * (50 * card.width + 100), 3 * (50 * card.width + 140));
  assert.equal(compareReference(card, painted).kind, "edited");
});
