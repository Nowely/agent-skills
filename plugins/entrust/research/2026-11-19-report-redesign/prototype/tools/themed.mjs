// A small demo record for what the two real records do not exercise: decision variants with consequences, a
// conditional child question, evidence zones, structured coverage, a passport and a tradeoff. It is the review
// suite's own THEMED fixture over the currency-contract case diff, made the way review-report.test.mjs makes it:
// the case's two trees committed in a temporary repository under the temp directory, the diff taken there, the
// record and its two one-pixel pictures written beside it. Prints the record's path for build.mjs:
//   node build.mjs "$(node tools/themed.mjs)" themed.html
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// tools/ -> prototype/ -> 2026-11-19-report-redesign/ -> research/ -> plugins/entrust/, then evals/review/
const EVALS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../evals/review");
const { prepare } = await import(pathToFileURL(path.join(EVALS, "prepare.mjs")).href);
const { reportFixtures } = await import(pathToFileURL(path.join(EVALS, "report-fixtures.mjs")).href);
const { run } = prepare("currency-contract", "clean"); // a fresh directory under os.tmpdir()
const repo = path.join(run, "repo");
const diff = execFileSync("git", ["-c", "core.quotepath=off", "diff", "--no-color", "--no-ext-diff", "--no-renames", "-U3", "HEAD~1..HEAD", "--"], { cwd: repo });
const { THEMED } = reportFixtures(createHash("sha256").update(diff).digest("hex"));
const out = run;
fs.writeFileSync(path.join(out, "source.diff"), diff);
// the two pictures the fixture names, one pixel each, as the test suite writes them
for (const name of ["before.png", "after.png"]) fs.writeFileSync(path.join(out, name), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
fs.writeFileSync(path.join(out, "review.json"), JSON.stringify(THEMED, null, 2));
console.log(path.join(out, "review.json"));
