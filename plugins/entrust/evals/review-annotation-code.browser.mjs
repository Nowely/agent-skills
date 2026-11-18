// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs CHROME_FOR_TESTING=/path/to/chrome \
//   node review-annotation-code.browser.mjs /path/to/rendered-65507.html
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE || "playwright-core");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_FOR_TESTING });
const url = pathToFileURL(process.argv[2]).href;
let failures = 0;
try {
  for (const scenario of ["multiple-lines", "second-fragment"]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.evaluate(() => { location.hash = "#b38"; });
      await page.waitForSelector("#b38 .l");
      const saved = await page.evaluate(scenario => {
        const segments = [...document.querySelectorAll('#map .seg[data-block="38"]')];
        if (segments.length !== 2 || segments[1].id) throw Error("fixture needs two canonical B38 fragments");
        const segment = segments[scenario === "multiple-lines" ? 0 : 1];
        segment.querySelectorAll("details").forEach(details => { details.open = true; });
        const lines = [...segment.querySelectorAll(".l")];
        const text = line => {
          const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) if (walker.currentNode.data.trim() && !walker.currentNode.parentElement.closest(".l > b,.l > i")) return walker.currentNode;
          throw Error("no code text");
        };
        const first = text(lines[0]), last = scenario === "multiple-lines" ? text(lines[1]) : first;
        const start = first.data.search(/\S/), end = last === first ? Math.min(first.length, start + 5) : Math.min(last.length, last.data.search(/\S/) + 5);
        const range = document.createRange(); range.setStart(first, start); range.setEnd(last, end);
        getSelection().removeAllRanges(); getSelection().addRange(range);
        const quote = getSelection().toString();
        if (!quote) throw Error("code is not visible");
        const expected = lines.slice(0, scenario === "multiple-lines" ? 2 : 1).map(line => {
          const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
          let value = "";
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.parentElement.closest(".l > b,.l > i") || !range.intersectsNode(node)) continue;
            value += node.data.slice(node === first ? start : 0, node === last ? end : node.length);
          }
          return value;
        });
        document.dispatchEvent(new Event("selectionchange")); document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = `note ${scenario}`;
        editor.querySelector('[data-annotation-action="save"]').click();
        const key = "review-report:" + JSON.parse(document.querySelector("#data").textContent).key;
        return { key, quote, expected, proof: JSON.parse(localStorage.getItem(key)).passages[0].proof };
      }, scenario);
      assert.ok(saved.proof, "proof missing");
      await page.reload();
      await page.waitForSelector("#b38 .l");
      const result = await page.evaluate(({ key, scenario }) => {
        const segments = [...document.querySelectorAll('#map .seg[data-block="38"]')];
        const target = segments[scenario === "multiple-lines" ? 0 : 1];
        return { passage: JSON.parse(localStorage.getItem(key)).passages[0],
          marker: !!target.querySelector('mark[data-annotation="0"] .annotation-marker'),
          other: !!segments[scenario === "multiple-lines" ? 1 : 0].querySelector('mark[data-annotation="0"]'),
          markedLines: [...target.querySelectorAll('.l')].filter(line => line.querySelector('mark[data-annotation="0"]')).length,
          marked: [...target.querySelectorAll(".l")].slice(0, scenario === "multiple-lines" ? 2 : 1).map(line =>
            [...line.querySelectorAll('mark[data-annotation="0"]')].map(mark =>
              [...mark.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data).join("")).join("")),
          source: !!document.querySelector("#passages [data-annotation-source]") };
      }, { key: saved.key, scenario });
      assert.equal(result.passage.quote, saved.quote);
      assert.equal(result.marker, true, "marker in wrong fragment or missing");
      assert.equal(result.other, false, "another fragment was marked");
      assert.equal(result.markedLines, scenario === "multiple-lines" ? 2 : 1);
      assert.deepEqual(result.marked, saved.expected, "wrong code range");
      assert.equal(result.source, true);
      await page.evaluate(scenario => {
        if (scenario === "second-fragment") {
          const segment = document.querySelectorAll('#map .seg[data-block="38"]')[1];
          segment.after(segment.cloneNode(true));
        } else {
          const mark = document.querySelector('mark[data-annotation="0"]');
          [...mark.childNodes].find(node => node.nodeType === Node.TEXT_NODE).data += " changed";
        }
      }, scenario);
      await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
      assert.equal(await page.locator('mark[data-annotation="0"] .annotation-marker').count(), 0, "stale or duplicate marker remains");
      const preserved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).passages[0], saved.key);
      assert.equal(preserved.quote, saved.quote);
      assert.equal(preserved.note, `note ${scenario}`);
      console.log(`PASS ${scenario}`);
    } catch (error) {
      failures++; console.error(`FAIL ${scenario}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
