import test from "node:test";
import assert from "node:assert/strict";
import { CsvError, parseCsv } from "../src/lib/csv.js";

test("a quoted field keeps its comma and its line break", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y\nz",1\n'), [{ line: 2, a: "x, y\nz", b: "1" }]);
});

test("an unclosed quote is an error", () => {
  assert.throws(() => parseCsv('a\n"x\n'), CsvError);
});
