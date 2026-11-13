import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import checks from "./accept.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const results = [];
const check = async (name, run) => {
  try {
    await run();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error.stack ?? String(error) });
  }
};
const listFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => entry.isDirectory()
    ? listFiles(path.join(directory, entry.name))
    : [path.join(directory, entry.name)])
  .sort();
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const tree = (variant) => async (name) => import(pathToFileURL(path.join(root, variant, name)).href);

await check("source trees contain only the intended files and the base remains byte-identical", () => {
  const baseFiles = ["README.md", "package.json", "src/bookings/create.js", "src/bookings/quote.js"];
  for (const variant of ["base", "head", "clean"]) {
    const actual = listFiles(path.join(root, variant)).map((file) => path.relative(path.join(root, variant), file));
    assert.deepEqual(actual, [...baseFiles, ...(variant === "base" ? [] : ["src/bookings/edit.js"])].sort());
    for (const file of baseFiles) assert.equal(read(`${variant}/${file}`), read(`base/${file}`));
    assert.deepEqual(JSON.parse(read(`${variant}/package.json`)), {
      name: "room-bookings", private: true, type: "module",
    });
  }
});

await check("all fixture JavaScript has valid syntax", () => {
  for (const file of listFiles(root).filter((name) => /\.(mjs|js)$/.test(name))) {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  }
});

await check("rubric uses the fields and ruling kinds expected by score.mjs", () => {
  const rubric = JSON.parse(read("rubric.json"));
  assert.deepEqual(Object.keys(rubric).sort(), ["clean", "head"]);
  for (const variant of ["head", "clean"]) {
    assert.deepEqual(rubric[variant].fails, []);
    const items = rubric[variant].items;
    assert.ok(Array.isArray(items) && items.length > 0);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    for (const item of items) {
      for (const key of ["id", "title", "kind"]) assert.ok(typeof item[key] === "string" && item[key].length > 0);
      assert.ok(["find", "trap"].includes(item.kind));
      if (item.kind === "find") {
        for (const key of ["hit", "partial", "direction"]) assert.ok(typeof item[key] === "string" && item[key].length > 0);
        assert.ok(["design", "necessity", "behavior", "tests"].includes(item.direction));
      } else assert.ok(typeof item.violated === "string" && item.violated.length > 0);
    }
  }
  assert.equal(rubric.head.items.filter((item) => item.kind === "find").length, 3);
  assert.equal(rubric.clean.items.filter((item) => item.kind === "find").length, 0);
});

await check("the same independent acceptance suite has all 33 unique scenario names", () => {
  assert.equal(checks.length, 33);
  assert.equal(new Set(checks.map(({ name }) => name)).size, checks.length);
  for (const prefix of ["P1", "P2", "P3", "P4", "P5", "P6", "N1", "N2", "N3", "N4", "N5", "N6", "N7", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]) {
    assert.equal(checks.filter(({ name }) => name.startsWith(`${prefix} `)).length, 1);
  }
});

await check("existing base quote and creation use the stated price and guards", async () => {
  const { quoteRoom } = await tree("base")("src/bookings/quote.js");
  const { previewCreate } = await tree("base")("src/bookings/create.js");
  const room = Object.freeze({ id: "cedar", capacity: 4, hourCents: 1200, setupCents: 300 });
  const draft = Object.freeze({ roomId: "cedar", start: 20, end: 24, people: 3 });
  assert.equal(quoteRoom(room, 20, 24), 2700);
  assert.equal(quoteRoom(room, 0, 1), 1500);
  assert.deepEqual(previewCreate(room, draft), { kind: "ready", totalCents: 2700 });
  assert.deepEqual(previewCreate(room, { ...draft, end: 20, people: 5 }), { kind: "blocked", reason: "invalid-window" });
  assert.deepEqual(previewCreate(room, { ...draft, people: 5 }), { kind: "blocked", reason: "capacity" });
});

for (const variant of ["head", "clean"]) {
  for (const acceptance of checks) {
    await check(`${variant}: ${acceptance.name}`, () => acceptance.run(tree(variant)));
  }
}

const inputFiles = [
  "brief.md", "rubric.json", "rubric-design.md", "accept.mjs", "run-checks.mjs",
  ...["base", "head", "clean"].flatMap((variant) => listFiles(path.join(root, variant)).map((file) => path.relative(root, file))),
].sort();
const hashes = Object.fromEntries(inputFiles.map((file) => [file, hash(fs.readFileSync(path.join(root, file)))]));
const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({
  node: process.version,
  passed: failed.length === 0,
  summary: {
    fixtureChecks: 5,
    scenariosPerVariant: checks.length,
    callsPerScenario: 2,
    candidateCalls: checks.length * 2 * 2,
    checksPassed: results.length - failed.length,
    checksFailed: failed.length,
  },
  results,
  sha256: hashes,
}, null, 2));
if (failed.length) process.exitCode = 1;
