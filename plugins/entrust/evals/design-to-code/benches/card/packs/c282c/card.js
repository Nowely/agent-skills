// The server offer card. The catalogue, the configurator and the comparison page call renderCard(el, offer, { onConfigure }).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, few, many) => {
    const a = Math.abs(n) % 100, d = a % 10;
    return a > 10 && a < 20 ? many : d === 1 ? one : d > 1 && d < 5 ? few : many;
  };

  const ICON = {
    net: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2.5 13.5v-6h11v6zM5 7.5v-3h6v3M5 11v2.5M8 11v2.5M11 11v2.5"/></svg>`,
    deal: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 2.5 6 5.5l3.5-3M2.5 6.5 6 9.5l3.5-3"/></svg>`,
    low: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="7" width="2" height="3"/><rect x="5" y="4" width="2" height="6" opacity=".45"/><rect x="8" y="2" width="2" height="8" opacity=".45"/></svg>`,
    gear: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="7" cy="7" r="2"/><path d="M7 1.5v1.6M7 10.9v1.6M1.5 7h1.6M10.9 7h1.6M3.1 3.1l1.1 1.1M9.8 9.8l1.1 1.1M10.9 3.1 9.8 4.2M4.2 9.8l-1.1 1.1"/></svg>`,
  };

  // Popovers: one open at a time. Hover or keyboard focus opens one, it stays while the pointer is over the icon or
  // the popover, and it closes on Escape, on a tap elsewhere and when the pointer has left both. A tap toggles it.
  const OPEN = new Set();
  let uid = 0, listening = false;
  const closeAll = (except) => { for (const p of [...OPEN]) if (p !== except) p.close(); };
  function listen() {
    if (listening) return;
    listening = true;
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
    document.addEventListener("pointerdown", (e) => {
      for (const p of [...OPEN]) if (!p.owns(e.target)) p.close();
    }, true);
  }

  function popover(card, trigger, html, label) {
    listen();
    const pop = document.createElement("div");
    pop.className = "kit-popover c-pop";
    pop.id = `card-pop-${++uid}`;
    pop.setAttribute("role", "group");
    pop.setAttribute("aria-label", label);
    pop.innerHTML = html;
    const native = typeof pop.showPopover === "function";
    if (native) pop.setAttribute("popover", "manual"); else pop.hidden = true;
    card.append(pop);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", pop.id);

    let isOpen = false, timer = 0, hovered = 0, lastType = "";
    const inst = { owns: (n) => trigger.contains(n) || pop.contains(n), close, destroy };

    function place() {
      const t = trigger.getBoundingClientRect();
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const m = 8, gap = 10;
      pop.style.maxWidth = `${Math.min(320, vw - 2 * m)}px`;
      const w = pop.offsetWidth, h = pop.offsetHeight, cx = t.left + t.width / 2;
      const left = Math.min(Math.max(cx - 24, m), Math.max(m, vw - m - w));
      const above = t.top - gap - h >= m || t.top >= vh - t.bottom;
      const top = Math.min(Math.max(above ? t.top - gap - h : t.bottom + gap, m), Math.max(m, vh - m - h));
      pop.classList.toggle("c-pop--below", !above);
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
      pop.style.setProperty("--arrow-x", `${Math.min(Math.max(cx - left, 16), Math.max(16, w - 16))}px`);
    }
    function open() {
      clearTimeout(timer);
      if (isOpen || !trigger.isConnected) return;
      closeAll(inst);
      isOpen = true;
      if (native) pop.showPopover(); else pop.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      OPEN.add(inst);
      place();
      window.addEventListener("scroll", place, true);
      window.addEventListener("resize", place);
    }
    function close() {
      clearTimeout(timer);
      if (!isOpen) return;
      isOpen = false;
      if (native) { try { pop.hidePopover(); } catch (e) { /* already gone */ } } else pop.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      OPEN.delete(inst);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    }
    function destroy() { close(); pop.remove(); }
    const later = () => { clearTimeout(timer); timer = setTimeout(close, 150); };

    for (const el of [trigger, pop]) {
      el.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; hovered++; clearTimeout(timer); if (el === trigger) open(); });
      el.addEventListener("pointerleave", (e) => { if (e.pointerType !== "mouse") return; hovered = Math.max(0, hovered - 1); later(); });
      el.addEventListener("focusout", (e) => { if (!inst.owns(e.relatedTarget) && !hovered) close(); });
    }
    trigger.addEventListener("focus", () => { if (trigger.matches(":focus-visible")) open(); });
    trigger.addEventListener("pointerdown", (e) => { lastType = e.pointerType; });
    trigger.addEventListener("click", (e) => {
      const mouse = lastType === "mouse" && e.detail > 0;
      lastType = "";
      if (mouse) open(); else if (isOpen) close(); else open();
    });
    return inst;
  }

  const help = (label) => `<button type="button" class="kit-help c-help" aria-label="${esc(label)}" aria-expanded="false"></button>`;

  function renderCard(el, o, { onConfigure } = {}) {
    el.__offerCard?.forEach((p) => p.destroy());
    const n = o.network || {}, p = o.price || {}, pw = o.power || {}, cpu = o.cpu || {};
    const badges = (o.badges || []).map((b) => `<span class="kit-badge${b.tone === "accent" ? " kit-badge--accent" : ""}">${esc(b.text)}</span>`).join("");
    const disks = (o.disks || []).map((d) => `<div class="t-body c-disk"><span class="d-cs">${esc(d.count)} × ${esc(d.size)}</span><span class="d-sc">${esc(d.size)} × ${esc(d.count)}</span><span class="t-muted">${esc(d.type)}</span></div>`).join("");
    const price = `<span class="t-body c-price__text"><span class="nw">${esc(p.amount)}</span>${p.period ? ` <span class="nw">${esc(p.period)}</span>` : ""}</span>`
      + (p.discount ? `<button type="button" class="kit-icon kit-icon--deal c-deal" aria-label="Скидка" aria-expanded="false">${ICON.deal}</button>` : "");
    const stock = o.stock || {};
    el.innerHTML = `<article class="card"><div class="card__in">
  <div class="c-head">
    <div class="c-id"><div class="t-caption c-sku">${esc(o.sku)}</div>
    ${badges ? `<div class="c-badges">${badges}</div>` : ""}</div>
    <div class="c-cpu"><div class="t-body c-model">${esc(cpu.model)}</div><div class="t-muted c-vendor">${esc(cpu.vendor)}</div></div>
  </div>
  <div class="c-specs">
    <div class="t-body c-freq"><span>${esc(cpu.frequency)}</span><span class="u"> ГГц</span></div>
    <div class="t-body c-cores"><span class="c-cnt">${esc(cpu.cores)}<span class="u"> ${plural(cpu.cores, "ядро", "ядра", "ядер")}</span></span>${cpu.count > 1 ? `<span class="kit-chip c-chip">×${esc(cpu.count)}<span class="u">&nbsp;CPU</span></span>` : ""}</div>
    <div class="c-thr"><div class="t-body">${esc(o.cores?.total)}</div><div class="t-body t-muted">${esc(o.cores?.threads)}</div></div>
    <div class="c-ram"><span class="t-body">${esc(o.ram?.size)}<span class="u"> RAM</span></span><span class="t-body t-muted">${esc(o.ram?.type)}</span></div>
    <div class="c-disks">${disks}</div>
  </div>
  <div class="c-price">${price}</div>
  <div class="c-foot">
    <span class="t-body t-muted item c-net">${ICON.net}<span>${esc(n.text)}</span>${help("Скорость сетевых карт")}</span>
    <span class="t-body t-muted item c-psu"><span>${esc(pw.text)}</span>${help("Питание")}</span>
    ${o.configurable ? `<button type="button" class="kit-action c-conf">${ICON.gear}<span>Сконфигурировать</span></button>` : ""}
  </div>
  <div class="t-body t-muted c-stock"><span>Доступно ${esc(stock.count)}</span>${stock.low ? `<span class="kit-icon kit-icon--low" role="img" aria-label="Заканчивается" title="Заканчивается">${ICON.low}</span>` : ""}</div>
</div></article>`;
    const card = el.querySelector(".card");
    const made = [];
    const [netHelp, psuHelp] = card.querySelectorAll(".c-foot .c-help");
    made.push(popover(card, netHelp, `<div class="kit-popover__title">Скорость соединения сетевых карт</div>
<div class="c-pop__row t-muted">Приватная сеть: <span class="c-pop__v">${esc(n.private)}</span><br>Публичная сеть: <span class="c-pop__v">${esc(n.public)}</span></div>
${n.reservation ? `<div class="c-pop__row">Резервирование через <a class="kit-link" href="${esc(n.link || "#")}">${esc(n.reservation)}</a></div>` : ""}`, "Сеть"));
    made.push(popover(card, psuHelp, `<div>${esc(pw.help)}</div>`, "Питание"));
    const deal = card.querySelector(".c-deal");
    if (deal) made.push(popover(card, deal, `<div class="kit-popover__title">Скидка действует до ${esc(p.discount.until)}</div>
<div class="t-muted">Старая цена: <s>${esc(p.discount.old)}</s></div>`, "Скидка"));
    el.__offerCard = made;
    card.querySelector(".c-conf")?.addEventListener("click", () => onConfigure?.(o.id));
  }
  window.renderCard = renderCard;
})();
