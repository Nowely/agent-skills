import test from "node:test";
import assert from "node:assert/strict";
import { CsvError, parseCsv } from "../src/lib/csv.js";

test("a quoted field keeps its comma and its line break", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y\nz",1\n'), [{ line: 2, a: "x, y\nz", b: "1" }]);
});

test("an unclosed quote is an error", () => {
  assert.throws(() => parseCsv('a\n"x\n'), CsvError);
});

test("a row of empty cells is a record, and a blank line is not", () => {
  assert.deepEqual(parseCsv("a,b\n,\n\nx,y\n"), [{ line: 2, a: "", b: "" }, { line: 4, a: "x", b: "y" }]);
});

test("a quote that does not enclose a whole field is an error", () => {
  assert.throws(() => parseCsv('a\nx"y\n'), CsvError);
  assert.throws(() => parseCsv('a\n"x"y\n'), CsvError);
});

test("a record's line counts every line break before it, and no column replaces it", () => {
  assert.deepEqual(parseCsv('line,b\n"x\ry",1\nz,2\n'), [{ line: 2, b: "1" }, { line: 4, b: "2" }]);
});
