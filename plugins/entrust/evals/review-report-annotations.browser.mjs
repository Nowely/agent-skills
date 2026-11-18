#!/usr/bin/env node
// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs CHROME_FOR_TESTING=/path/to/chrome \
//   node review-report-annotations.browser.mjs before.html [after.html]
// A cross-version check requires HTML rendered from the same record by each version.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [before, after = before] = process.argv.slice(2);
if (!before) throw new Error("Pass the old and, optionally, the new rendered HTML");
const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_FOR_TESTING ? { executablePath: process.env.CHROME_FOR_TESTING } : {}) });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(before)).href);
  const selectors = ["#f1 .card-title", '[id^="source-"]'];
  for (const [index, selector] of selectors.entries()) {
    if (index === 1) await page.locator("#tab-checks").click();
    await page.evaluate(({ selector, index }) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing annotation target ${selector}`);
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while (walker.nextNode()) {
        if (walker.currentNode.data.trim().length > 16 && !walker.currentNode.parentElement.closest("button,input,textarea,nav,.bar,#decisions,footer,.annotation-marker,.l > b,.l > i")) {
          node = walker.currentNode;
          break;
        }
      }
      if (!node) throw new Error(`No annotatable text in ${selector}`);
      const range = document.createRange();
      range.setStart(node, 2); range.setEnd(node, 14);
      getSelection().removeAllRanges(); getSelection().addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
      document.getElementById("comment").click();
      const editor = document.getElementById("annotation-editor");
      if (!editor.open) throw new Error(`Annotation editor did not open for ${selector}`);
      editor.querySelector("textarea").value = `saved note ${index}`;
      editor.querySelector('[data-annotation-action="save"]').click();
    }, { selector, index });
  }
  const saved = await page.evaluate(() => {
    const data = JSON.parse(document.getElementById("data").textContent), key = "review-report:" + data.key;
    return { key, value: localStorage.getItem(key), document: data.annotationDocument };
  });
  const passages = JSON.parse(saved.value).passages;
  assert.equal(passages.length, selectors.length);
  assert.equal(passages[0].anchor.id, "f1");
  assert.match(passages[1].anchor.id, /^source-\d+$/);
  assert.ok(passages.every((p) => p.anchor.end > p.anchor.start && p.anchor.text));
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), saved);
  await page.goto(pathToFileURL(path.resolve(after)).href);
  const sameDocument = saved.document === await page.evaluate(() => JSON.parse(document.getElementById("data").textContent).annotationDocument);
  const checkRestored = async () => {
    const restored = await page.evaluate(() => {
      const key = "review-report:" + JSON.parse(document.getElementById("data").textContent).key;
      const passages = JSON.parse(localStorage.getItem(key)).passages;
      return passages.map((p, index) => {
        const marks = [...document.querySelectorAll(`mark[data-annotation="${index}"]`)];
        const anchor = document.getElementById(p.anchor.id);
        return {
          anchor: p.anchor,
          note: p.note,
          marked: marks.map((mark) => [...mark.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.data).join("")).join(""),
          insideAnchor: !!anchor && marks.length > 0 && marks.every((mark) => anchor.contains(mark)),
          sourceAction: !!document.querySelectorAll("#passages .passage")[index]?.querySelectorAll("button")[1]
        };
      });
    });
    assert.equal(restored.length, passages.length);
    for (const [index, item] of restored.entries()) {
      assert.deepEqual(item.anchor, passages[index].anchor);
      assert.equal(item.note, passages[index].note);
      assert.equal(item.marked, sameDocument ? item.anchor.text : "");
      assert.equal(item.insideAnchor, sameDocument);
      assert.equal(item.sourceAction, sameDocument);
    }
  };
  await checkRestored();
  for (const [index, passage] of (sameDocument ? passages : []).entries()) {
    await page.locator("#tab-materials").click();
    await page.locator("#passages .passage").nth(index).locator("button").nth(1).click();
    await page.waitForFunction(({ id, index }) => {
      const anchor = document.getElementById(id);
      const marker = document.querySelector(`mark[data-annotation="${index}"] .annotation-marker`);
      const panel = anchor?.closest(".panel");
      return !!marker && anchor.contains(marker) && document.activeElement === marker && panel && !panel.hidden;
    }, { id: passage.anchor.id, index });
  }
  await page.evaluate(() => { window.testFindingNode = document.getElementById("f1"); });
  await page.locator('#f1 button[value="apply"]').evaluate((button) => button.click());
  const settled = await page.evaluate(() => {
    const key = "review-report:" + JSON.parse(document.getElementById("data").textContent).key;
    const finding = document.getElementById("f1");
    return { sameNode: finding === window.testFindingNode, inSettled: !!finding.closest("#group-settled"), choice: JSON.parse(localStorage.getItem(key)).findings["1"] };
  });
  assert.deepEqual(settled, { sameNode: true, inSettled: true, choice: "apply" });
  await checkRestored();
  const linked = await page.evaluate(() => {
    const blocks = JSON.parse(document.getElementById("data").textContent).blocks;
    const unit = blocks.find((block) => block.unit && block.serves?.length);
    return {
      q: blocks.find((block) => block.questions?.length)?.questions[0],
      f: blocks.find((block) => block.findings?.length)?.findings[0],
      req: unit?.serves[0], block: unit?.id
    };
  });
  assert.ok(linked.q && linked.f && linked.req && linked.block, "fixture must have related Q/F/T blocks and a unit");
  for (const [kind, id] of [["q", linked.q], ["f", linked.f], ["req", linked.req]]) {
    await page.evaluate((hash) => { location.hash = hash; }, `#${kind}${id}-code`);
    await page.waitForFunction(([kind, id]) => document.getElementById("map").dataset[kind] === String(id), [kind, id]);
    const state = await page.evaluate(() => {
      const map = document.getElementById("map");
      return { mode: map.dataset.show, active: document.querySelector('.tabs [aria-selected="true"]')?.dataset.tab };
    });
    assert.deepEqual(state, { mode: "all", active: "code" });
  }
  await page.locator('[data-navigation-view="units"]').click();
  const unitButton = page.locator(`#unit-tree [data-unit-block="${linked.block}"]`);
  await unitButton.evaluate((button) => { button.closest("details").open = true; button.click(); });
  await page.waitForFunction((id) => document.activeElement?.id === `b${id}`, linked.block);
  assert.equal(await page.locator(`#map #b${linked.block}`).count(), 1);
  assert.equal(await page.locator(`#b${linked.block} .segcode`).evaluate((el) => el.open), true);
  assert.equal(await page.locator("#map").evaluate((el) => el.dataset.req), String(linked.req));
  await page.evaluate((id) => { location.hash = `#b${id}`; }, linked.block);
  await page.waitForFunction((id) => document.activeElement?.id === `b${id}` && !document.getElementById("map").dataset.req, linked.block);
  await checkRestored();
  assert.deepEqual(errors, []);
  const differentHtml = !fs.readFileSync(before).equals(fs.readFileSync(after));
  console.log(`${differentHtml ? "Different HTML files" : "Same HTML content"}: ${sameDocument ? "restored verified markers and source actions" : "preserved notes without markers or source actions"}. Decision and Q/F/T, unit and block navigation preserve annotations.`);
  await context.close();
} finally {
  await browser.close();
}
