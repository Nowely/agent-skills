// The server offer card. The catalogue, the configurator and the comparison page call
// renderCard(el, offer, { onConfigure }). The card lays itself out by its own width (container queries, card.css).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Russian plural for "ядро": 1 ядро, 2 ядра, 5 ядер.
  function cores(n) {
    const a = Math.abs(n) % 100, b = a % 10;
    return a > 10 && a < 20 ? "ядер" : b === 1 ? "ядро" : b >= 2 && b <= 4 ? "ядра" : "ядер";
  }

  const ICON = {
    net: `<svg class="c-neticon" width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M2 12V6.5L7 2l5 4.5V12z"/><path d="M5 12V9h4v3"/></svg>`,
    deal: `<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5 6 6l3.5-3.5M2.5 6.5 6 10l3.5-3.5"/></svg>`,
    low: `<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor"><rect x="3" y="3" width="1.8" height="6" rx=".6"/><rect x="7" y="7.2" width="1.8" height="1.8" rx=".6"/></svg>`,
    cfg: `<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M1.5 4h6M11 4h1.5M1.5 10H3M6.5 10h6"/><circle cx="9.2" cy="4" r="1.7"/><circle cx="4.8" cy="10" r="1.7"/></svg>`,
  };

  let uid = 0;
  let openPop = null; // { close } of the one popover open on the page
  let lastPointer = "mouse";

  // A popover opened by its trigger: hover or keyboard focus opens it, it stays while the pointer is over the
  // trigger or the popover, closes on leaving both, on Escape and on a tap elsewhere; on touch a tap toggles it.
  // Placement is CSS anchor positioning with fallbacks (card.css), so it stays in the window.
  function attach(trigger, pop) {
    const id = ++uid;
    const anchor = `--offer-a${id}`;
    pop.id = `offer-pop-${id}`;
    trigger.style.setProperty("anchor-name", anchor);
    pop.style.setProperty("position-anchor", anchor);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", pop.id);
    trigger.setAttribute("aria-haspopup", "true");
    let timer = 0, overTrigger = false, overPop = false, mouseDown = false;
    const isOpen = () => pop.matches(":popover-open");
    const self = { close };
    function open() {
      clearTimeout(timer);
      if (isOpen()) return;
      if (openPop && openPop !== self) openPop.close();
      pop.showPopover();
      trigger.setAttribute("aria-expanded", "true");
      openPop = self;
    }
    function close() {
      clearTimeout(timer);
      if (!isOpen()) return;
      pop.hidePopover();
      trigger.setAttribute("aria-expanded", "false");
      if (openPop === self) openPop = null;
    }
    const later = () => { clearTimeout(timer); timer = setTimeout(() => { if (!overTrigger && !overPop && !trigger.matches(":focus-visible")) close(); }, 150); };
    trigger.addEventListener("pointerenter", (e) => { lastPointer = e.pointerType; if (e.pointerType === "touch") return; overTrigger = true; open(); });
    trigger.addEventListener("pointerleave", (e) => { if (e.pointerType === "touch") return; overTrigger = false; later(); });
    pop.addEventListener("pointerenter", (e) => { if (e.pointerType === "touch") return; overPop = true; clearTimeout(timer); });
    pop.addEventListener("pointerleave", (e) => { if (e.pointerType === "touch") return; overPop = false; later(); });
    trigger.addEventListener("pointerdown", (e) => { lastPointer = e.pointerType; mouseDown = true; });
    trigger.addEventListener("focus", () => { if (!mouseDown) open(); });
    trigger.addEventListener("blur", () => { mouseDown = false; later(); });
    trigger.addEventListener("click", () => { if (lastPointer === "touch") (isOpen() ? close() : open()); else open(); mouseDown = false; });
    trigger.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); isOpen() ? close() : open(); } });
    document.addEventListener("pointerdown", (e) => { if (isOpen() && !trigger.contains(e.target) && !pop.contains(e.target)) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) close(); });
  }

  // The widest mode whose content fits the card's own width; re-chosen whenever the container resizes.
  // A mode is also not used below the width at which the design first draws it (the frames: A 764, B 601, C 486).
  const MODES = [["A", 700], ["B", 540], ["C", 430], ["D", 0]];
  function fits(card, mode, min) {
    card.dataset.mode = mode;
    if (mode === "D") return true;
    if (card.clientWidth < min) return false;
    if (card.scrollWidth > card.clientWidth) return false;
    if (mode === "C") return new Set([...card.querySelector(".c-specs").children].map((c) => c.offsetTop)).size === 1;
    return true;
  }
  function layout(card, host) {
    const run = () => { for (const [m, min] of MODES) if (fits(card, m, min)) break; };
    run();
    if (typeof ResizeObserver === "function") new ResizeObserver(run).observe(host);
  }

  function renderCard(el, o, { onConfigure } = {}) {
    const n = o.network || {}, p = o.price || {}, cpu = o.cpu, d = p.discount;
    const price = `<span class="t-price c-amount">${esc(p.amount)}${p.period ? ` ${esc(p.period)}` : ""}</span>`;
    el.innerHTML = `<div class="offer"><article class="card" data-mode="D">
  <div class="c-id">
    <div class="t-caption c-sku">${esc(o.sku)}</div>
    ${o.badges?.length ? `<div class="c-badges">${o.badges.map((b) => `<span class="kit-badge${b.tone === "accent" ? " kit-badge--accent" : ""}">${esc(b.text)}</span>`).join("")}</div>` : ""}
  </div>
  <div class="c-cpu"><div class="t-body c-model">${esc(cpu.model)}</div><div class="c-vendor" role="img" aria-label="${esc(cpu.vendor)}">${esc(cpu.vendor)}</div></div>
  <div class="c-specs">
    <div class="t-body c-freq"><span class="nw">${esc(cpu.frequency)}<span class="u"> ГГц</span></span></div>
    <div class="c-cc">
      <div class="c-pc"><span class="t-body nw">${esc(cpu.cores)}<span class="u"> ${cores(cpu.cores)}</span></span><span class="kit-chip nw">×${esc(cpu.count)}<span class="u cpu-u">&nbsp;CPU</span></span></div>
      <div class="c-cores"><div class="t-body">${esc(o.cores.total)}</div><div class="t-body t-muted">${esc(o.cores.threads)}</div></div>
    </div>
    <div class="c-ram"><span class="t-body nw">${esc(o.ram.size)}<span class="u"> RAM</span></span> <span class="t-body t-muted c-ramtype">${esc(o.ram.type)}</span></div>
    <ul class="c-disks">${o.disks.map((g) => `<li class="t-body"><span class="nw"><span class="ab">${esc(g.count)} × ${esc(g.size)}</span><span class="ba">${esc(g.size)} × ${esc(g.count)}</span></span><span class="t-muted">${esc(g.type)}</span></li>`).join("")}</ul>
  </div>
  <div class="c-foot t-body t-muted">
    <span class="c-fi">${ICON.net}<span class="nw">${esc(n.text)}</span><button type="button" class="kit-help c-nethelp" aria-label="Скорость соединения">?</button></span>
    <span class="c-fi"><span class="nw">${esc(o.power.text)}</span><button type="button" class="kit-help c-powerhelp" aria-label="Питание">?</button></span>
    ${o.configurable ? `<button type="button" class="kit-action c-configure">${ICON.cfg}<span>Сконфигурировать</span></button>` : ""}
  </div>
  <div class="c-ps">
    <div class="c-price">${d ? `<span class="c-deal"><button type="button" class="kit-icon kit-icon--deal c-dealbtn" aria-label="Скидка до ${esc(d.until)}">${ICON.deal}</button></span>` : ""}${price}</div>
    <div class="c-stock t-body t-muted"><span class="c-stocktext nw">Доступно ${esc(o.stock.count)}</span>${o.stock.low ? `<span class="kit-icon kit-icon--low c-lowicon" role="img" aria-label="Заканчивается">${ICON.low}</span>` : ""}</div>
  </div>
</article></div>`;
    const root = el.querySelector(".offer");
    function popover(cls, html) {
      const pop = document.createElement("div");
      pop.className = `kit-popover offer-pop ${cls}`;
      pop.setAttribute("popover", "manual");
      pop.innerHTML = html;
      root.append(pop);
      return pop;
    }
    attach(el.querySelector(".c-nethelp"), popover("c-netpop", `<div class="kit-popover__title">Скорость соединения сетевых карт</div>
<div><span class="t-muted">Приватная сеть:</span> ${esc(n.private)}</div>
<div><span class="t-muted">Публичная сеть:</span> ${esc(n.public)}</div>
${n.reservation ? `<div class="offer-pop__gap">Резервирование через ${n.link ? `<a class="kit-link" href="${esc(n.link)}">${esc(n.reservation)}</a>` : esc(n.reservation)}</div>` : ""}`));
    attach(el.querySelector(".c-powerhelp"), popover("c-powerpop", esc(o.power.help)));
    if (d) attach(el.querySelector(".c-dealbtn"), popover("c-dealpop", `<div class="kit-popover__title">Скидка до ${esc(d.until)}</div><div><span class="t-muted">Старая цена:</span> <s>${esc(d.old)}</s></div>`));
    layout(el.querySelector(".card"), root);
    el.querySelector(".c-configure")?.addEventListener("click", () => onConfigure?.(o.id));
  }
  window.renderCard = renderCard;
})();
