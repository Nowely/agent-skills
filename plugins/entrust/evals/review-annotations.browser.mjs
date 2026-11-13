// Run with the Playwright browser tool on a generated Russian report with at least two mechanisms.
// The report's prior local state is restored even if a check fails; no app/source code is executed.
async (page) => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const key = await page.evaluate(() => 'review-report:' + JSON.parse(document.querySelector('#data').textContent).key);
  const original = await page.evaluate(k => localStorage.getItem(k), key);
  const checks = [];
  const state = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), key);
  const select = async (selector, partial = false) => {
    const result = await page.evaluate(({selector, partial}) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const el = document.querySelector(selector);
      for (let parent = el.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
      if (el.matches('article.mechanism')) el.querySelectorAll('details').forEach(details => { details.open = true; });
      el.scrollIntoView({block:'center'});
      const range = document.createRange(); range.selectNodeContents(el);
      if (partial) { const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let node; do { node = walker.nextNode(); } while (node && !node.length); range.setStart(node, 0); range.setEnd(node, Math.min(12,node.length)); }
      getSelection().removeAllRanges(); getSelection().addRange(range);
      return {quote:getSelection().toString(),y:scrollY};
    }, {selector,partial});
    await page.locator('#comment.on').waitFor(); return result;
  };
  const action = name => page.locator('[data-annotation-action="'+name+'"]').click();
  try {
    await page.evaluate(k => localStorage.removeItem(k), key); await page.reload();
    const card = page.locator('#m1 > details');
    assert(!(await card.evaluate(el => el.open)) && await page.locator('#m1 .mechanism-decision').isVisible() && await page.locator('#m1 .mechanism-tradeoff').isHidden(), 'Card did not start collapsed with its summary visible');
    await card.locator(':scope > summary').click(); assert(await card.evaluate(el => el.open) && await page.locator('#m1 .mechanism-tradeoff').isVisible(), 'Card did not open');
    await card.locator(':scope > summary').click(); assert(!(await card.evaluate(el => el.open)), 'Card did not close'); checks.push('collapsed card and toggle');
    const first = await select('#m1 .mechanism-decision');
    await page.locator('#comment').click();
    assert(Math.abs(await page.evaluate(()=>scrollY)-first.y)<2,'Opening editor scrolled away');
    await page.locator('#annotation-editor textarea').fill('discard me'); await action('cancel');
    assert(!(await state()).passages?.length,'Cancel created a saved passage'); checks.push('create cancel without scroll');
    await select('#m1 .mechanism-decision'); await page.keyboard.press('Alt+Shift+KeyM');
    await page.locator('#annotation-editor textarea').fill('First note'); await action('save');
    assert((await state()).passages[0].quote===first.quote,'Quote changed');
    await page.reload(); assert(await page.locator('#m1 mark').count()>0,'Reload lost highlight');
    const markerBounds = await page.locator('#m1 .annotation-marker').boundingBox(); assert(markerBounds.width >= 24 && markerBounds.height >= 24, 'Annotation marker hit target is too small'); checks.push('annotation marker hit target');
    await page.locator('#m1 .annotation-marker').click(); await page.locator('#annotation-editor textarea').fill('discard edit'); await page.keyboard.press('Escape');
    assert((await state()).passages[0].note==='First note','Cancel edit changed saved text'); checks.push('keyboard create, restore, edit cancel');
    await page.locator('#m1 .annotation-marker').click(); await action('delete');
    assert((await state()).passages.length===0,'Delete kept passage'); await page.locator('#annotation-undo').click();
    assert((await state()).passages[0].note==='First note','Undo lost text'); checks.push('delete and undo');
    await page.locator('#annotation-dismiss').focus(); await page.keyboard.press('Enter');
    assert(await page.locator('.annotation-feedback').isHidden() && await page.locator('#annotation-status').textContent()==='', 'Keyboard dismissal kept feedback'); checks.push('keyboard dismiss feedback');
    for(const id of ['m1','m2']) {await select('#'+id+' .group.sub span');await page.locator('#comment').click();await page.locator('#annotation-editor textarea').fill(id);await action('save');}
    const duplicates=(await state()).passages.slice(-2);assert(duplicates[0].quote===duplicates[1].quote && duplicates[0].anchor.id!==duplicates[1].anchor.id,'Duplicate quote anchors collide');
    await card.evaluate(el => { el.open = false; }); await page.locator('#passages .passage').nth(1).locator('button').nth(1).click();
    assert(await card.evaluate(el => el.open) && await page.locator('#m1 .group.sub .annotation-marker').isVisible(), 'Back link did not open the card'); checks.push('back link opens card');
    await page.reload();assert(await page.locator('#m2 .annotation-marker').count()===1,'Second quote restored to wrong card');checks.push('duplicate quote identity');
    const short=await select('#m1 .group.sub span',true);await page.locator('#comment').click();await action('save');assert((await state()).passages.at(-1).quote===short.quote && short.quote.length===12,'Partial selection changed');checks.push('short partial quote');
    const long=await select('#m1');assert(long.quote.length>400,'Fixture is too short');await page.locator('#comment').click();await action('save');
    const full=(await state()).passages.at(-1);assert(full.quote===long.quote,'Long quote was truncated');assert((await page.locator('#out').inputValue()).includes(full.quote),'Export lost full quote');checks.push('overlap and full long export');
    const saved=JSON.stringify(await state());await page.evaluate(()=>{window.testConfirm=window.confirm;window.confirm=()=>false;});await page.locator('#clear').click();await page.evaluate(()=>{window.confirm=window.testConfirm;delete window.testConfirm;});assert(JSON.stringify(await state())===saved,'Cancelled reset erased notes');checks.push('clear-all cancellation');
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'Report overflows narrow viewport');
    assert(await page.locator('.seg .l').first().evaluate(el => getComputedStyle(el).whiteSpace === 'pre'), 'Diff whitespace no longer preserved');
    await select('#m2 .mechanism-decision');await page.locator('#comment').click();
    const bounds=await page.locator('#annotation-editor').boundingBox();assert(bounds.x>=0 && bounds.x+bounds.width<=391,'Editor overflows narrow viewport');await action('cancel');checks.push('narrow report and editor');
    await page.setViewportSize({width:1728,height:912});
    const code=await select('.seg pre code');await page.locator('#comment').click();await action('save');
    const codeNote=(await state()).passages.at(-1);assert(codeNote.where.includes('.js:') && codeNote.quote===code.quote,'Code location or whitespace lost');checks.push('code range and quote');
    await page.locator('#m1 .annotation-marker').first().click();await action('delete');
    const feedback=page.locator('.annotation-feedback'), undo=page.locator('#annotation-undo');
    await feedback.hover();await page.waitForTimeout(8500);assert(await undo.isVisible(),'Hover did not pause dismissal');
    await undo.focus();await page.mouse.move(0,0);await page.waitForTimeout(8500);assert(await undo.isVisible(),'Focus did not pause dismissal');
    await undo.evaluate(el=>el.blur());await feedback.waitFor({state:'hidden',timeout:9500});
    assert(await undo.isHidden() && await page.locator('#annotation-status').textContent()==='','Expired feedback kept message or undo');checks.push('notification idle expiry and hover/focus pause');
    await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({findings:{},notes:{},passages:[{where:'Old section',quote:'old full quote',note:'legacy note'}]})),key);await page.reload();
    assert((await page.locator('#passages').innerText()).includes('legacy note') && await page.locator('mark[data-annotation]').count()===0,'Legacy note lost or guessed');
    await page.locator('#passages button').first().click();await page.locator('#annotation-editor textarea').fill('updated legacy');await action('save');
    assert((await state()).passages[0].note==='updated legacy','Legacy note cannot be edited');checks.push('legacy note preservation');
    return {passed:checks};
  } catch (error) { throw new Error(error.message + "; completed: " + checks.join(", "));
  } finally {
    await page.evaluate(({key,original})=>{if(original===null)localStorage.removeItem(key);else localStorage.setItem(key,original);},{key,original});
    await page.setViewportSize({width:1728,height:912});await page.reload();
  }
}
