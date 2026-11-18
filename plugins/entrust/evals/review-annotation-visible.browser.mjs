// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs CHROME_FOR_TESTING=/path/to/chrome \
//   node review-annotation-visible.browser.mjs /path/to/rendered-65507.html
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE || "playwright-core");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_FOR_TESTING });
const url = pathToFileURL(process.argv[2]).href;
let failures = 0;
try {
  for (const scenario of ["visible-fields", "between-owners", "between-owners-settled", "between-owners-duplicate", "between-owners-hidden-lazy"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.locator("#tab-decisions").click();
      if (scenario === "between-owners-hidden-lazy") {
        await page.evaluate(() => { document.querySelector("#q4 .qwhere").open = true; });
        await page.waitForSelector('#q4 .qwhere .seg[data-block="35"]');
      }
      await page.evaluate(() => {
        const first = document.querySelector('#q4 [data-ann-field="context.0.text"]');
        for (let el = first.parentElement; el; el = el.parentElement) if (el.tagName === "DETAILS") el.open = true;
      });
      await page.locator('#q4 [data-ann-field="context.0.text"]').scrollIntoViewIfNeeded();
      if (scenario.startsWith("between-owners")) {
        await page.evaluate(() => { document.querySelectorAll("#q4 details").forEach(details => { details.open = false; }); });
        await page.locator('#q4 [data-ann-field="text"]').scrollIntoViewIfNeeded();
      }
      const selectors = scenario === "visible-fields"
        ? ['#q4 [data-ann-field="context.0.text"]', '#q4 [data-ann-field="context.1.text"]']
        : ['#q4 [data-ann-field="text"]', '#q5 [data-ann-field="text"]'];
      const points = await page.evaluate((selectors) => selectors.map((selector, i) => {
        const el = document.querySelector(selector), node = el.firstChild;
        const range = document.createRange(), offset = i ? 10 : 2;
        range.setStart(node, offset); range.setEnd(node, offset + 1);
        const rect = range.getBoundingClientRect(), x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
        if (document.elementFromPoint(x, y) !== el) throw Error(`field is not visible at ${selector}`);
        return { x, y };
      }), selectors);
      await page.mouse.click(points[0].x, points[0].y);
      await page.keyboard.down("Shift");
      await page.mouse.click(points[1].x, points[1].y);
      await page.keyboard.up("Shift");
      const saved = await page.evaluate(({ scenario, selectors }) => {
        const selection = getSelection(), range = selection.getRangeAt(0);
        const first = document.querySelector(selectors[0]), last = document.querySelector(selectors[1]);
        if (!first.contains(range.startContainer) || !last.contains(range.endContainer)) throw Error("mouse selection has wrong endpoints");
        const visibleQuote = selection.toString(), domText = range.toString();
        if (!visibleQuote || !domText) throw Error("empty selection");
        const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
        let hiddenSelected = 0;
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.data.trim() || !range.intersectsNode(node)) continue;
          if (!node.parentElement.checkVisibility()) hiddenSelected++;
        }
        const startText = range.startContainer.data.slice(range.startOffset);
        const endText = range.endContainer.data.slice(0, range.endOffset);
        const intermediate = scenario.startsWith("between-owners") ? document.querySelector("#q4 .qdetail > summary").textContent : "";
        document.dispatchEvent(new Event("selectionchange"));
        document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = `note ${scenario}`;
        editor.querySelector('[data-annotation-action="save"]').click();
        const key = "review-report:" + JSON.parse(document.querySelector("#data").textContent).key;
        const passage = JSON.parse(localStorage.getItem(key)).passages[0];
        return { key, visibleQuote, domText, startText, endText, intermediate, hiddenSelected, proofPresent: !!passage.proof };
      }, { scenario, selectors });
      assert.notEqual(saved.visibleQuote, saved.domText, "fixture should distinguish rendered selection from DOM Range");
      if (scenario.startsWith("between-owners")) assert.ok(saved.hiddenSelected > 0, "fixture must include hidden selected DOM text");
      await page.reload();
      await page.evaluate((scenario) => {
        if (scenario.startsWith("between-owners")) return;
        const first = document.querySelector('#q4 [data-ann-field="context.0.text"]');
        for (let el = first.parentElement; el; el = el.parentElement) if (el.tagName === "DETAILS") el.open = true;
      }, scenario);
      const result = await page.evaluate(({ key, selectors }) => {
        const passage = JSON.parse(localStorage.getItem(key)).passages[0];
        const marks = selector => [...document.querySelectorAll(`${selector} mark[data-annotation="0"]`)]
          .map(mark => [...mark.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data).join("")).join("");
        return { passage, source: !!document.querySelector("#passages [data-annotation-source]"),
          marker: !!document.querySelector('mark[data-annotation="0"] .annotation-marker'),
          first: marks(selectors[0]), last: marks(selectors[1]),
          intermediate: marks("#q4 .qdetail > summary"),
          hiddenMarks: [...document.querySelectorAll('mark[data-annotation="0"]')].filter(mark => mark.textContent.trim() && !mark.checkVisibility()).length };
      }, { key: saved.key, selectors });
      assert.equal(result.passage.quote, saved.visibleQuote, "visible quote");
      assert.equal(result.passage.anchor.text, saved.visibleQuote, "legacy anchor exported hidden DOM text");
      assert.equal(result.passage.note, `note ${scenario}`, "note");
      assert.equal(result.marker, true, `marker missing after reload (proof saved: ${saved.proofPresent})`);
      assert.equal(result.first, saved.startText, "wrong start highlight");
      assert.equal(result.last, saved.endText, "wrong end highlight");
      if (saved.intermediate) assert.equal(result.intermediate, saved.intermediate, "visible intermediate text was not highlighted");
      assert.equal(result.hiddenMarks, 0, "hidden DOM text was highlighted");
      assert.equal(result.source, true, "go-to missing");
      if (scenario.startsWith("between-owners")) {
        const hiddenMarks = await page.evaluate(() => {
          const details = document.querySelector("#q4 .qdetail");
          details.open = true;
          const summary = details.querySelector(":scope > summary");
          return [...details.querySelectorAll('mark[data-annotation="0"]')].filter(mark => !summary.contains(mark)).length;
        });
        assert.equal(hiddenMarks, 0, "opening a disclosure expanded the original highlight");
      }
      await page.locator("#passages [data-annotation-source]").evaluate(button => button.click());
      await page.waitForFunction(() => document.activeElement?.matches(".annotation-marker"));
      if (scenario === "between-owners-hidden-lazy") {
        assert.equal(result.passage.proof.where.length, 1, "hidden built clone was not bound");
        await page.evaluate(() => {
          const node = document.querySelector('#q4 .qwhere .seg[data-block="35"] .segcode pre .l span').firstChild;
          node.data += " changed";
        });
        await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
        const preserved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).passages[0], saved.key);
        assert.equal(preserved.quote, saved.visibleQuote);
        console.log(`PASS ${scenario}`);
        continue;
      }
      if (scenario === "between-owners-duplicate") {
        await page.evaluate(() => {
          const owner = document.querySelector("#q4");
          owner.after(owner.cloneNode(true));
        });
        await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
        assert.equal(await page.locator('mark[data-annotation="0"] .annotation-marker').count(), 0, "duplicate owner left a marker");
        const preserved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).passages[0], saved.key);
        assert.equal(preserved.quote, saved.visibleQuote);
        assert.equal(preserved.note, `note ${scenario}`);
        console.log(`PASS ${scenario}`);
        continue;
      }
      if (scenario === "visible-fields" || scenario === "between-owners-settled") {
        await page.evaluate(() => {
          document.querySelector("#group-settled .dgroup-body").append(document.querySelector("#q4").closest(".dunit"));
        });
        if (scenario === "between-owners-settled") {
          await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
          const preserved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).passages[0], saved.key);
          assert.equal(preserved.quote, saved.visibleQuote);
          assert.equal(preserved.note, `note ${scenario}`);
          console.log(`PASS ${scenario}`);
          continue;
        }
        await page.waitForFunction(() => !!document.querySelector("#passages [data-annotation-source]"));
        assert.equal(await page.locator('#q4 mark[data-annotation="0"] .annotation-marker').count(), 1, "same-owner movement lost marker");
      }
      await page.evaluate(() => {
        const mark = document.querySelector('mark[data-annotation="0"]');
        [...mark.childNodes].find(node => node.nodeType === Node.TEXT_NODE).data = "changed-source";
      });
      await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
      const preserved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).passages[0], saved.key);
      assert.equal(preserved.quote, saved.visibleQuote, "mutation lost quote");
      assert.equal(preserved.note, `note ${scenario}`, "mutation lost note");
      console.log(`PASS ${scenario} (${new TextEncoder().encode(JSON.stringify(result.passage.proof)).length} proof bytes)`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${scenario}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(url); await page.locator("#tab-decisions").click();
      await page.evaluate(() => { document.querySelector("#q4 .qwhere").open = true; });
      await page.waitForSelector('#q4 .qwhere .seg[data-block="35"] .does');
      const selectors = ['#q4 [data-ann-field="text"]', '#q4 .qwhere .seg[data-block="35"] .does'];
      await page.locator(selectors[0]).scrollIntoViewIfNeeded();
      const point = async (selector, offset) => page.locator(selector).evaluate((el, offset) => {
        const r = document.createRange(); r.setStart(el.firstChild, offset); r.setEnd(el.firstChild, offset + 1);
        const box = r.getBoundingClientRect(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }, offset);
      const start = await point(selectors[0], 2);
      await page.mouse.click(start.x, start.y);
      await page.locator(selectors[1]).scrollIntoViewIfNeeded();
      const end = await point(selectors[1], 10);
      await page.keyboard.down("Shift"); await page.mouse.click(end.x, end.y); await page.keyboard.up("Shift");
      const saved = await page.evaluate(selectors => {
        const selection = getSelection(), range = selection.getRangeAt(0);
        if (!document.querySelector(selectors[0]).contains(range.startContainer)
          || !document.querySelector(selectors[1]).contains(range.endContainer)) throw Error("wrong selection endpoints");
        const quote = selection.toString();
        document.dispatchEvent(new Event("selectionchange")); document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = "crosses lazy body";
        editor.querySelector('[data-annotation-action="save"]').click();
        const key = "review-report:" + JSON.parse(document.querySelector("#data").textContent).key;
        return { key, quote, passage: JSON.parse(localStorage.getItem(key)).passages[0] };
      }, selectors);
      assert.equal(saved.passage.proof, undefined, "unproven cross-boundary lazy body must not be marked");
      assert.equal(saved.passage.anchor.text, saved.quote, "unlocated note exported hidden DOM text");
      await page.reload();
      const restored = await page.evaluate(key => ({
        passage: JSON.parse(localStorage.getItem(key)).passages[0],
        marker: !!document.querySelector('mark[data-annotation="0"] .annotation-marker')
      }), saved.key);
      assert.equal(restored.passage.quote, saved.quote);
      assert.equal(restored.passage.note, "crosses lazy body");
      assert.equal(restored.marker, false);
      console.log("PASS unproven-cross-lazy");
    } catch (error) {
      failures++; console.error(`FAIL unproven-cross-lazy: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.locator("#tab-decisions").click();
      await page.evaluate(() => { document.querySelector("#q4 .qwhere").open = true; });
      await page.waitForSelector('#q4 .qwhere .seg[data-block="38"]');
      const selectors = ['#q4 .qwhere .seg[data-block="35"] .does', '#q4 .qwhere .seg[data-block="38"] .does'];
      await page.locator(selectors[0]).scrollIntoViewIfNeeded();
      const points = await page.evaluate(selectors => selectors.map((selector, i) => {
        const node = document.querySelector(selector).firstChild, range = document.createRange();
        range.setStart(node, i ? 10 : 2); range.setEnd(node, i ? 11 : 3);
        const r = range.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }), selectors);
      await page.mouse.click(points[0].x, points[0].y);
      await page.keyboard.down("Shift"); await page.mouse.click(points[1].x, points[1].y); await page.keyboard.up("Shift");
      const saved = await page.evaluate(selectors => {
        const selection = getSelection(), range = selection.getRangeAt(0);
        if (!document.querySelector(selectors[0]).contains(range.startContainer)
          || !document.querySelector(selectors[1]).contains(range.endContainer)) throw Error("wrong selection endpoints");
        if (document.querySelector('#q4 .qwhere .seg[data-block="35"] .segcode').open) throw Error("segment must be closed");
        const quote = selection.toString(), start = range.startContainer.data.slice(range.startOffset), end = range.endContainer.data.slice(0, range.endOffset);
        document.dispatchEvent(new Event("selectionchange")); document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = "hidden qwhere";
        editor.querySelector('[data-annotation-action="save"]').click();
        return { quote, start, end, key: "review-report:" + JSON.parse(document.querySelector("#data").textContent).key };
      }, selectors);
      await page.reload();
      await page.evaluate(() => { document.querySelector("#q4 .qwhere").open = true; });
      await page.waitForSelector('#q4 .qwhere .seg[data-block="38"]');
      const result = await page.evaluate(({ selectors, key }) => {
        const text = selector => [...document.querySelectorAll(`${selector} mark[data-annotation="0"]`)]
          .map(mark => [...mark.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data).join("")).join("");
        return { start: text(selectors[0]), end: text(selectors[1]),
          hidden: document.querySelectorAll('#q4 .qwhere .seg[data-block="35"] .segcode pre mark[data-annotation="0"]').length,
          passage: JSON.parse(localStorage.getItem(key)).passages[0], source: !!document.querySelector("#passages [data-annotation-source]") };
      }, { selectors, key: saved.key });
      assert.equal(result.passage.quote, saved.quote);
      assert.equal(result.start, saved.start); assert.equal(result.end, saved.end);
      assert.equal(result.hidden, 0, "closed code was marked"); assert.equal(result.source, true);
      await page.evaluate(() => { document.querySelector('#q4 .qwhere .seg[data-block="35"] .segcode').open = true; });
      assert.equal(await page.locator('#q4 .qwhere .seg[data-block="35"] .segcode pre mark[data-annotation="0"]').count(), 0,
        "opening code expanded the original highlight");
      await page.evaluate(() => {
        const node = document.querySelector('#q4 .qwhere .seg[data-block="35"] .segcode pre .l span').firstChild;
        node.data += " changed";
      });
      await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
      console.log("PASS qwhere-hidden-range");
    } catch (error) {
      failures++; console.error(`FAIL qwhere-hidden-range: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.locator("#tab-decisions").click();
      await page.evaluate(() => { document.querySelector("#q4 .qwhere").open = true; });
      await page.waitForSelector('#q4 .qwhere .seg[data-block="38"]:nth-of-type(2)');
      await page.evaluate(() => {
        const segment = document.querySelectorAll('#q4 .qwhere .seg[data-block="38"]')[1];
        segment.querySelectorAll("details").forEach(details => { details.open = true; });
        const walker = document.createTreeWalker(segment.querySelector(".l"), NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) if (walker.currentNode.data.trim() && !walker.currentNode.parentElement.closest(".l > b,.l > i")) break;
        const node = walker.currentNode, start = node.data.search(/\S/), range = document.createRange();
        range.setStart(node, start); range.setEnd(node, Math.min(node.length, start + 12));
        getSelection().removeAllRanges(); getSelection().addRange(range);
        document.dispatchEvent(new Event("selectionchange"));
        document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = "size test";
        editor.querySelector('[data-annotation-action="save"]').click();
      });
      const size = await page.evaluate(() => {
        const key = "review-report:" + JSON.parse(document.querySelector("#data").textContent).key;
        const proof = JSON.parse(localStorage.getItem(key)).passages[0].proof;
        if (!proof) throw Error("proof missing");
        return new TextEncoder().encode(JSON.stringify(proof)).length;
      });
      assert.ok(size <= 8192, `one proof is ${size} UTF-8 bytes (budget 8192)`);
      console.log(`PASS proof-size-qwhere (${size} bytes)`);
    } catch (error) {
      failures++;
      console.error(`FAIL proof-size-qwhere: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
