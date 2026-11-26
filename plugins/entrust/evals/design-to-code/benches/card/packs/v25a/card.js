// The server offer card. The catalogue, the configurator and the comparison page call renderCard(el, offer, { onConfigure }).
// The card lays itself out by its own width (not the window's): the widest of four modes whose content fits.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nb = (s) => esc(s).replace(/ /g, " ");
  const MODES = ["wide", "mid", "compact", "narrow"];
  let uid = 0;

  const ICON = {
    network: '<svg class="meta-icon" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path d="M1.5 10.5V5.2h1.8V2.8h5.4v2.4h1.8v5.3zM4 10.5V8.4M6 10.5V8.4M8 10.5V8.4"/></svg>',
    amd: '<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3.5 0.5h8v8L9.2 6.2 5.2 10.2 1.8 6.8 5.8 2.8z"/></svg>',
    gear: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="7" cy="7" r="2"/><path d="M7 1v1.8M7 11.2V13M1 7h1.8M11.2 7H13M2.8 2.8l1.3 1.3M9.9 9.9l1.3 1.3M11.2 2.8L9.9 4.1M4.1 9.9l-1.3 1.3"/></svg>',
    deal: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 2.5L6 6l3.5-3.5M2.5 6.5L6 10l3.5-3.5"/></svg>',
    low: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="3" y="6" width="1.8" height="4"/><rect x="6.6" y="3" width="1.8" height="7"/></svg>',
  };

  function renderCard(el, o, { onConfigure } = {}) {
    if (el._cardCleanup) el._cardCleanup();
    const ac = new AbortController();
    const n = o.network, p = o.price, id = "card" + ++uid;
    const dsk = (d) => `<div class="disk"><span class="d-a">${esc(d.count)} × ${esc(d.size)}</span><span class="d-b">${esc(d.size)} × ${esc(d.count)}</span> <span class="t-muted">${esc(d.type)}</span></div>`;
    el.innerHTML = `<div class="offer" data-mode="wide"><article class="card t-body">
  <div class="id"><div class="sku t-caption">${esc(o.sku)}</div>${o.badges.length ? `<div class="badges">${o.badges.map((b) => `<span class="kit-badge${b.tone === "accent" ? " kit-badge--accent" : ""}">${esc(b.text)}</span>`).join("")}</div>` : ""}</div>
  <div class="cpu"><div class="cpu-model">${esc(o.cpu.model)}</div><div class="cpu-vendor">${esc(o.cpu.vendor)}${/^amd$/i.test(o.cpu.vendor) ? ICON.amd : ""}</div></div>
  <div class="specs">
    <div class="freq">${esc(o.cpu.frequency)}<span class="u"> ГГц</span></div>
    <div class="cc"><span class="cc-n">${esc(o.cpu.cores)}<span class="u"> ядер</span></span><span class="kit-chip">×${esc(o.cpu.count)}<span class="u">&nbsp;CPU</span></span></div>
    <div class="th"><div>${esc(o.cores.total)}</div><div class="t-muted">${esc(o.cores.threads)}</div></div>
    <div class="ram"><span class="ram-size">${nb(o.ram.size)}<span class="u">&nbsp;RAM</span></span> <span class="ram-type t-muted">${esc(o.ram.type)}</span></div>
    <div class="disks">${o.disks.map(dsk).join("")}</div>
  </div>
  <div class="meta t-caption">
    <span class="meta-item">${ICON.network}<span class="net-text">${esc(n.text)}</span>${helpWrap("net", "Скорость соединения сетевых карт")}</span>
    <span class="meta-item"><span class="power-text">${esc(o.power.text)}</span>${helpWrap("power", "Блок питания")}</span>
    ${o.configurable ? `<button type="button" class="kit-action configure">${ICON.gear}Сконфигурировать</button>` : ""}
  </div>
  <div class="price"><div class="price-row">${p.discount ? `<span class="help-wrap">${helpBtn("deal", "Скидка", `<span class="kit-icon kit-icon--deal">${ICON.deal}</span>`)}${pop("deal")}</span>` : ""}</div><div class="amount t-price"><span>${esc(p.amount)}</span>${p.period ? ` <span>${esc(p.period)}</span>` : ""}</div></div>
  <div class="stock t-body t-muted">${o.stock.low ? `<span class="kit-icon kit-icon--low" role="img" aria-label="Мало на складе">${ICON.low}</span>` : ""}<span>Доступно ${esc(o.stock.count)}</span></div>
</article></div>`;

    function helpBtn(kind, label, inner) {
      return `<button type="button" class="${kind === "deal" ? "deal-btn" : "kit-help"} ${kind}-help" aria-label="${esc(label)}" aria-expanded="false" aria-controls="${id}-${kind}">${inner || "?"}</button>`;
    }
    function pop(kind) {
      let body = "";
      if (kind === "net") body = `<div class="kit-popover__title">Скорость соединения сетевых карт</div>
        <div><span class="t-muted">Приватная сеть:</span> ${esc(n.private)}</div><div><span class="t-muted">Публичная сеть:</span> ${esc(n.public)}</div>
        <div class="pop-gap">Резервирование через <a class="kit-link" href="${esc(n.link)}">${esc(n.reservation)}</a></div>`;
      else if (kind === "power") body = `<div>${esc(o.power.help)}</div>`;
      else body = `<div class="kit-popover__title">Скидка</div><div><span class="t-muted">Старая цена:</span> <s>${esc(p.discount.old)}</s></div><div><span class="t-muted">Действует до</span> ${esc(p.discount.until)}</div>`;
      return `<div class="kit-popover pop pop-${kind}" id="${id}-${kind}" role="group" hidden>${body}</div>`;
    }
    function helpWrap(kind, label) { return `<span class="help-wrap">${helpBtn(kind, label)}${pop(kind)}</span>`; }
    const wrap = el.querySelector(".offer"), card = wrap.querySelector(".card");

    // --- the layout mode: the widest one whose content fits the card's own width ---
    function fits() {
      const cs = getComputedStyle(card), r = card.getBoundingClientRect();
      const right = r.right - parseFloat(cs.paddingRight) + 0.5, left = r.left + parseFloat(cs.paddingLeft) - 0.5;
      for (const c of card.querySelectorAll(".id,.sku,.badges,.kit-badge,.cpu-model,.cpu-vendor,.specs > *,.cc > *,.meta,.meta-item,.configure,.amount,.stock,.price")) {
        const b = c.getBoundingClientRect();
        if (!b.width) continue;
        if (b.right > right || b.left < left) return false;
        if (c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).display !== "inline") return false;
      }
      if (wrap.dataset.mode !== "narrow") { // the footer stays on one line wherever the layout has room for it
        const tops = [...card.querySelectorAll(".meta > *")].map((x) => x.getBoundingClientRect().top);
        if (tops.length && Math.max(...tops) - Math.min(...tops) > 4) return false;
      }
      const a = card.querySelector(".amount").getBoundingClientRect(), s = card.querySelector(".stock").getBoundingClientRect();
      if (a.top < s.bottom && s.top < a.bottom && a.right > s.left - 8) return false;
      return true;
    }
    function layout() {
      if (!wrap.offsetWidth) return;
      for (const m of MODES) {
        wrap.dataset.mode = m;
        if (m === "narrow" || fits()) break;
      }
      for (const w of wrap.querySelectorAll(".help-wrap")) place(w);
    }
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    layout();

    // --- popovers: hover or keyboard focus opens, leaving both closes, Escape and a tap elsewhere close, a touch tap toggles ---
    let touch = false;
    const wraps = [...wrap.querySelectorAll(".help-wrap")];
    function place(w) {
      const pp = w.querySelector(".pop"), b = w.querySelector("button");
      if (pp.hidden) return;
      const W = wrap.clientWidth, wr = wrap.getBoundingClientRect(), br = b.getBoundingClientRect();
      pp.style.maxWidth = Math.min(320, W) + "px";
      pp.style.left = "0px"; pp.style.top = "0px";
      const pw = pp.offsetWidth, ph = pp.offsetHeight, cx = br.left + br.width / 2 - wr.left;
      let left = Math.max(0, Math.min(cx - 22, W - pw));
      const top = br.top - wr.top - ph - 10;
      pp.style.left = left + "px"; pp.style.top = top + "px";
      pp.style.setProperty("--arrow", Math.max(10, Math.min(cx - left, pw - 10)) + "px");
    }
    function show(w) { for (const x of wraps) if (x !== w) hide(x); const pp = w.querySelector(".pop"); pp.hidden = false; w.querySelector("button").setAttribute("aria-expanded", "true"); place(w); }
    function hide(w) { clearTimeout(w._t); w.querySelector(".pop").hidden = true; w.querySelector("button").setAttribute("aria-expanded", "false"); w._sticky = false; }
    for (const w of wraps) {
      const b = w.querySelector("button");
      w.addEventListener("pointerdown", (e) => { touch = e.pointerType === "touch"; }, { signal: ac.signal });
      w.addEventListener("mouseenter", () => { if (touch) return; clearTimeout(w._t); show(w); }, { signal: ac.signal });
      w.addEventListener("mouseleave", () => { if (touch || w._sticky) return; clearTimeout(w._t); w._t = setTimeout(() => { if (!(w.matches(":focus-within") && b.matches(":focus-visible"))) hide(w); }, 150); }, { signal: ac.signal });
      b.addEventListener("focus", () => { if (b.matches(":focus-visible")) show(w); }, { signal: ac.signal });
      w.addEventListener("focusout", (e) => { if (!w.contains(e.relatedTarget)) hide(w); }, { signal: ac.signal });
      b.addEventListener("click", (e) => {
        if (touch) { const open = !w.querySelector(".pop").hidden; open ? hide(w) : show(w); w._sticky = !open; touch = false; }
        else if (e.detail === 0) { w.querySelector(".pop").hidden ? show(w) : hide(w); }
      }, { signal: ac.signal });
    }
    document.addEventListener("pointerdown", (e) => { for (const w of wraps) if (!w.contains(e.target)) hide(w); }, { signal: ac.signal, capture: true });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") for (const w of wraps) hide(w); }, { signal: ac.signal });

    el.querySelector(".configure")?.addEventListener("click", () => onConfigure?.(o.id), { signal: ac.signal });
    el._cardCleanup = () => { ro.disconnect(); ac.abort(); };
  }

  window.renderCard = renderCard;
})();
