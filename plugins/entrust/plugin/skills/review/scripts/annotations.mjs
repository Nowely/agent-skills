import { createHash } from "node:crypto";

export function annotationRecordDigest(review, files) {
  return createHash("sha256").update(JSON.stringify([review, files])).digest("hex");
}

export function sealAnnotationDocument(html) {
  const placeholder = `"annotationDocument":"${"0".repeat(64)}"`;
  const at = html.indexOf(placeholder);
  if (at < 0 || html.indexOf(placeholder, at + 1) !== -1) throw new Error("annotation document placeholder is not unique");
  const digest = createHash("sha256").update(html).digest("hex");
  return html.slice(0, at) + `"annotationDocument":"${digest}"` + html.slice(at + placeholder.length);
}

// Synchronous so a proof and its DOM snapshot cannot be separated by an await.
export function annotationSha256(value) {
  const bytes = new TextEncoder().encode(value), length = bytes.length;
  const padded = new Uint8Array(Math.ceil((length + 9) / 64) * 64);
  padded.set(bytes); padded[length] = 128;
  const view = new DataView(padded.buffer), bits = length * 8;
  view.setUint32(padded.length - 8, Math.floor(bits / 0x100000000));
  view.setUint32(padded.length - 4, bits >>> 0);
  const primes = [];
  for (let n = 2; primes.length < 64; n++) if (primes.every(p => n % p)) primes.push(n);
  const fraction = n => ((n % 1) * 0x100000000) >>> 0;
  const h = primes.slice(0, 8).map(p => fraction(Math.sqrt(p)));
  const k = primes.map(p => fraction(Math.cbrt(p))), w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let block = 0; block < padded.length; block += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(block + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      w[i] = (w[i - 16] + (rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) + w[i - 7]
        + (rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10))) >>> 0;
    }
    let [a, b, c, d, e, f, g, j] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (j + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + k[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      j = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    [a, b, c, d, e, f, g, j].forEach((v, i) => { h[i] = (h[i] + v) >>> 0; });
  }
  return h.map(n => n.toString(16).padStart(8, '0')).join('');
}

// Embedded in the standalone report; anchors refer to static text, never to inserted controls.
// `reveal(el)` (provided by the host page) activates the source tab/panel and unhides the target;
// without it the fallback only opens ancestor details.
export function annotations({ state, changed, t, identity, reveal, sha256, ensureWhere = () => {}, locationsChanged = () => {} }) {
  const root = document.getElementById('review-content');
  const list = document.getElementById('passages'), trigger = document.getElementById('comment');
  const editor = document.getElementById('annotation-editor'), field = editor.querySelector('textarea');
  const warning = editor.querySelector('[data-annotation-warning]');
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
  document.getElementById('annotation-dismiss').addEventListener('click', dismissFeedback);
  feedback.addEventListener('pointerenter', () => clearTimeout(feedbackTimer));
  feedback.addEventListener('focusin', () => clearTimeout(feedbackTimer));
  feedback.addEventListener('pointerleave', scheduleFeedback);
  feedback.addEventListener('focusout', () => queueMicrotask(scheduleFeedback));
  root.querySelectorAll('section, article, .seg, .qcard, .mechanism, tr[data-where]').forEach((el, i) => {
    if (!el.id) el.id = 'source-' + i;
    el.dataset.anchor = '';
  });
  const nodes = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n =>
      n.parentElement.closest('button,input,textarea,nav,.bar,#decisions,footer,.annotation-marker,.l > b,.l > i') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const result = []; while (walker.nextNode()) result.push(walker.currentNode); return result;
  };
  const ownerSelector = '.qcard[id], article.finding[id], .seg[id][data-block]';
  const fieldSelector = '[data-ann-field], .l';
  function fieldName(el, owner) {
    if (!el.matches('.l')) return el.getAttribute('data-ann-field');
    if (!owner.matches('.seg')) return null;
    const kinds = ['add', 'del', 'ctx'].filter((kind) => el.classList.contains(kind));
    const old = el.querySelector(':scope > b.old')?.textContent ?? '', next = el.querySelector(':scope > b.new')?.textContent ?? '';
    if (kinds.length !== 1 || !/^\d*$/.test(old) || !/^\d*$/.test(next) || (!old && !next)) return null;
    return `line.${kinds[0]}.${old}.${next}`;
  }
  function ownerOf(el) {
    if (!el || el.closest('.qwhere')) return null;
    const owner = el.closest(ownerSelector);
    if (!owner || !root.contains(owner) || document.getElementById(owner.id) !== owner) return null;
    if ([...document.querySelectorAll('[id]')].filter((node) => node.id === owner.id).length !== 1) return null;
    if (owner.matches('.qcard')) return owner.id === 'q' + owner.dataset.qid ? owner : null;
    if (owner.matches('.seg')) return owner.id === 'b' + owner.dataset.block ? owner : null;
    return owner.matches('article.finding:not(.idea):not(.mechanism)') && owner.id.startsWith('f') ? owner : null;
  }
  function ownerSignature(owner, includeWhere = false, includeMeta = false) {
    const tokens = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        if (tokens.at(-1)?.[0] === 'text') tokens.at(-1)[1] += node.data; else tokens.push(['text', node.data]);
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.matches('button,input,textarea,.annotation-marker,.card-comment,.block-comment,[data-qstatus],[data-fstatus],.na-badge,[data-qgate],[data-qdraft],.requires-content')
        || (!includeMeta && node.matches('.segmeta')) || (!includeWhere && node.matches('.qwhere'))) return;
      const transparent = node.matches('mark[data-annotation]');
      const lineKind = node.matches('.l') ? ['add', 'del', 'ctx'].filter((kind) => node.classList.contains(kind)).join(',') : null;
      const attrs = includeWhere ? [...node.attributes].filter((attr) => !['open', 'hidden', 'style', 'tabindex'].includes(attr.name))
        .map((attr) => [attr.name, attr.value]).sort((a, b) => a[0].localeCompare(b[0])) : null;
      if (!transparent) tokens.push(includeWhere
        ? ['open', node.localName, node.getAttribute('data-ann-field'), node.getAttribute('href'), lineKind, attrs]
        : ['open', node.localName, node.getAttribute('data-ann-field'), node.getAttribute('href'), lineKind]);
      for (const child of node.childNodes) walk(child);
      if (!transparent) tokens.push(['close', node.localName]);
    };
    walk(owner);
    return JSON.stringify(tokens);
  }
  const baseline = new Map();
  const fileBaselines = new Map(), fileOrigins = new WeakMap();
  const fileStructure = segments => JSON.stringify(segments.map(segment =>
    [segment.dataset.block || null, segment.id || null, ownerSignature(segment)]));
  function remember(owner) {
    if (!owner.id || owner.closest('.qwhere')) return;
    baseline.set(owner.id, baseline.has(owner.id) ? null : ownerSignature(owner));
  }
  root.querySelectorAll(ownerSelector).forEach(remember);
  for (const template of root.querySelectorAll('template')) {
    template.content.querySelectorAll('.seg[id][data-block]').forEach(remember);
    if (template.id.startsWith('segs-')) fileBaselines.set('file-' + template.id.slice(5),
      fileStructure([...template.content.querySelectorAll('.seg')]));
  }
  function fileSegments(host) {
    if (!host?.id || !fileBaselines.has(host.id) || document.getElementById(host.id) !== host
      || [...document.querySelectorAll('[id]')].filter(node => node.id === host.id).length !== 1) return null;
    const files = host.querySelectorAll('.file');
    if (files.length !== 1) return null;
    const segments = [...files[0].querySelectorAll('.seg')];
    return fileStructure(segments) === fileBaselines.get(host.id) ? segments : null;
  }
  function rememberFile(host) {
    const segments = fileSegments(host);
    if (segments) segments.forEach((segment, index) => fileOrigins.set(segment, { file: host.id, index }));
  }
  const whereBaseline = new WeakMap();
  const whereFullBaseline = new WeakMap();
  function rememberWhere(details) {
    const owner = details.closest('.qcard[id]');
    if (!owner || ownerOf(owner) !== owner || details.dataset.qwhere !== owner.dataset.qid
      || !details.querySelector('.qwhere-body')?.dataset.built) return;
    whereBaseline.set(details, ownerSignature(details, true));
    whereFullBaseline.set(details, ownerSignature(details, true, true));
  }
  function whereOf(owner) {
    const matches = [...owner.querySelectorAll('.qwhere[data-qwhere]')].filter((el) => el.closest('.qcard[id]') === owner && el.dataset.qwhere === owner.dataset.qid);
    if (matches.length !== 1) return null;
    const details = matches[0], signature = whereBaseline.get(details);
    return signature && signature === ownerSignature(details, true) ? details : null;
  }
  const ownerNodes = el => nodes(el).filter(node => !node.parentElement.closest('.qwhere,.card-comment,.block-comment,.segmeta,[data-qstatus],[data-fstatus],.na-badge,[data-qgate],[data-qdraft],.requires-content'));
  const whereNodes = el => nodes(el).filter(node => !node.parentElement.closest('.card-comment,.block-comment,[data-qstatus],[data-fstatus],.na-badge,[data-qgate],[data-qdraft],.requires-content'));
  function offsets(range, el, text = nodes(el)) {
    let offset = 0, from = null, to = 0;
    for (const node of text) {
      if (range.intersectsNode(node) && range.comparePoint(node, 0) !== 1 && range.comparePoint(node, node.length) !== -1) {
        const a = node === range.startContainer ? range.startOffset : 0, b = node === range.endContainer ? range.endOffset : node.length;
        if (b > a) { if (from === null) from = offset + a; to = offset + b; }
      }
      offset += node.length;
    }
    return { text, from, to, exact: from === null ? '' : text.map((node) => node.data).join('').slice(from, to) };
  }
  const staticExcluded = 'button,input,textarea,nav,.bar,#decisions,footer,.annotation-marker,.card-comment,.block-comment,.segmeta,[data-qstatus],[data-fstatus],.na-badge,[data-qgate],[data-qdraft],.requires-content,.qwhere-body,#settled-count,template,.l > b,.l > i';
  function staticSignature(el) {
    const tokens = [];
    const walk = node => {
      if (node.nodeType === 3) {
        if (tokens.at(-1)?.[0] === 'text') tokens.at(-1)[1] += node.data;
        else tokens.push(['text', node.data]);
      } else if (node.nodeType === 1 && !node.matches(staticExcluded)
        && (node === el || (!node.matches('[data-anchor]') && !node.matches('.dunit')))) {
        const transparent = node.matches('mark[data-annotation]');
        const attrs = [...node.attributes].filter(attr => !['open', 'hidden', 'style', 'tabindex'].includes(attr.name))
          .map(attr => [attr.name, attr.name === 'class' ? attr.value.split(/\s+/).filter(name => !['na', 'overruled', 'q-resolved'].includes(name)).join(' ') : attr.value])
          .filter(([name, value]) => name !== 'class' || value).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
        if (!transparent) tokens.push(['open', node.localName, attrs,
          node.matches('.l') ? ['add', 'del', 'ctx'].filter(kind => node.classList.contains(kind)).join(',') : null]);
        for (const child of node.childNodes) walk(child);
        if (!transparent) tokens.push(['close', node.localName]);
      }
    };
    walk(el);
    return JSON.stringify(tokens);
  }
  function staticPath(el) {
    const path = [];
    while (el && el !== root) {
      const parent = el.parentElement;
      if (!parent) return null;
      path.push([...parent.childNodes].filter(child => child.nodeType === 1 && !child.matches('mark[data-annotation]')).indexOf(el));
      el = parent;
    }
    return el === root ? path.reverse() : null;
  }
  const staticRegions = new Map();
  for (const el of root.querySelectorAll('[data-anchor]')) {
    if (!el.id || el.closest('.qwhere')) continue;
    const unit = el.closest('.dunit');
    const entry = { el, unit, path: staticPath(el), signature: staticSignature(el) };
    staticRegions.set(el.id, staticRegions.has(el.id) ? null : entry);
  }
  function staticRegion(id) {
    const entry = staticRegions.get(id), el = entry?.el;
    if (!el || !root.contains(el) || document.getElementById(id) !== el
      || [...document.querySelectorAll('[id]')].filter(node => node.id === id).length !== 1) return null;
    if (entry.unit) {
      if (el.closest('.dunit') !== entry.unit || !document.getElementById('panel-decisions')?.contains(entry.unit)) return null;
    } else if (JSON.stringify(staticPath(el)) !== JSON.stringify(entry.path)) return null;
    if (el.matches(ownerSelector) && !el.matches('article.idea,article.mechanism')
      && (ownerOf(el) !== el || baseline.get(id) !== ownerSignature(el))) return null;
    return staticSignature(el) === entry.signature ? entry : null;
  }
  function visibleText(node) {
    const el = node.parentElement;
    if (typeof el.checkVisibility === 'function') return el.checkVisibility({ visibilityProperty: true });
    for (let current = el; current; current = current.parentElement) {
      const style = getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || current.hidden) return false;
      if (current.tagName === 'DETAILS' && !current.open && !current.querySelector(':scope > summary')?.contains(el)) return false;
    }
    return true;
  }
  const staticNodes = el => nodes(el).filter(node => !node.parentElement.closest(staticExcluded));
  const staticRegionNodes = region => staticNodes(region).filter(node =>
    node.parentElement.closest('[data-anchor]') === region && node.parentElement.closest('.dunit') === region.closest('.dunit'));
  function staticPieces(range, visibility = true) {
    const commonNode = range.commonAncestorContainer;
    const common = commonNode?.nodeType === 1 ? commonNode : commonNode?.parentElement;
    if (!common || !root.contains(common)) return null;
    const cache = new Map(), checked = new Map(), pieces = [];
    for (const node of staticNodes(common)) {
      if (!range.intersectsNode(node) || range.comparePoint(node, 0) === 1 || range.comparePoint(node, node.length) === -1) continue;
      const a = node === range.startContainer ? range.startOffset : 0, b = node === range.endContainer ? range.endOffset : node.length;
      if (b <= a) continue;
      const region = node.parentElement.closest('[data-anchor]');
      if (!region) return null;
      if (node.parentElement.closest('.dunit') !== region.closest('.dunit')) {
        if (node.data.trim()) return null;
        continue;
      }
      if (!checked.has(region)) checked.set(region, staticRegion(region.id));
      if (!checked.get(region) || (node.parentElement.closest('.seg') && !region.matches('.seg'))) return null;
      if (!cache.has(region)) {
        let offset = 0; const offsets = new Map();
        for (const n of staticRegionNodes(region)) {
          offsets.set(n, offset); offset += n.length;
        }
        cache.set(region, offsets);
      }
      const offset = cache.get(region).get(node);
      if (offset === undefined) return null;
      const visible = visibility ? visibleText(node) : true;
      const last = pieces.at(-1);
      if (last && last.object === region.id && last.end === offset + a && last.visible === visible) last.end = offset + b;
      else pieces.push({ object: region.id, start: offset + a, end: offset + b, visible });
    }
    return pieces.length ? pieces : null;
  }
  function relatedInRange(range) {
    const commonNode = range.commonAncestorContainer;
    const common = commonNode?.nodeType === 1 ? commonNode : commonNode?.parentElement;
    if (!common) return null;
    const result = [];
    for (const body of common.querySelectorAll('.qwhere-body')) {
      if (!body.dataset.built || !range.intersectsNode(body)) continue;
      const selected = nodes(body).filter(node => node.data.trim() && range.intersectsNode(node)
        && range.comparePoint(node, 0) !== 1 && range.comparePoint(node, node.length) !== -1);
      if (!selected.length) continue;
      if (selected.some(visibleText)) return null;
      const details = body.closest('.qwhere[data-qwhere]'), owner = details?.closest('.qcard[id]');
      if (!owner || whereOf(owner) !== details || !staticRegion(owner.id)
        || whereFullBaseline.get(details) !== ownerSignature(details, true, true)) return null;
      result.push({ object: owner.id, structure: sha256(ownerSignature(details, true, true)) });
    }
    return result;
  }
  function staticBinding(pieces, quote, where) {
    return sha256(JSON.stringify([pieces.map(piece => {
      const entry = staticRegion(piece.object);
      return entry && [piece.object, entry.path, entry.signature, piece.start, piece.end, piece.visible];
    }), quote, ...(where === undefined ? [] : [where])]));
  }
  function staticProof(range, quote) {
    const pieces = staticPieces(range), where = relatedInRange(range);
    if (!pieces || !where) return null;
    return { version: 8, document: identity.document, record: identity.record, object: pieces[0].object,
      pieces, where, structure: staticBinding(pieces, quote, where) };
  }
  function locateStatic(p) {
    const proof = p.proof, pieces = proof.pieces;
    if (proof.version === 8) {
      if (!Array.isArray(proof.where) || proof.where.some(entry => !entry || typeof entry.object !== 'string'
        || !/^[a-f0-9]{64}$/.test(entry.structure || ''))) return null;
      for (const entry of proof.where) {
        const owner = staticRegion(entry.object)?.el;
        if (!owner?.matches('.qcard[id]')) return null;
        const matches = [...owner.querySelectorAll('.qwhere[data-qwhere]')].filter(details =>
          details.closest('.qcard[id]') === owner && details.dataset.qwhere === owner.dataset.qid);
        if (matches.length !== 1) return null;
        ensureWhere(matches[0]);
      }
    }
    if (!Array.isArray(pieces) || !pieces.length || pieces[0]?.object !== proof.object || typeof p.quote !== 'string'
      || pieces.some(piece => !piece || typeof piece.object !== 'string' || !Number.isInteger(piece.start)
        || !Number.isInteger(piece.end) || piece.start < 0 || piece.end <= piece.start || typeof piece.visible !== 'boolean'
        || !staticRegion(piece.object))) return null;
    if (staticBinding(pieces, p.quote, proof.version === 8 ? proof.where : undefined) !== proof.structure) return null;
    const parts = [], all = [];
    for (const piece of pieces) {
      const region = staticRegion(piece.object).el;
      let offset = 0;
      for (const node of staticRegionNodes(region)) {
        const start = Math.max(0, piece.start - offset), end = Math.min(node.length, piece.end - offset);
        if (end > start) {
          const part = { node, start, end };
          all.push(part);
          if (piece.visible) parts.push(part);
        }
        offset += node.length;
      }
      if (piece.end > offset) return null;
    }
    if (!parts.length || !all.length) return null;
    const range = document.createRange(), first = all[0], last = all.at(-1);
    try { range.setStart(first.node, first.start); range.setEnd(last.node, last.end); } catch { return null; }
    const normalized = [];
    for (const piece of pieces) {
      const lastPiece = normalized.at(-1);
      if (lastPiece && lastPiece.object === piece.object && lastPiece.end === piece.start) lastPiece.end = piece.end;
      else normalized.push({ ...piece, visible: true });
    }
    if (JSON.stringify(staticPieces(range, false)) !== JSON.stringify(normalized)) return null;
    if (proof.version === 8 && JSON.stringify(relatedInRange(range)) !== JSON.stringify(proof.where)) return null;
    return { el: root, parts };
  }
  function codeFragment(file, index, block) {
    const host = document.getElementById(file), segments = fileSegments(host);
    if (!segments || !Number.isInteger(index) || index < 0) return null;
    const segment = segments[index], origin = fileOrigins.get(segment);
    const canonical = document.getElementById('b' + block);
    if (!segment || segment.dataset.block !== block || origin?.file !== file || origin.index !== index
      || !canonical || ownerOf(canonical) !== canonical || canonical.closest('.file-lazy') !== host
      || !baseline.get(canonical.id) || baseline.get(canonical.id) !== ownerSignature(canonical)) return null;
    return segment;
  }
  function codeProof(range, quote, segment) {
    const origin = fileOrigins.get(segment), block = segment.dataset.block;
    if (!origin || codeFragment(origin.file, origin.index, block) !== segment) return null;
    const { from, to, exact, text } = offsets(range, segment, ownerNodes(segment));
    if (!exact) return null;
    let offset = 0; const visible = [];
    for (const node of text) {
      const a = Math.max(from, offset), b = Math.min(to, offset + node.length);
      if (b > a && visibleText(node)) {
        const last = visible.at(-1);
        if (last && last[1] === a) last[1] = b; else visible.push([a, b]);
      }
      offset += node.length;
    }
    if (!visible.length) return null;
    const structure = sha256(JSON.stringify([origin.file, origin.index, block, fileBaselines.get(origin.file), from, to, exact, quote, visible]));
    return { version: 9, document: identity.document, record: identity.record, object: 'b' + block,
      file: origin.file, fragment: origin.index, block, start: from, end: to, visible, structure };
  }
  function locateCode(p) {
    const proof = p.proof;
    if (typeof proof.file !== 'string' || typeof proof.block !== 'string' || proof.object !== 'b' + proof.block
      || typeof p.quote !== 'string') return null;
    const segment = codeFragment(proof.file, proof.fragment, proof.block);
    if (!segment) return null;
    const text = ownerNodes(segment), full = text.map(node => node.data).join(''), from = proof.start, to = proof.end;
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to > full.length || to <= from
      || !Array.isArray(proof.visible) || !proof.visible.length
      || proof.visible.some((part, i) => !Array.isArray(part) || part.length !== 2 || !Number.isInteger(part[0])
        || !Number.isInteger(part[1]) || part[0] < from || part[1] > to || part[1] <= part[0]
        || (i && part[0] < proof.visible[i - 1][1]))) return null;
    const structure = sha256(JSON.stringify([proof.file, proof.fragment, proof.block, fileBaselines.get(proof.file), from, to, full.slice(from, to), p.quote, proof.visible]));
    if (structure !== proof.structure) return null;
    let offset = 0; const parts = [];
    for (const node of text) {
      for (const [a, b] of proof.visible) {
        const start = Math.max(0, a - offset), end = Math.min(node.length, b - offset);
        if (end > start) parts.push({ node, start, end });
      }
      offset += node.length;
    }
    return parts.length ? { el: segment, parts } : null;
  }
  const fieldBinding = (owner, name, from, to, exact) => JSON.stringify([owner.id, name, ownerSignature(owner), from, to, exact]);
  function proofFor(range, selected) {
    if (!/^[a-f0-9]{64}$/.test(identity?.document || '') || !/^[a-f0-9]{64}$/.test(identity?.record || '')) return null;
    const parent = (node) => node.nodeType === 1 ? node : node.parentElement;
    const startWhere = parent(range.startContainer)?.closest('.qwhere[data-qwhere]');
    if (startWhere && startWhere === parent(range.endContainer)?.closest('.qwhere[data-qwhere]')) {
      const owner = startWhere.closest('.qcard[id]');
      if (!owner || ownerOf(owner) !== owner || !baseline.get(owner.id) || baseline.get(owner.id) !== ownerSignature(owner)
        || whereOf(owner) !== startWhere || whereFullBaseline.get(startWhere) !== ownerSignature(startWhere, true, true)) return null;
      const { from, to, exact, text } = offsets(range, startWhere, whereNodes(startWhere));
      if (!exact) return null;
      let offset = 0; const visible = [];
      for (const node of text) {
        const a = Math.max(from, offset), b = Math.min(to, offset + node.length);
        if (b > a && visibleText(node)) {
          const last = visible.at(-1);
          if (last && last[1] === a) last[1] = b; else visible.push([a, b]);
        }
        offset += node.length;
      }
      if (!visible.length) return null;
      return { version: 7, document: identity.document, record: identity.record, object: owner.id,
        structure: sha256(JSON.stringify([owner.id, ownerSignature(owner), ownerSignature(startWhere, true, true), from, to, exact, selected, visible])),
        start: from, end: to, visible };
    }
    const start = parent(range.startContainer)?.closest(fieldSelector);
    const end = parent(range.endContainer)?.closest(fieldSelector);
    const segment = parent(range.startContainer)?.closest('.seg[data-block]');
    if (segment && segment === parent(range.endContainer)?.closest('.seg[data-block]')
      && start?.matches('.l') && end?.matches('.l') && (start !== end || !segment.id)) return codeProof(range, selected, segment);
    if (start && end && start !== end) return staticProof(range, selected);
    if (!start || start !== end) return staticProof(range, selected);
    const owner = ownerOf(start);
    if (!owner || !baseline.get(owner.id) || baseline.get(owner.id) !== ownerSignature(owner)) return staticProof(range, selected);
    const name = fieldName(start, owner);
    if (!name) return null;
    const fields = [...owner.querySelectorAll(fieldSelector)].filter((el) => fieldName(el, owner) === name && el.closest(ownerSelector) === owner && !el.closest('.qwhere'));
    if (fields.length !== 1 || fields[0] !== start) return null;
    let offset = 0, from = null, to = 0;
    const text = nodes(start);
    for (const node of text) {
      if (range.intersectsNode(node) && range.comparePoint(node, 0) !== 1 && range.comparePoint(node, node.length) !== -1) {
        const a = node === range.startContainer ? range.startOffset : 0, b = node === range.endContainer ? range.endOffset : node.length;
        if (b > a) { if (from === null) from = offset + a; to = offset + b; }
      }
      offset += node.length;
    }
    const exact = from === null ? '' : text.map((node) => node.data).join('').slice(from, to);
    if (!exact || exact !== selected) return staticProof(range, selected);
    return { version: 6, document: identity.document, record: identity.record, object: owner.id, field: name,
      structure: sha256(fieldBinding(owner, name, from, to, exact)), start: from, end: to, text: exact };
  }
  function locate(p) {
    const proof = p.proof;
    if (!proof || ![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(proof.version) || proof.document !== identity?.document || proof.record !== identity?.record
      || !/^[a-f0-9]{64}$/.test(identity?.document || '') || !/^[a-f0-9]{64}$/.test(identity?.record || '')) return null;
    if (proof.version === 5 || proof.version === 8) return locateStatic(p);
    if (proof.version === 9) return locateCode(p);
    const owner = document.getElementById(proof.object);
    if (!owner || ownerOf(owner) !== owner
      || !baseline.get(owner.id) || baseline.get(owner.id) !== ownerSignature(owner)) return null;
    let el;
    if (proof.version === 2 || proof.version === 3 || proof.version === 7) {
      el = whereOf(owner);
      if (!el || (proof.version === 7 && whereFullBaseline.get(el) !== ownerSignature(el, true, true))) return null;
    } else if (proof.version === 4) {
      el = owner;
    } else {
      if (typeof proof.field !== 'string') return null;
      const fields = [...owner.querySelectorAll(fieldSelector)].filter((item) => fieldName(item, owner) === proof.field && item.closest(ownerSelector) === owner && !item.closest('.qwhere'));
      if (fields.length !== 1) return null;
      el = fields[0];
    }
    const text = proof.version === 4 ? ownerNodes(el) : proof.version === 7 ? whereNodes(el) : nodes(el), full = text.map(n => n.data).join('');
    const from = proof.start, to = proof.end;
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to > full.length || to <= from) return null;
    const expected = proof.version === 7 ? full.slice(from, to) : proof.text;
    if (typeof expected !== 'string' || !expected || ((proof.version < 3 || proof.version === 6) && expected !== p.quote)
      || full.slice(from, to) !== expected) return null;
    if (proof.version === 7 && (!Array.isArray(proof.visible) || !proof.visible.length
      || proof.visible.some((part, i) => !Array.isArray(part) || part.length !== 2 || !Number.isInteger(part[0])
        || !Number.isInteger(part[1]) || part[0] < from || part[1] > to || part[1] <= part[0]
        || (i && part[0] < proof.visible[i - 1][1])))) return null;
    let structure = proof.version === 2 || proof.version === 3 || proof.version === 7
      ? JSON.stringify([owner.id, ownerSignature(owner), ownerSignature(el, true, proof.version === 7), from, to, expected,
        ...(proof.version === 3 || proof.version === 7 ? [p.quote] : []), ...(proof.version === 7 ? [proof.visible] : [])])
      : proof.version === 4 ? JSON.stringify([owner.id, ownerSignature(owner), from, to, expected, p.quote])
      : fieldBinding(owner, proof.field, from, to, expected);
    if (proof.version >= 3) structure = sha256(structure);
    if (structure !== proof.structure) return null;
    let offset = 0; const parts = [];
    for (const node of text) {
      for (const [a, b] of proof.version === 7 ? proof.visible : [[from, to]]) {
        const start = Math.max(0, a - offset), end = Math.min(node.length, b - offset);
        if (end > start) parts.push({ node, start, end });
      }
      offset += node.length;
    }
    return parts.length && (proof.version === 7 || parts.map(({ node, start, end }) => node.data.slice(start, end)).join('') === expected) ? { el, parts } : null;
  }
  function capture() {
    const selection = getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return null;
    const quoteText = selection.toString();
    if (!quoteText.trim()) return null;
    const range = selection.getRangeAt(0), start = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    if (!root.contains(start) || start.closest('input,textarea')) return null;
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
    const lineAt = node => {
      const line = node?.parentElement.closest('.l'), file = line?.closest('.file');
      const num = line && (line.querySelector(line.classList.contains('del') ? 'b.old' : 'b.new') || line.querySelector('b'));
      return file && num ? file.querySelector('header strong').textContent + ':' + line.querySelector('i').textContent.trim() + num.textContent.trim() : null;
    };
    const firstLine = lineAt(firstNode), lastLine = lineAt(lastNode), heading = el.querySelector('h2,h3');
    const where = firstLine ? firstLine + (lastLine && lastLine !== firstLine ? ' .. ' + lastLine : '')
      : el.dataset.where || (el !== root && heading ? nodes(heading).map(n => n.data).join('') : t.report);
    const proof = selected.trim() ? proofFor(range, quoteText) : null;
    return { quote: quoteText, where, note: '', anchor: { id: el.id, start: from ?? 0, end: to, text: quoteText }, ...(proof ? { proof } : {}), rect: range.getBoundingClientRect() };
  }
  function close() {
    editor.close(); draft = null;
    if (returnTo?.isConnected) { if (!returnTo.matches('button,a[href],input,textarea,[tabindex]')) returnTo.tabIndex = -1; returnTo.focus({ preventScroll: true }); }
    retryRefresh();
  }
  function position(box) {
    editor.style.left = Math.max(8, Math.min(box.left, innerWidth - editor.offsetWidth - 8)) + 'px';
    editor.style.top = Math.max(8, Math.min(box.bottom + 8, innerHeight - editor.offsetHeight - 8)) + 'px';
  }
  window.addEventListener('resize', () => { if (editor.open) position(returnTo.getBoundingClientRect()); });
  function open(p, index = -1, source = null) {
    const location = locate(p), el = source || location?.el || trigger;
    warning.hidden = !!location;
    returnTo = el; draft = { ...p, index }; field.value = p.note || ''; quote.textContent = p.quote;
    editor.querySelector('[data-annotation-action="delete"]').hidden = index < 0;
    trigger.classList.remove('on');
    if (!editor.open) editor.show();
    position(p.rect || el.getBoundingClientRect());
    field.focus({ preventScroll: true });
  }
  function hasDraftChanges() { return !!draft && editor.open && field.value !== (draft.note || ''); }
  const located = new Map(), invalidated = new Set();
  function installed(index) {
    const marker = located.get(index), passage = state().passages[index];
    if (!marker?.isConnected || !passage) return false;
    const found = locate(passage);
    if (!found || !found.el.contains(marker) || !marker.closest(`mark[data-annotation="${index}"]`)) return false;
    if (passage.proof.version === 5 || passage.proof.version === 7 || passage.proof.version === 8 || passage.proof.version === 9) {
      const selected = new Set(found.parts.map(part => part.node));
      if (found.parts.some(part => part.start !== 0 || part.end !== part.node.length || !part.node.parentElement.closest(`mark[data-annotation="${index}"]`))) return false;
      for (const mark of root.querySelectorAll(`mark[data-annotation="${index}"]`)) {
        if (nodes(mark).some(node => node.length && !selected.has(node))) return false;
      }
      return true;
    }
    let offset = 0;
    for (const node of passage.proof.version === 4 ? ownerNodes(found.el) : nodes(found.el)) {
      const end = offset + node.length, marked = !!node.parentElement.closest(`mark[data-annotation="${index}"]`);
      if (node.length && ((offset < passage.proof.end && end > passage.proof.start) !== marked
        || (marked && (offset < passage.proof.start || end > passage.proof.end)))) return false;
      offset = end;
    }
    return true;
  }
  function invalidate(index) {
    const marker = located.get(index), row = list.children[index];
    if (!marker) return false;
    if (marker === document.activeElement) root.focus({ preventScroll: true });
    marker.remove();
    for (const mark of root.querySelectorAll(`mark[data-annotation="${index}"]`)) {
      for (const copy of mark.querySelectorAll('.annotation-marker')) {
        if (copy.closest('mark[data-annotation]') === mark) copy.remove();
      }
      mark.setAttribute('role', 'presentation'); mark.style.background = 'transparent'; mark.style.color = 'inherit';
    }
    located.delete(index); invalidated.add(index);
    const back = row?.querySelector('[data-annotation-source]');
    if (back) {
      if (back === document.activeElement) row.querySelector('button')?.focus({ preventScroll: true });
      const missing = document.createElement('span'); missing.className = 'sub'; missing.textContent = t.unverified;
      back.replaceWith(missing);
    }
    return true;
  }
  const observer = new MutationObserver(() => {
    let changedLocation = false;
    for (const index of located.keys()) if (!installed(index)) changedLocation = invalidate(index) || changedLocation;
    if (changedLocation) locationsChanged();
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
  function goTo(index) {
    const marker = located.get(index);
    if (!installed(index)) { if (invalidate(index)) locationsChanged(); return false; }
    if (reveal) reveal(marker);
    else for (let el = marker.parentElement; el; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true;
    requestAnimationFrame(() => { marker.scrollIntoView({ block: 'center' }); marker.focus({ preventScroll: true }); });
    return true;
  }
  function renderOne(p, index, found, previous) {
      let marker, lastMark;
      if (found) {
        for (const { node, start, end } of [...found.parts].reverse()) {
          const range = document.createRange(); range.setStart(node, start); range.setEnd(node, end);
          const mark = document.createElement('mark'); mark.dataset.annotation = index; range.surroundContents(mark);
          lastMark ||= mark;
        }
        marker = document.createElement('button'); marker.type = 'button'; marker.className = 'annotation-marker';
        marker.textContent = index + 1; marker.setAttribute('aria-label', t.annotation + ' ' + (index + 1));
        marker.addEventListener('click', () => open(p, index, marker));
        lastMark.append(marker);
        located.set(index, marker);
      }
      const row = document.createElement('article'); row.className = 'passage';
      const title = document.createElement('strong'); title.textContent = t.annotation + ' ' + (index + 1) + ' · ' + p.where;
      const excerpt = document.createElement('blockquote'); excerpt.textContent = p.quote.length > 240 ? p.quote.slice(0, 240) + '…' : p.quote;
      const note = document.createElement('p'); note.textContent = p.note;
      const actions = document.createElement('div'); actions.className = 'group';
      const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = t.edit;
      edit.addEventListener('click', () => open(p, index, edit)); actions.append(edit);
      if (found) {
        const back = document.createElement('button'); back.type = 'button'; back.textContent = t.source; back.dataset.annotationSource = index;
        back.addEventListener('click', () => goTo(index));
        actions.append(back);
      } else { const missing = document.createElement('span'); missing.className = 'sub'; missing.textContent = t.unverified; actions.append(missing); }
      row.append(title, excerpt, note, actions);
      if (previous) previous.replaceWith(row); else list.append(row);
  }
  function render() {
    root.querySelectorAll('.annotation-marker').forEach(el => el.remove());
    root.querySelectorAll('mark[data-annotation]').forEach(el => el.replaceWith(...el.childNodes));
    root.normalize(); list.replaceChildren(); located.clear(); invalidated.clear();
    state().passages.forEach((p, index) => renderOne(p, index, locate(p)));
  }
  const pendingRefresh = new Set();
  function refresh(scopes) {
    let changedLocation = false;
    for (const [index, p] of state().passages.entries()) {
      if (located.get(index)?.isConnected || invalidated.has(index)) continue;
      const anchor = p.proof && document.getElementById(p.proof.object), row = list.children[index];
      const affected = anchor && scopes.filter((s) => s.isConnected && (s.contains(anchor) || anchor.contains(s)));
      if (!affected?.length || !row) continue;
      const selection = getSelection();
      if (editor.open || row.contains(document.activeElement) || (selection?.rangeCount && !selection.isCollapsed && selection.getRangeAt(0).intersectsNode(anchor))) {
        affected.forEach((s) => pendingRefresh.add(s)); continue;
      }
      const found = locate(p);
      if (found) { renderOne(p, index, found, row); changedLocation = true; }
    }
    if (changedLocation) locationsChanged();
  }
  function retryRefresh() {
    if (!pendingRefresh.size) return;
    const scopes = [...pendingRefresh]; pendingRefresh.clear(); refresh(scopes);
  }
  list.addEventListener('focusout', () => queueMicrotask(retryRefresh));
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
    const anchor = locate(draft)?.el;
    changed(); render(); returnTo = anchor || document.getElementById('decisions'); close(); announce(action === 'save' ? t.added : t.deleted, action === 'delete');
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
    if (getSelection()?.isCollapsed) retryRefresh();
    picked = capture(); trigger.classList.toggle('on', !!picked);
    if (picked) { trigger.style.top = scrollY + picked.rect.bottom + 6 + 'px'; trigger.style.left = Math.max(8, Math.min(picked.rect.left, innerWidth - trigger.offsetWidth - 24)) + 'px'; }
  });
  trigger.addEventListener('mousedown', e => e.preventDefault());
  trigger.addEventListener('click', () => { if (picked) open(picked); });
  document.addEventListener('keydown', e => { if (e.altKey && e.shiftKey && e.code === 'KeyM' && !editor.open) { const p = capture(); if (p) { e.preventDefault(); open(p); } } });
  return { render, refresh, rememberWhere, rememberFile, announce, goTo, hasDraftChanges, located: installed, reset() { pendingRefresh.clear(); dismissFeedback(); if (editor.open) close(); render(); } };
}
