// The server offer card. The catalogue, the configurator and the comparison page call renderCard(el, offer, { onConfigure }).
// The card adapts to its own width and content: it tries its layouts from the widest to the narrowest and keeps the
// first that fits (data-mode on .offer-card: wide, medium, narrow, stack).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NB = "\u00a0";
  const nb = (s) => esc(s).replace(/(\d) (?=\S)/g, "$1" + NB); // a number stays with its unit
  let uid = 0;

  const ICON = {
    net: '<svg class="card__net-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3.5h8V9H1zM3 3.5V1.5h4v2M3 9V6.5M5 9V6.5M7 9V6.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>',
    deal: '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2.5l3 3 3-3M2 5.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    low: '<svg width="8" height="10" viewBox="0 0 8 10" aria-hidden="true"><path d="M2 3v6M5.5 6v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    gear: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3.5h8M2 8.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="4.5" cy="3.5" r="1.5" fill="var(--c-surface)" stroke="currentColor" stroke-width="1.2"/><circle cx="7.5" cy="8.5" r="1.5" fill="var(--c-surface)" stroke="currentColor" stroke-width="1.2"/></svg>',
  };

  // --- popovers: hover or focus opens, the pointer over the icon or the popover keeps it, Escape / a tap elsewhere closes ---
  const open = new Set();
  function closeAll(except) { open.forEach((p) => { if (p !== except) p.close(); }); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  document.addEventListener("pointerdown", (e) => {
    open.forEach((p) => { if (!p.trigger.contains(e.target) && !p.box.contains(e.target)) p.close(); });
  }, true);

  function attachPopover(trigger, html, cls) {
    const id = `card-pop-${++uid}`;
    const box = document.createElement("div");
    box.className = `kit-popover card__popover ${cls || ""}`;
    box.id = id;
    box.setAttribute("popover", "manual");
    box.setAttribute("role", "tooltip");
    box.innerHTML = html;
    trigger.style.setProperty("anchor-name", `--${id}`);
    box.style.setProperty("position-anchor", `--${id}`);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", id);
    trigger.after(box);

    let timer = 0, touchWasOpen = false, lastTouch = false;
    const api = { trigger, box, isOpen: false };
    api.open = () => {
      clearTimeout(timer);
      if (api.isOpen) return;
      closeAll(api);
      api.isOpen = true;
      box.showPopover();
      trigger.setAttribute("aria-expanded", "true");
      open.add(api);
      // the arrow points at the icon, on the side the popover ended up on
      requestAnimationFrame(() => {
        const t = trigger.getBoundingClientRect(), b = box.getBoundingClientRect();
        box.dataset.side = b.bottom <= t.top + 1 ? "top" : "bottom";
        box.style.setProperty("--arrow-x", `${Math.max(14, Math.min(b.width - 14, t.left + t.width / 2 - b.left))}px`);
      });
    };
    api.close = () => {
      clearTimeout(timer);
      if (!api.isOpen) return;
      api.isOpen = false;
      box.hidePopover();
      trigger.setAttribute("aria-expanded", "false");
      open.delete(api);
    };
    const later = () => { clearTimeout(timer); timer = setTimeout(api.close, 150); };
    for (const el of [trigger, box]) {
      el.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") api.open(); });
      el.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") later(); });
    }
    trigger.addEventListener("pointerdown", (e) => { lastTouch = e.pointerType === "touch"; touchWasOpen = api.isOpen; });
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      if (lastTouch) { touchWasOpen ? api.close() : api.open(); lastTouch = false; }
    });
    trigger.addEventListener("focus", () => { if (trigger.matches(":focus-visible")) api.open(); });
    trigger.addEventListener("blur", () => { if (!box.matches(":hover")) api.close(); });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); api.isOpen ? api.close() : api.open(); }
    });
    return api;
  }

  const help = (label) => `<button type="button" class="kit-help" aria-label="${esc(label)}" aria-haspopup="true">?</button>`;

  function renderCard(el, o, { onConfigure } = {}) {
    const n = o.network || {}, p = o.price || {}, cpu = o.cpu || {}, stock = o.stock || {};
    const badges = (o.badges || []).map((b) => `<span class="kit-badge${b.tone === "accent" ? " kit-badge--accent" : ""}">${esc(b.text)}</span>`).join("");
    const disks = (o.disks || []).map((d) => `<li class="disk"><span class="disk__size t-body"><span class="disk__cs">${esc(d.count)}${NB}×${NB}${esc(d.size)}</span><span class="disk__sc">${esc(d.size)}${NB}×${NB}${esc(d.count)}</span></span> <span class="disk__type t-body t-muted">${esc(d.type)}</span></li>`).join("");
    const ghz = `<span class="u">${NB}ГГц</span>`;
    el.innerHTML = `<div class="offer-card" data-mode="wide"><article class="card">
  <div class="card__left">
  <div class="card__id">
    <div class="card__sku t-caption">${esc(o.sku)}</div>
    ${badges ? `<div class="card__badges">${badges}</div>` : ""}
  </div>
  <div class="card__cpu">
    <div class="cpu__model t-body">${esc(cpu.model)}</div>
    <div class="cpu__vendor" role="img" aria-label="${esc(cpu.vendor)}">${esc(cpu.vendor)}</div>
  </div>
  </div>
  <div class="card__specs">
    <div class="spec spec--freq t-body" title="ГГц"><span class="v">${esc(cpu.frequency)}</span>${ghz}</div>
    <div class="spec spec--cores t-body"><span class="spec__cpu" title="ядер в процессоре"><span class="v">${esc(cpu.cores)}</span><span class="u">${NB}ядер</span></span>${cpu.count > 1 ? `<span class="kit-chip cpu__count" title="процессоров">×${esc(cpu.count)}<span class="u">${NB}CPU</span></span>` : ""}</div>
    <div class="spec spec--threads"><div class="t-body">${nb(o.cores?.total)}</div><div class="t-muted spec__sub">${nb(o.cores?.threads)}</div></div>
    <div class="spec spec--ram"><span class="ram__size t-body">${nb(o.ram?.size)}<span class="u">${NB}RAM</span></span> <span class="ram__type t-muted">${esc(o.ram?.type)}</span></div>
    <ul class="spec spec--disks">${disks}</ul>
  </div>
  <div class="card__price">
    <div class="price t-price"><span class="price__text"><span class="price__amount">${nb(p.amount)}</span>${p.period ? ` <span class="price__period">${esc(String(p.period).replace(/^\/\s*/, "/" + NB))}</span>` : ""}</span>${p.discount ? `<button type="button" class="kit-icon kit-icon--deal price__deal" aria-label="Скидка" aria-haspopup="true">${ICON.deal}</button>` : ""}</div>
  </div>
  <div class="card__foot">
    <span class="foot__item foot__net t-muted">${ICON.net}<span>${nb(n.text)}</span>${help("Скорость соединения сетевых карт")}</span>
    <span class="foot__item foot__power t-muted"><span>${esc(o.power?.text)}</span>${help("Блоки питания")}</span>
    ${o.configurable ? `<button type="button" class="kit-action card__configure">${ICON.gear}<span>Сконфигурировать</span></button>` : ""}
  </div>
  <div class="card__stock t-body t-muted"><span class="stock__text">Доступно${NB}${esc(stock.count)}</span>${stock.low ? `<span class="kit-icon kit-icon--low stock__low" role="img" aria-label="Мало на складе">${ICON.low}</span>` : ""}</div>
</article></div>`;

    const root = el.querySelector(".offer-card");
    const net = el.querySelector(".foot__net .kit-help");
    attachPopover(net, `<div class="kit-popover__title">Скорость соединения сетевых карт</div>
      <div><span class="t-muted">Приватная сеть:</span> ${esc(n.private)}</div>
      <div><span class="t-muted">Публичная сеть:</span> ${esc(n.public)}</div>
      ${n.reservation ? `<div class="pop__reserve">Резервирование через ${n.link ? `<a class="kit-link" href="${esc(n.link)}">${esc(n.reservation)}</a>` : esc(n.reservation)}</div>` : ""}`, "card__popover--net");
    attachPopover(el.querySelector(".foot__power .kit-help"), `<div>${esc(o.power?.help)}</div>`);
    const deal = el.querySelector(".price__deal");
    if (deal) attachPopover(deal, `<div><span class="t-muted">Цена без скидки:</span> <span class="nowrap">${esc(p.discount.old)}</span></div><div><span class="t-muted">Скидка действует до</span> ${esc(p.discount.until)}</div>`);
    el.querySelector(".card__configure")?.addEventListener("click", (e) => { e.preventDefault(); onConfigure?.(o.id); });

    // choose the layout: the widest that fits the container; narrow is a wrapping row, stack a single column
    const fit = () => {
      const w = root.clientWidth;
      let mode = "stack";
      if (w >= 400) {
        mode = "narrow";
        for (const m of ["wide", "medium"]) {
          root.dataset.mode = m;
          if (card.scrollWidth <= card.clientWidth + 0.5) { mode = m; break; }
        }
      }
      root.dataset.mode = mode;
    };
    const card = root.firstElementChild;
    fit();
    if (el._cardObserver) el._cardObserver.disconnect();
    if (window.ResizeObserver) {
      let last = root.clientWidth;
      el._cardObserver = new ResizeObserver(() => { if (root.clientWidth !== last) { last = root.clientWidth; fit(); } });
      el._cardObserver.observe(root);
    }
  }
  window.renderCard = renderCard;
})();
