// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs CHROME_FOR_TESTING=/path/to/chrome \
//   node review-annotation-static.browser.mjs /path/to/rendered-review.html
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE || "playwright-core");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_FOR_TESTING });
const url = pathToFileURL(process.argv[2]).href;
let failures = 0;
try {
  for (const [name, tab, selector] of [
    ["requirement", "checks", "#requirements tr[data-where] td:nth-child(2)"],
    ["identity-shift", "checks", "#requirements tr[data-where] td:nth-child(2)"],
    ["mechanism", "overview", "#m1 h3"],
    ["idea", "decisions", "#i1 .card-title"]
  ]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.locator(`#tab-${tab}`).click();
      const saved = await page.evaluate(({ selector, name }) => {
        const target = document.querySelector(selector);
        if (!target) throw Error(`missing ${selector}`);
        for (let el = target; el; el = el.parentElement) if (el.tagName === "DETAILS") el.open = true;
        const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) if (walker.currentNode.data.trim().length > 16) break;
        const node = walker.currentNode, from = node.data.search(/\S/), to = Math.min(node.length, from + 12);
        const range = document.createRange(); range.setStart(node, from); range.setEnd(node, to);
        getSelection().removeAllRanges(); getSelection().addRange(range);
        const quote = getSelection().toString();
        if (!quote) throw Error("fixture text is hidden");
        document.dispatchEvent(new Event("selectionchange")); document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = `note ${name}`;
        editor.querySelector('[data-annotation-action="save"]').click();
        const key = "review-report:current:" + JSON.parse(document.querySelector("#data").textContent).key;
        return { key, quote };
      }, { selector, name });
      await page.reload();
      const result = await page.evaluate(({ key, selector }) => ({
        passage: JSON.parse(localStorage.getItem(key)).passages[0],
        mark: document.querySelector(selector)?.querySelector('mark[data-annotation="0"]')?.textContent,
        marker: !!document.querySelector(`${selector} mark[data-annotation="0"] .annotation-marker`),
        source: !!document.querySelector('#passages [data-annotation-source]')
      }), { key: saved.key, selector });
      assert.equal(result.passage.quote, saved.quote);
      assert.equal(result.marker, true, "marker not in original target");
      assert.ok(result.mark.startsWith(saved.quote), "wrong selected text");
      assert.equal(result.source, true);
      await page.evaluate(({ quote }) => {
        const decoy = document.createElement("span"); decoy.textContent = quote;
        document.querySelector("#review-content").append(decoy);
      }, saved);
      await page.waitForTimeout(50);
      assert.equal(await page.locator(`${selector} mark[data-annotation="0"] .annotation-marker`).count(), 1, "duplicate text moved marker");
      if (name === "identity-shift") {
        await page.evaluate(() => { document.querySelector("#requirements").before(document.createElement("section")); });
        await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
        assert.equal(await page.locator('mark[data-annotation="0"] .annotation-marker').count(), 0, "shifted anchor retained marker");
        console.log(`PASS ${name}`);
        continue;
      }
      await page.evaluate(() => {
        const mark = document.querySelector('mark[data-annotation="0"]');
        const node = [...mark.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
        window.originalMarkedText = node.data; node.data = "changed-source";
      });
      await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
      const preserved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).passages[0], saved.key);
      assert.equal(preserved.quote, saved.quote);
      assert.equal(preserved.note, `note ${name}`);
      if (name === "requirement") {
        await page.evaluate(() => {
          const mark = document.querySelector('mark[data-annotation="0"]');
          [...mark.childNodes].find(node => node.nodeType === Node.TEXT_NODE).data = window.originalMarkedText;
        });
        assert.equal(await page.locator("#passages [data-annotation-source]").count(), 0, "invalidated marker unexpectedly returned in session");
        await page.reload();
        assert.equal(await page.locator(`${selector} mark[data-annotation="0"] .annotation-marker`).count(), 1, "unchanged source did not revalidate on reload");
      }
      console.log(`PASS ${name} (${new TextEncoder().encode(JSON.stringify(result.passage.proof)).length} proof bytes)`);
    } catch (error) {
      failures++; console.error(`FAIL ${name}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(url); await page.locator("#tab-overview").click();
      await page.locator("#mechanisms h2").scrollIntoViewIfNeeded();
      const points = await page.evaluate(() => ["#mechanisms h2", "#m1 h3"].map((selector, i) => {
        const node = document.querySelector(selector).firstChild, range = document.createRange();
        range.setStart(node, i ? 5 : 1); range.setEnd(node, i ? 6 : 2);
        const rect = range.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }));
      await page.mouse.click(points[0].x, points[0].y);
      await page.keyboard.down("Shift"); await page.mouse.click(points[1].x, points[1].y); await page.keyboard.up("Shift");
      const saved = await page.evaluate(() => {
        const selection = getSelection(), range = selection.getRangeAt(0);
        if (!document.querySelector("#mechanisms h2").contains(range.startContainer) || !document.querySelector("#m1 h3").contains(range.endContainer)) throw Error("wrong selection endpoints");
        const intermediate = document.querySelector("#mechanisms > p.sub").textContent, quote = selection.toString();
        document.dispatchEvent(new Event("selectionchange")); document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = "intermediate";
        editor.querySelector('[data-annotation-action="save"]').click();
        return { intermediate, quote, key: "review-report:current:" + JSON.parse(document.querySelector("#data").textContent).key };
      });
      await page.reload();
      const result = await page.evaluate(key => ({
        passage: JSON.parse(localStorage.getItem(key)).passages[0],
        intermediate: [...document.querySelectorAll('#mechanisms > p.sub mark[data-annotation="0"]')]
          .map(mark => [...mark.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data).join("")).join(""),
        source: !!document.querySelector("#passages [data-annotation-source]")
      }), saved.key);
      assert.equal(result.passage.quote, saved.quote);
      assert.equal(result.intermediate, saved.intermediate, "intermediate non-owner text missing");
      assert.equal(result.source, true, `missing intermediate source, proof kind ${result.passage.proof?.kind}`);
      await page.evaluate(() => {
        const mark = document.querySelector('#mechanisms > p.sub mark[data-annotation="0"]');
        [...mark.childNodes].find(node => node.nodeType === Node.TEXT_NODE).data += " changed";
      });
      await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
      console.log(`PASS intermediate-static (${new TextEncoder().encode(JSON.stringify(result.passage.proof)).length} proof bytes)`);
    } catch (error) {
      failures++; console.error(`FAIL intermediate-static: ${error.message}`);
    } finally {
      await context.close();
    }
  }
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.evaluate(() => { location.hash = "#b38"; });
      await page.waitForSelector("#b38 .l");
      const saved = await page.evaluate(() => {
        const block = document.querySelector("#b38");
        block.querySelectorAll("details").forEach(details => { details.open = true; });
        const walker = document.createTreeWalker(block.querySelector(".l"), NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) if (walker.currentNode.data.trim().length >= 3 && !walker.currentNode.parentElement.closest(".l > b,.l > i")) break;
        const node = walker.currentNode, from = node.data.search(/\S/), to = Math.min(node.length, from + 8);
        const range = document.createRange(); range.setStart(node, from); range.setEnd(node, to);
        getSelection().removeAllRanges(); getSelection().addRange(range);
        const quote = getSelection().toString();
        if (!quote) throw Error("canonical code not visible");
        document.dispatchEvent(new Event("selectionchange")); document.querySelector("#comment").click();
        const editor = document.querySelector("#annotation-editor");
        if (!editor.open) throw Error("editor did not open");
        editor.querySelector("textarea").value = "canonical code";
        editor.querySelector('[data-annotation-action="save"]').click();
        return { quote, key: "review-report:current:" + JSON.parse(document.querySelector("#data").textContent).key };
      });
      await page.reload();
      await page.waitForSelector("#b38 .l");
      await page.waitForFunction(() => !!document.querySelector('#b38 mark[data-annotation="0"] .annotation-marker'));
      const result = await page.evaluate(key => ({
        proof: JSON.parse(localStorage.getItem(key)).passages[0].proof,
        marked: [...document.querySelectorAll('#b38 mark[data-annotation="0"]')].map(mark =>
          [...mark.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data).join("")).join("")
      }), saved.key);
      assert.equal(result.marked, saved.quote);
      assert.equal(result.proof.kind, "field");
      assert.ok(new TextEncoder().encode(JSON.stringify(result.proof)).length < 8192);
      await page.evaluate(() => {
        const mark = document.querySelector('#b38 mark[data-annotation="0"]');
        [...mark.childNodes].find(node => node.nodeType === Node.TEXT_NODE).data += " changed";
      });
      await page.waitForFunction(() => !document.querySelector("#passages [data-annotation-source]"));
      console.log(`PASS canonical-code (${new TextEncoder().encode(JSON.stringify(result.proof)).length} proof bytes)`);
    } catch (error) {
      failures++; console.error(`FAIL canonical-code: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
