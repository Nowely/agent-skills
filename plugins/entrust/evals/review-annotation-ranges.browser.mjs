// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs CHROME_FOR_TESTING=/path/to/chrome \
//   node review-annotation-ranges.browser.mjs /path/to/rendered-review.html
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const { chromium } = await import(process.env.PLAYWRIGHT_CORE || "playwright-core");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_FOR_TESTING });
const url = pathToFileURL(process.argv[2]).href;
let failures = 0;
try {
  for (const scenario of ["multi-field", "qwhere-second-fragment", "qwhere-changed-clone", "qwhere-duplicate-owner"]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url);
      await page.locator('#tab-decisions').click();
      if (scenario.startsWith("qwhere-")) {
        await page.evaluate(() => { document.querySelector('#q4 .qwhere').open = true; });
        await page.waitForSelector('#q4 .qwhere .seg[data-block="38"]:nth-of-type(2)');
        await page.evaluate(() => { document.querySelectorAll('#q4 .qwhere .seg[data-block="38"] details').forEach(d => d.open = true); });
      }
      const saved = await page.evaluate((scenario) => {
        const text = (el) => {
          const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          while (w.nextNode()) if (w.currentNode.data.trim() && !w.currentNode.parentElement.closest('button,input,textarea,nav,.bar,.l > b,.l > i')) return w.currentNode;
          throw Error('no selectable text');
        };
        let first, last;
        if (scenario === "multi-field") {
          const fields = [...document.querySelectorAll('#q4 [data-ann-field]')].filter(el => el.textContent.trim());
          if (fields.length < 2) throw Error('need two fields in Q4');
          first = text(fields[0]); last = text(fields[1]);
        } else {
          const segs = [...document.querySelectorAll('#q4 .qwhere .seg[data-block="38"]')];
          if (segs.length !== 2) throw Error(`expected two B38 segments, got ${segs.length}`);
          first = last = text(segs[1].querySelector('.l'));
        }
        const range = document.createRange();
        const start = first.data.search(/\S/), end = last === first ? Math.min(last.length, start + 12) : Math.min(last.length, 12);
        range.setStart(first, start); range.setEnd(last, end);
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
        const quote = selection.toString();
        const scope = scenario === "multi-field" ? document.querySelector("#q4") : first.parentElement.closest(".qwhere");
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        let markedText = "";
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node.parentElement.closest('button,input,textarea,nav,.bar,#decisions,footer,.annotation-marker,.l > b,.l > i')
            || !node.parentElement.checkVisibility()
            || (scenario === "multi-field" && node.parentElement.closest('.qwhere,.card-comment,.block-comment,.segmeta,[data-qstatus],[data-fstatus],.na-badge,[data-qgate],[data-qdraft],.requires-content'))
            || !range.intersectsNode(node) || range.comparePoint(node, 0) === 1 || range.comparePoint(node, node.length) === -1) continue;
          markedText += node.data.slice(node === first ? start : 0, node === last ? end : node.length);
        }
        document.dispatchEvent(new Event("selectionchange"));
        document.querySelector('#comment').click();
        const editor = document.querySelector('#annotation-editor');
        if (!editor.open) throw Error(`editor did not open; quote=${JSON.stringify(quote)} node=${JSON.stringify(first.data)}`);
        editor.querySelector('textarea').value = `note ${scenario}`;
        editor.querySelector('[data-annotation-action="save"]').click();
        const key = 'review-report:current:' + JSON.parse(document.querySelector('#data').textContent).key;
        return { quote, markedText, key, proof: JSON.parse(localStorage.getItem(key)).passages[0].proof };
      }, scenario);
      assert.equal(saved.proof?.kind, scenario === "multi-field" ? "range" : "related-code");
      await page.reload();
      if (scenario.startsWith("qwhere-")) {
        await page.evaluate(() => { document.querySelector('#q4 .qwhere').open = true; });
        await page.waitForSelector('#q4 .qwhere .seg[data-block="38"]:nth-of-type(2)');
      }
      const result = await page.evaluate(({scenario, saved}) => {
        const p = JSON.parse(localStorage.getItem(saved.key)).passages[0];
        const marker = document.querySelector('mark[data-annotation="0"] .annotation-marker');
        const segs = [...document.querySelectorAll('#q4 .qwhere .seg[data-block="38"]')];
        const source = document.querySelector('#passages [data-annotation-source]');
        const marked = [...document.querySelectorAll('mark[data-annotation="0"]')].map(mark =>
          [...mark.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.data).join('')).join('');
        return { quote: p.quote, note: p.note, marked, located: !!marker, correct: scenario === "multi-field" ? !!marker?.closest('#q4') : !!marker && segs[1]?.contains(marker), source: !!source };
      }, { scenario, saved });
      assert.equal(result.quote, saved.quote, 'saved quote');
      assert.equal(result.note, `note ${scenario}`, 'saved note');
      assert.equal(result.located, true, `marker missing after reload (proof kind: ${saved.proof?.kind})`);
      assert.equal(result.correct, true, 'marker in wrong area');
      assert.equal(result.marked, saved.markedText, 'highlight differs from selected DOM text');
      assert.equal(result.source, true, 'go-to missing');
      await page.locator('#passages [data-annotation-source]').evaluate(button => button.click());
      await page.waitForFunction(() => document.activeElement?.matches('.annotation-marker'));
      if (scenario.startsWith("qwhere-")) {
        await page.evaluate(() => {
          const unit = document.querySelector('#q4').closest('.dunit');
          document.querySelector('#group-settled .dgroup-body').append(unit);
        });
        await page.waitForFunction(() => !!document.querySelector('#passages [data-annotation-source]'));
        if (scenario === "qwhere-changed-clone") {
          await page.evaluate(() => { document.querySelector('#q4 .qwhere .seg[data-block="38"]').dataset.block = 'changed'; });
        } else if (scenario === "qwhere-duplicate-owner") {
          await page.evaluate(() => {
            const details = document.querySelector('#q4 .qwhere[data-qwhere]');
            details.after(details.cloneNode(true));
          });
        }
      }
      if (scenario === "qwhere-changed-clone" || scenario === "qwhere-duplicate-owner") {
        await page.waitForFunction(() => !document.querySelector('#passages [data-annotation-source]'));
        assert.equal(await page.locator('mark[data-annotation="0"] .annotation-marker').count(), 0, 'stale marker remains');
        const preserved = await page.evaluate(({ key }) => JSON.parse(localStorage.getItem(key)).passages[0], saved);
        assert.equal(preserved.quote, saved.quote, 'mutation lost quote');
        assert.equal(preserved.note, `note ${scenario}`, 'mutation lost note');
        console.log(`PASS ${scenario}`);
        continue;
      }
      await page.evaluate(({ quote }) => {
        const mark = document.querySelector('mark[data-annotation="0"]');
        const node = [...mark.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.data.length);
        node.data = 'changed-source';
        const other = document.createElement('span');
        other.textContent = quote;
        document.querySelector('#q3').append(other);
      }, saved);
      await page.waitForFunction(() => !document.querySelector('#passages [data-annotation-source]'));
      const preserved = await page.evaluate(({ key }) => JSON.parse(localStorage.getItem(key)).passages[0], saved);
      assert.equal(preserved.quote, saved.quote, 'mutation lost quote');
      assert.equal(preserved.note, `note ${scenario}`, 'mutation lost note');
      console.log(`PASS ${scenario}`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${scenario}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
