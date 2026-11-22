// The server offer card. The catalogue, the configurator and the comparison page call
// renderCard(el, offer, { onConfigure }). The card lays itself out from the width of `el` (not the window's):
// it tries its layouts from the widest down and keeps the first whose content fits (see MODES and layout()).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // A link from the data goes into href: no script URLs.
  const safeHref = (u) => (/^\s*(javascript|data|vbscript):/i.test(String(u ?? "")) ? "#" : String(u ?? "#"));
  const plural = (n, one, few, many) => {
    const a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many;
  };

  // The layouts, widest first. Each is drawn by its own frame (764, 601, 486, 280 px) and differs in the order of
  // its parts and in how the values are worded; a layout is used while its content fits the width, so a long price
  // or SKU moves the switch instead of breaking the line. "compact" always fits.
  const MODES = ["wide", "medium", "narrow", "compact"];

  const ICONS = {
    port: '<svg class="ico ico--port" width="11" height="10" viewBox="0 0 11 10" aria-hidden="true" focusable="false"><path d="M1.5 9.5V4.2h2V2.5h1.6V1h2.8v1.5h1.6v1.7h2v5.3z" transform="translate(-.5 0)" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><path d="M3.5 9V7M5.5 9V7M7.5 9V7" stroke="currentColor" stroke-width="1"/></svg>',
    deal: '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M1.5 1.5 5 4.5l3.5-3M1.5 5.5 5 8.5l3.5-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    low: '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2.5 8.5V3M5 8.5V5.5M7.5 8.5V6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    gear: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M1.5 4h6M10.5 4h2M1.5 10h2M6.5 10h6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="9" cy="4" r="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="5" cy="10" r="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    amd: '<svg class="vendor__mark" width="9" height="9" viewBox="0 0 9 9" aria-hidden="true" focusable="false"><path d="M0 0h9v9H7.2V2.6L2.6 7.2 1.3 5.9 5.9 1.4H0z" fill="currentColor"/></svg>',
  };

  let uid = 0;
  const instances = new WeakMap();

  function createCard(el, o, { onConfigure } = {}) {
    const id = `card${++uid}`;
    const card = document.createElement("div");
    card.className = "card";
    el.replaceChildren(card);

    let mode = "", lastWidth = -1, closeTimer = 0, openKey = null, ro = null, destroyed = false;

    // ---- the markup, by layout -------------------------------------------------------------------------------
    const n = o.network ?? {}, cpu = o.cpu ?? {}, price = o.price ?? {};
    const hasDeal = !!price.discount, low = !!o.stock?.low;

    function helpButton(key, label) {
      return `<button type="button" class="kit-help" id="${id}-${key}-t" data-pop="${key}" aria-label="${esc(label)}" aria-expanded="false" aria-controls="${id}-${key}"></button>`;
    }
    function popover(key, role, label, inner) {
      return `<div class="kit-popover pop" id="${id}-${key}" popover="manual" role="${role}" aria-label="${esc(label)}" data-for="${key}">${inner}</div>`;
    }

    function html(m) {
      const wideWords = m === "wide" || m === "medium"; // the frames of these two word the values shortly
      const sizeFirst = !wideWords; // the narrow frames draw "5587 × 4", the wide ones "2 × 838"
      const cores = Number(cpu.cores);
      const chip = Number(cpu.count) > 1 ? `<span class="kit-chip chip">×${esc(cpu.count)}${m === "compact" ? " CPU" : ""}</span>` : "";
      const vendor = cpu.vendor ? `<div class="vendor" aria-label="${esc(cpu.vendor)}">${esc(cpu.vendor)}${/^amd$/i.test(cpu.vendor) ? ICONS.amd : ""}</div>` : "";
      const badges = (o.badges ?? []).length
        ? `<ul class="badges">${o.badges.map((b) => `<li class="kit-badge${b.tone === "accent" ? " kit-badge--accent" : ""}">${esc(b.text)}</li>`).join("")}</ul>` : "";
      const unit = (shown, text) => (shown ? ` ${text}` : `<span class="sr"> ${text}</span>`);
      const ram = m === "compact"
        ? `<div class="c-ram t-body"><span class="ram__size">${esc(o.ram.size)} RAM</span> <span class="t-muted ram__type">${esc(o.ram.type)}</span></div>`
        : `<div class="c-ram t-body"><div class="ram__size">${esc(o.ram.size)}</div><div class="t-muted ram__type">${esc(o.ram.type)}</div></div>`;
      const disks = `<ul class="c-disks t-body">${(o.disks ?? []).map((d) => {
        const v = sizeFirst ? `${esc(d.size)} × ${esc(d.count)}` : `${esc(d.count)} × ${esc(d.size)}`;
        return `<li class="disk"><span class="disk__v">${v}</span> <span class="t-muted disk__t">${esc(d.type)}</span></li>`;
      }).join("")}</ul>`;

      const amount = esc(price.amount), period = price.period ? esc(price.period) : "";
      const priceText = `<span class="price t-price" title="${esc(`${price.amount ?? ""} ${price.period ?? ""}`.trim())}"><span class="price__amount">${amount}</span>${period ? ` <span class="price__period">${period}</span>` : ""}</span>`;
      const deal = hasDeal
        ? `<span class="pop-wrap"><button type="button" class="kit-icon kit-icon--deal deal" id="${id}-deal-t" data-pop="deal" aria-label="Цена со скидкой" aria-expanded="false" aria-controls="${id}-deal">${ICONS.deal}</button>${popover("deal", "tooltip", "Скидка",
          `<div class="kit-popover__title">Скидка до ${esc(price.discount.until)}</div><div class="pop__row"><span class="t-muted">Старая цена:</span> <s>${esc(price.discount.old)}</s></div>`)}</span>` : "";
      const priceBlock = `<div class="c-price">${deal}${priceText}</div>`;

      const stockText = `Доступно ${esc(o.stock?.count)}`;
      const lowIcon = low ? `<span class="kit-icon kit-icon--low" role="img" aria-label="Мало на складе" title="Мало на складе">${ICONS.low}</span>` : "";
      const stock = `<div class="stock t-body t-muted"><span>${stockText}</span>${lowIcon}</div>`;

      const foot = `<div class="card__foot">
        <div class="foot__item t-body t-muted"><span class="net">${ICONS.port}<span>${esc(n.text)}</span></span>${helpButton("net", "Скорость соединения сетевых карт")}${popover("net", "dialog", "Скорость соединения сетевых карт",
          `<div class="kit-popover__title">Скорость соединения сетевых карт</div><div class="pop__grid"><span class="t-muted">Приватная сеть:</span><span>${esc(n.private)}</span><span class="t-muted">Публичная сеть:</span><span>${esc(n.public)}</span></div><div class="pop__row pop__row--last">Резервирование через <a class="kit-link" href="${esc(safeHref(n.link))}">${esc(n.reservation)}</a></div>`)}</div>
        <div class="foot__item t-body t-muted"><span>${esc(o.power?.text)}</span>${helpButton("psu", "Питание")}${popover("psu", "tooltip", "Питание", esc(o.power?.help))}</div>
        ${o.configurable ? `<button type="button" class="kit-action configure" data-configure>${ICONS.gear}<span>Сконфигурировать</span></button>` : ""}
        ${wideWords ? stock : ""}
      </div>`;

      return `<div class="card__grid">
        <div class="c-id"><div class="sku t-caption">${esc(o.sku)}</div>${badges}</div>
        <div class="c-cpu"><div class="t-body cpu__model">${esc(cpu.model)}</div>${vendor}</div>
        <div class="c-spec t-body">
          <div class="c-freq">${esc(cpu.frequency)}${unit(!wideWords, "ГГц")}</div>
          <div class="c-cores"><span class="cores__n">${cores}${unit(!wideWords, plural(cores, "ядро", "ядра", "ядер"))}</span>${chip}</div>
          <div class="c-threads"><div>${esc(o.cores?.total)}</div><div class="t-muted">${esc(o.cores?.threads)}</div></div>
          ${ram}
          ${disks}
        </div>
        ${wideWords ? priceBlock : ""}
      </div>
      ${foot}
      ${wideWords ? "" : `<div class="card__bottom">${priceBlock}${stock}</div>`}`;
    }

    function build(m) {
      closePop(true);
      mode = m;
      card.dataset.mode = m;
      card.innerHTML = html(m);
    }

    function fits() {
      const g = card.querySelector(".card__grid");
      return g.scrollWidth <= g.clientWidth + 0.5;
    }

    function layout() {
      if (destroyed) return;
      for (const m of MODES) {
        build(m);
        if (m === "compact" || fits()) break;
      }
    }

    // ---- popovers --------------------------------------------------------------------------------------------
    const trig = (key) => card.querySelector(`[data-pop="${key}"]`);
    const pop = (key) => card.querySelector(`[data-for="${key}"]`);

    function place(key) {
      const t = trig(key), p = pop(key);
      if (!t || !p) return;
      const r = t.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const gap = 10, m = 8;
      p.style.maxWidth = `${Math.min(320, vw - 2 * m)}px`;
      const w = p.offsetWidth, h = p.offsetHeight;
      const above = r.top - gap - h >= m || r.bottom + gap + h > vh - m;
      const top = above ? r.top - gap - h : r.bottom + gap;
      const cx = r.left + r.width / 2;
      const left = Math.max(m, Math.min(cx - 24, vw - w - m));
      p.dataset.side = above ? "top" : "bottom";
      p.style.setProperty("--tail-x", `${Math.max(12, Math.min(cx - left, w - 12))}px`);
      p.style.left = `${left + window.scrollX}px`;
      p.style.top = `${top + window.scrollY}px`;
    }

    function openPop(key) {
      if (openKey === key) return;
      closePop(false);
      const p = pop(key), t = trig(key);
      if (!p || !t) return;
      openKey = key;
      p.showPopover();
      t.setAttribute("aria-expanded", "true");
      place(key);
      document.addEventListener("keydown", onKey, true);
      document.addEventListener("pointerdown", onOutside, true);
      window.addEventListener("scroll", onMove, true);
      window.addEventListener("resize", onMove);
    }

    function closePop(silent) {
      clearTimeout(closeTimer);
      if (openKey === null) return;
      const key = openKey;
      openKey = null;
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onOutside, true);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      const p = pop(key), t = trig(key);
      try { if (p?.matches(":popover-open")) p.hidePopover(); } catch (e) { /* already closed */ }
      t?.setAttribute("aria-expanded", "false");
    }

    const onMove = () => { if (openKey) place(openKey); };
    const onKey = (e) => {
      if (e.key !== "Escape" || !openKey) return;
      const t = trig(openKey), inside = pop(openKey)?.contains(document.activeElement);
      closePop();
      if (inside) t?.focus();
    };
    const onOutside = (e) => {
      if (!openKey) return;
      if (trig(openKey)?.contains(e.target) || pop(openKey)?.contains(e.target)) return;
      closePop();
    };
    const within = (node, key) => !!node && (trig(key)?.contains(node) || pop(key)?.contains(node));
    const keyOf = (node) => node?.closest?.("[data-pop]")?.dataset.pop ?? node?.closest?.("[data-for]")?.dataset.for ?? null;

    card.addEventListener("pointerover", (e) => {
      if (e.pointerType !== "mouse") return;
      const key = keyOf(e.target);
      if (!key) return;
      clearTimeout(closeTimer);
      if (openKey !== key) openPop(key);
    });
    card.addEventListener("pointerout", (e) => {
      if (e.pointerType !== "mouse" || !openKey) return;
      if (!within(e.target, openKey) || within(e.relatedTarget, openKey)) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => closePop(), 150);
    });
    card.addEventListener("focusin", (e) => {
      const t = e.target.closest?.("[data-pop]");
      if (t && t.matches(":focus-visible")) { clearTimeout(closeTimer); openPop(t.dataset.pop); }
      else if (openKey && !within(e.target, openKey)) closePop();
    });
    card.addEventListener("focusout", (e) => {
      if (openKey && !within(e.relatedTarget, openKey) && within(e.target, openKey)) closePop();
    });
    card.addEventListener("click", (e) => {
      const t = e.target.closest?.("[data-pop]");
      if (t) {
        const key = t.dataset.pop;
        // A mouse has opened it by hovering; a tap or the keyboard toggles.
        if (e.pointerType === "mouse") openPop(key);
        else if (openKey === key) closePop(); else openPop(key);
        return;
      }
      if (e.target.closest?.("[data-configure]")) onConfigure?.(o.id);
    });

    // ---- the layout follows the element's own width ---------------------------------------------------------------
    function measure() {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w === lastWidth) return;
      lastWidth = w;
      layout();
    }
    layout();
    lastWidth = Math.round(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => { if (el.isConnected) measure(); });
      ro.observe(el);
    }
    document.fonts?.ready.then(() => { if (!destroyed && el.isConnected) layout(); });

    return { destroy() { destroyed = true; closePop(true); ro?.disconnect(); } };
  }

  function renderCard(el, o, opts) {
    instances.get(el)?.destroy();
    instances.set(el, createCard(el, o, opts));
  }
  window.renderCard = renderCard;
})();
