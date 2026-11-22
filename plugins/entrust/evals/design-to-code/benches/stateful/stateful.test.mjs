// Opt-in, not in CI: the bench takes under a minute and needs Playwright with Chromium.
//   ENTRUST_BENCHES=1 node --test evals/design-to-code/benches/stateful/stateful.test.mjs      (from plugins/entrust)
// It runs the bench against the skill's checker and asserts today's numbers as minimums, so the work that follows can
// raise them: raise the numbers here with it.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIN_CAUGHT = 2; // of 3; stale-observer is missed today
const playwright = (() => {
  for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
    try { createRequire(path.join(process.cwd(), "noop.js")).resolve(name); return true; } catch { /* next */ }
  }
  return Boolean(spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout?.trim());
})();
const skip = process.env.ENTRUST_BENCHES !== "1" ? "opt-in: set ENTRUST_BENCHES=1" : playwright ? false : "Playwright is not installed where this runs";

test(`the stateful bench: at least ${MIN_CAUGHT} classes caught, no clean build blocked`, { skip, timeout: 20 * 60 * 1000 }, () => {
  const run = spawnSync(process.execPath, [path.join(HERE, "run-stateful.mjs"), "--label", "test"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  assert.equal(run.status, 0, run.stderr);
  const m = /caught (\d+) of (\d+) expected classes; (\d+) clean builds blocked/.exec(run.stdout);
  assert.ok(m, `no summary line in:\n${run.stdout}`);
  const [caught, , blocked] = m.slice(1).map(Number);
  assert.ok(caught >= MIN_CAUGHT, `caught ${caught}, expected at least ${MIN_CAUGHT}\n${run.stdout}`);
  assert.equal(blocked, 0, `clean builds blocked\n${run.stdout}`);
});
