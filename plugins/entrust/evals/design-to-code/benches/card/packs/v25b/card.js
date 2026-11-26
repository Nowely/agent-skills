// The server offer card. The catalogue, the configurator and the comparison page call renderCard(el, offer, { onConfigure }).
// The card lays itself out by its own width: it tries its modes from the widest (w) to the narrowest (s) and keeps the
// first one whose content fits (see fit()), so the same code serves any container.
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Russian plural of "ядро" for the processor's core count.
  function coresWord(n) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return "ядер";
    if (b === 1) return "ядро";
    if (b >= 2 && b <= 4) return "ядра";
    return "ядер";
  }

  const ICON_NET = `<svg class="net-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M1 9V4.5h2V2h4v2.5h2V9z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  const ICON_DEAL = `<svg width="10" height="8" viewBox="0 0 10 8" aria-hidden="true" focusable="false"><path d="M1 1l4 3 4-3M1 4.6l4 3 4-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICON_LOW = `<svg width="6" height="9" viewBox="0 0 6 9" aria-hidden="true" focusable="false"><path d="M1 8V6.5M4.5 8V1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const ICON_GEAR = `<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 4h6M11 4h1M2 10h1M6 10h6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="9.5" cy="4" r="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="4.5" cy="10" r="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;

  let uid = 0;
  const MODES = ["w", "m", "n", "s"];

  // Popovers: hover or keyboard focus opens one; it stays while the pointer is over the opener or the popover and
  // closes when the pointer has left both, on Escape and on a tap elsewhere; a tap on touch screens toggles it.
  function popovers(card) {
    const items = [];
    let openItem = null;
    const closeAll = () => items.forEach((it) => it.close());
    function place(it) {
      const pop = it.pop, c = card.getBoundingClientRect(), r = it.opener.getBoundingClientRect();
      pop.style.left = "0px"; pop.style.top = "0px";
      const w = pop.offsetWidth, h = pop.offsetHeight, gap = 10;
      const cx = r.left + r.width / 2 - c.left;
      const vw = document.documentElement.clientWidth;
      let left = Math.max(8 - c.left, Math.min(cx - 28, vw - 8 - w - c.left));
      const above = r.top - h - gap >= 0 || window.innerHeight - r.bottom - h - gap < 0;
      pop.style.left = `${left}px`;
      pop.style.top = `${above ? r.top - c.top - h - gap : r.bottom - c.top + gap}px`;
      pop.dataset.side = above ? "top" : "bottom";
      pop.style.setProperty("--arrow-x", `${Math.max(10, Math.min(cx - left, w - 10))}px`);
    }
    function add(opener, pop) {
      const it = { opener, pop, timer: 0 };
      it.open = () => {
        clearTimeout(it.timer);
        if (openItem && openItem !== it) openItem.close();
        pop.hidden = false; opener.setAttribute("aria-expanded", "true"); openItem = it; place(it);
      };
      it.close = () => {
        clearTimeout(it.timer);
        pop.hidden = true; opener.setAttribute("aria-expanded", "false"); if (openItem === it) openItem = null;
      };
      it.later = () => { clearTimeout(it.timer); it.timer = setTimeout(it.close, 150); };
      opener.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") it.open(); });
      opener.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") it.later(); });
      pop.addEventListener("pointerenter", () => clearTimeout(it.timer));
      pop.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") it.later(); });
      opener.addEventListener("focus", () => { if (opener.matches(":focus-visible")) it.open(); });
      opener.addEventListener("blur", () => { if (!pop.matches(":hover")) it.later(); });
      opener.addEventListener("click", (e) => {
        if (e.pointerType === "touch" || e.detail === 0) pop.hidden ? it.open() : it.close();
        else it.open();
      });
      items.push(it);
    }
    const onKey = (e) => { if (e.key === "Escape" && openItem) openItem.close(); };
    const onDown = (e) => { if (openItem && !openItem.opener.contains(e.target) && !openItem.pop.contains(e.target)) openItem.close(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("resize", closeAll);
    return { add, dispose() { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown, true); window.removeEventListener("resize", closeAll); } };
  }

  // The widest mode whose content fits the card's own width and keeps the SKU within two lines.
  function fit(card) {
    const grid = card.firstElementChild, sku = card.querySelector(".sku");
    const lh = sku ? parseFloat(getComputedStyle(sku).lineHeight) || 18 : 18;
    delete card.dataset.compact;
    for (const m of MODES) {
      card.dataset.mode = m;
      if (m === "s") {
        // below the narrowest layout the cores column goes under the processor row instead of breaking words
        if (grid.scrollWidth > grid.clientWidth + 0.5) card.dataset.compact = "1";
        return;
      }
      const over = grid.scrollWidth > grid.clientWidth + 0.5;
      const tall = sku && sku.getBoundingClientRect().height > lh * 2 + 1;
      const foot = card.querySelector(".g-foot");
      const wrapped = foot && foot.getBoundingClientRect().height > 30;
      if (!over && !tall && !wrapped) return;
    }
  }

  function renderCard(el, o, { onConfigure } = {}) {
    if (el._offerCard) el._offerCard();
    const id = `oc${++uid}`;
    const n = o.network || {}, d = o.price.discount, cpu = o.cpu;
    const dis = (o.disks || []).map((g) => `<div class="disk"><span class="if-wm">${esc(g.count)} × ${esc(g.size)}</span><span class="if-ns">${esc(g.size)} × ${esc(g.count)}</span> <span class="t-muted">${esc(g.type)}</span></div>`).join("");
    const badges = (o.badges || []).map((b) => `<span class="kit-badge${b.tone === "accent" ? " kit-badge--accent" : ""}">${esc(b.text)}</span>`).join("");
    const low = o.stock.low ? `<span class="kit-icon kit-icon--low" role="img" aria-label="Мало на складе">${ICON_LOW}</span>` : "";
    el.innerHTML = `<div class="card" data-mode="w"><div class="card__grid">
  <div class="g-top">
    <div class="c-id"><div class="sku t-caption">${esc(o.sku)}</div>${badges ? `<div class="badges">${badges}</div>` : ""}</div>
    <div class="c-model"><div class="model t-body">${esc(cpu.model)}</div><div class="vendor" aria-label="${esc(cpu.vendor)}">${esc(cpu.vendor)}</div></div>
  </div>
  <div class="g-spec t-body">
    <div class="c-freq">${esc(cpu.frequency)}<span class="if-ns"> ГГц</span></div>
    <div class="c-cpus">${esc(cpu.cores)}<span class="if-ns"> ${coresWord(Number(cpu.cores))}</span></div>
    <span class="kit-chip c-chip"><span class="if-wmn">x${esc(cpu.count)}</span><span class="if-s">×${esc(cpu.count)} CPU</span></span>
    <div class="c-cores">${esc(o.cores.total)}<div class="sub t-muted">${esc(o.cores.threads)}</div></div>
    <div class="c-ram"><span class="ram-size">${esc(o.ram.size)}<span class="if-s"> RAM</span></span><span class="sub t-muted">${esc(o.ram.type)}</span></div>
    <div class="c-disks">${dis}</div>
  </div>
  <div class="g-foot t-muted">
    <div class="c-net">${ICON_NET}<span>${esc(n.text)}</span><button type="button" class="kit-help" aria-label="Сеть: подробнее" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-net">?</button></div>
    <div class="c-psu"><span>${esc(o.power.text)}</span><button type="button" class="kit-help" aria-label="Питание: подробнее" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-psu">?</button></div>
    ${o.configurable ? `<button type="button" class="kit-action c-cfg">${ICON_GEAR}<span>Сконфигурировать</span></button>` : ""}
  </div>
  <div class="g-buy">
    <div class="c-price"><span class="price">${esc(o.price.amount)}${o.price.period ? ` ${esc(o.price.period)}` : ""}</span>${d ? `<button type="button" class="kit-icon kit-icon--deal c-deal" aria-label="Скидка: подробнее" aria-haspopup="true" aria-expanded="false" aria-controls="${id}-deal">${ICON_DEAL}</button>` : ""}</div>
    <div class="c-stock t-body t-muted">${o.stock.low ? `<span class="if-wm">${low}</span>` : ""}<span>Доступно ${esc(o.stock.count)}</span>${o.stock.low ? `<span class="if-ns">${low}</span>` : ""}</div>
  </div>
</div>
<div class="kit-popover" id="${id}-net" role="dialog" aria-label="Скорость соединения сетевых карт" hidden>
  <div class="kit-popover__title">Скорость соединения сетевых карт</div>
  <div><span class="t-muted">Приватная сеть:</span> ${esc(n.private)}</div>
  <div><span class="t-muted">Публичная сеть:</span> ${esc(n.public)}</div>
  ${n.reservation ? `<div class="pop-reserve">Резервирование через <a class="kit-link" href="${esc(n.link || "#")}">${esc(n.reservation)}</a></div>` : ""}
</div>
<div class="kit-popover" id="${id}-psu" role="dialog" aria-label="Питание" hidden>${esc(o.power.help)}</div>
${d ? `<div class="kit-popover" id="${id}-deal" role="dialog" aria-label="Скидка" hidden><div class="kit-popover__title">Скидка до ${esc(d.until)}</div><div><span class="t-muted">Старая цена:</span> <s>${esc(d.old)}</s></div></div>` : ""}
</div>`;
    const card = el.firstElementChild;
    const pops = popovers(card);
    const pair = (sel, pid) => { const op = card.querySelector(sel), pop = card.querySelector(`#${id}-${pid}`); if (op && pop) pops.add(op, pop); };
    pair(".c-net .kit-help", "net"); pair(".c-psu .kit-help", "psu"); pair(".c-deal", "deal");
    card.querySelector(".c-cfg")?.addEventListener("click", () => onConfigure?.(o.id));

    let last = -1;
    const ro = new ResizeObserver(() => {
      const w = card.clientWidth;
      if (w === last) return;
      last = w; fit(card);
    });
    ro.observe(card);
    fit(card); last = card.clientWidth;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (card.isConnected) fit(card); });
    el._offerCard = () => { ro.disconnect(); pops.dispose(); el._offerCard = null; };
  }
  window.renderCard = renderCard;
})();
