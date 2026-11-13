// Embedded in the standalone report; anchors refer to static text, never to inserted controls.
export function annotations({ state, changed, t }) {
  const root = document.getElementById('review-content');
  const list = document.getElementById('passages'), trigger = document.getElementById('comment');
  const editor = document.getElementById('annotation-editor'), field = editor.querySelector('textarea');
  const quote = editor.querySelector('blockquote'), status = document.getElementById('annotation-status');
  let picked = null, draft = null, returnTo = null, deleted = null;
  const feedback = document.querySelector('.annotation-feedback'), undo = document.getElementById('annotation-undo');
  let feedbackTimer;
  function dismissFeedback() {
    clearTimeout(feedbackTimer); status.textContent = ''; undo.hidden = true; deleted = null;
  }
  function scheduleFeedback() {
    clearTimeout(feedbackTimer);
    if (status.textContent && !feedback.matches(':hover, :focus-within')) feedbackTimer = setTimeout(dismissFeedback, 8000);
  }
  function announce(message, withUndo = false) {
    if (!withUndo) deleted = null;
    undo.hidden = !withUndo; status.textContent = message; scheduleFeedback();
  }
  feedback.addEventListener('pointerenter', () => clearTimeout(feedbackTimer));
  feedback.addEventListener('focusin', () => clearTimeout(feedbackTimer));
  feedback.addEventListener('pointerleave', scheduleFeedback);
  feedback.addEventListener('focusout', () => queueMicrotask(scheduleFeedback));
  root.querySelectorAll('section, article, .seg, tr[data-where]').forEach((el, i) => {
    if (!el.id) el.id = 'source-' + i;
    el.dataset.anchor = '';
  });
  const nodes = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n =>
      n.parentElement.closest('button,input,textarea,nav,.bar,#decisions,footer,.annotation-marker,.l > b,.l > i') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const result = []; while (walker.nextNode()) result.push(walker.currentNode); return result;
  };
  function locate(p) {
    const el = p.anchor && document.getElementById(p.anchor.id);
    if (!el) return null;
    const text = nodes(el), full = text.map(n => n.data).join('');
    if (full.slice(p.anchor.start, p.anchor.end) !== (p.anchor.text ?? p.quote)) return null;
    let offset = 0; const parts = [];
    for (const node of text) {
      const start = Math.max(0, p.anchor.start - offset), end = Math.min(node.length, p.anchor.end - offset);
      if (end > start) parts.push({ node, start, end });
      offset += node.length;
    }
    return parts.length ? { el, parts } : null;
  }
  function capture() {
    const selection = getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0), start = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    if (!root.contains(start) || start.closest('#decisions,button,input,textarea')) return null;
    let el = start.closest('[data-anchor]') || root;
    while (el !== root && !el.contains(range.endContainer)) el = el.parentElement.closest('[data-anchor]') || root;
    let offset = 0, from = null, to = 0, firstNode = null, lastNode = null;
    for (const node of nodes(el)) {
      if (range.intersectsNode(node) && range.comparePoint(node, 0) !== 1 && range.comparePoint(node, node.length) !== -1) {
        const a = node === range.startContainer ? range.startOffset : 0, b = node === range.endContainer ? range.endOffset : node.length;
        if (b > a) { if (from === null) from = offset + a; to = offset + b; if (node.data.slice(a, b).trim()) { firstNode ||= node; lastNode = node; } }
      }
      offset += node.length;
    }
    const full = nodes(el).map(n => n.data).join(''), selected = from === null ? '' : full.slice(from, to);
    if (!selected.trim()) return null;
    const lineAt = node => {
      const line = node?.parentElement.closest('.l'), file = line?.closest('.file');
      return file ? file.querySelector('header strong').textContent + ':' + line.querySelector('i').textContent.trim() + line.querySelector('b').textContent.trim() : null;
    };
    const firstLine = lineAt(firstNode), lastLine = lineAt(lastNode), heading = el.querySelector('h2,h3');
    const where = firstLine ? firstLine + (lastLine && lastLine !== firstLine ? ' .. ' + lastLine : '')
      : el.dataset.where || (el !== root && heading ? nodes(heading).map(n => n.data).join('') : t.report);
    return { quote: selection.toString(), where, note: '', anchor: { id: el.id, start: from, end: to, text: selected }, rect: range.getBoundingClientRect() };
  }
  function close() {
    editor.close(); draft = null;
    if (returnTo?.isConnected) { if (!returnTo.matches('button,a[href],input,textarea,[tabindex]')) returnTo.tabIndex = -1; returnTo.focus({ preventScroll: true }); }
  }
  function position(box) {
    editor.style.left = Math.max(8, Math.min(box.left, innerWidth - editor.offsetWidth - 8)) + 'px';
    editor.style.top = Math.max(8, Math.min(box.bottom + 8, innerHeight - editor.offsetHeight - 8)) + 'px';
  }
  window.addEventListener('resize', () => { if (editor.open) position(returnTo.getBoundingClientRect()); });
  function open(p, index = -1, source = null) {
    const location = locate(p), el = source || location?.el || trigger;
    returnTo = el; draft = { ...p, index }; field.value = p.note || ''; quote.textContent = p.quote;
    editor.querySelector('[data-annotation-action="delete"]').hidden = index < 0;
    trigger.classList.remove('on');
    if (!editor.open) editor.show();
    position(p.rect || el.getBoundingClientRect());
    field.focus({ preventScroll: true });
  }
  function render() {
    root.querySelectorAll('.annotation-marker').forEach(el => el.remove());
    root.querySelectorAll('mark[data-annotation]').forEach(el => el.replaceWith(...el.childNodes));
    root.normalize(); list.replaceChildren();
    state().passages.forEach((p, index) => {
      const found = locate(p); let marker;
      if (found) {
        for (const { node, start, end } of [...found.parts].reverse()) {
          const range = document.createRange(); range.setStart(node, start); range.setEnd(node, end);
          const mark = document.createElement('mark'); mark.dataset.annotation = index; range.surroundContents(mark);
        }
        marker = document.createElement('button'); marker.type = 'button'; marker.className = 'annotation-marker';
        marker.textContent = index + 1; marker.setAttribute('aria-label', t.annotation + ' ' + (index + 1));
        marker.addEventListener('click', () => open(p, index, marker));
        const marks = root.querySelectorAll('mark[data-annotation="' + index + '"]'); marks[marks.length - 1].append(marker);
      }
      const row = document.createElement('article'); row.className = 'passage';
      const title = document.createElement('strong'); title.textContent = t.annotation + ' ' + (index + 1) + ' · ' + p.where;
      const excerpt = document.createElement('blockquote'); excerpt.textContent = p.quote.length > 240 ? p.quote.slice(0, 240) + '…' : p.quote;
      const note = document.createElement('p'); note.textContent = p.note;
      const actions = document.createElement('div'); actions.className = 'group';
      const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = t.edit;
      edit.addEventListener('click', () => open(p, index, edit)); actions.append(edit);
      if (found) {
        const back = document.createElement('button'); back.type = 'button'; back.textContent = t.source;
        back.addEventListener('click', () => { for (let el = marker.parentElement; el; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true; marker.scrollIntoView({ block: 'center' }); marker.focus({ preventScroll: true }); });
        actions.append(back);
      } else { const missing = document.createElement('span'); missing.className = 'sub'; missing.textContent = t.unlocated; actions.append(missing); }
      row.append(title, excerpt, note, actions); list.append(row);
    });
  }
  editor.addEventListener('click', event => {
    const action = event.target.closest('[data-annotation-action]')?.dataset.annotationAction;
    if (!action || !draft) return;
    const passages = state().passages;
    if (action === 'save') {
      const { rect, index, ...p } = draft; p.note = field.value;
      if (index < 0) passages.push(p); else passages[index] = p;
    } else if (action === 'delete') {
      deleted = { index: draft.index, value: passages[draft.index] }; passages.splice(draft.index, 1);
      document.getElementById('annotation-undo').hidden = false;
    } else if (action === 'cancel') { close(); return; }
    else return;
    const anchor = draft.anchor && document.getElementById(draft.anchor.id);
    changed(); render(); returnTo = anchor || document.getElementById('decisions'); close(); announce(action === 'save' ? t.saved : t.deleted, action === 'delete');
  });
  editor.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); editor.querySelector('[data-annotation-action="save"]').click(); }
  });
  document.getElementById('annotation-undo').addEventListener('click', event => {
    if (!deleted) return;
    state().passages.splice(deleted.index, 0, deleted.value); deleted = null; changed(); render(); event.target.hidden = true;
    document.getElementById('decisions').focus({ preventScroll: true }); announce(t.restored);
  });
  document.addEventListener('selectionchange', () => {
    if (editor.open) return;
    picked = capture(); trigger.classList.toggle('on', !!picked);
    if (picked) { trigger.style.top = scrollY + picked.rect.bottom + 6 + 'px'; trigger.style.left = Math.max(8, Math.min(picked.rect.left, innerWidth - trigger.offsetWidth - 24)) + 'px'; }
  });
  trigger.addEventListener('mousedown', e => e.preventDefault());
  trigger.addEventListener('click', () => { if (picked) open(picked); });
  document.addEventListener('keydown', e => { if (e.altKey && e.shiftKey && e.code === 'KeyM' && !editor.open) { const p = capture(); if (p) { e.preventDefault(); open(p); } } });
  return { render, announce, reset() { dismissFeedback(); if (editor.open) close(); render(); } };
}
