// Homely UI kit: the popover. Opens on hover and on keyboard focus, by tap on touch screens; stays open while the
// pointer is over the trigger or the popover, and closes when it has left both, on Escape and on a tap elsewhere.
//
//   Kit.attachPopover(trigger, () => contentElementOrHtml)  →  { close() }
(function () {
  const open = new Set();
  function attachPopover(trigger, content) {
    let pop = null, timer = 0;
    const place = () => {
      const r = trigger.getBoundingClientRect();
      pop.style.left = `${Math.max(8, Math.min(r.left + scrollX, scrollX + innerWidth - pop.offsetWidth - 8))}px`;
      pop.style.top = `${r.bottom + scrollY + 6}px`;
    };
    const show = () => {
      clearTimeout(timer);
      if (pop) return;
      pop = document.createElement("div");
      pop.className = "kit-popover";
      pop.setAttribute("role", "tooltip");
      const c = content();
      if (typeof c === "string") pop.innerHTML = c; else pop.append(c);
      pop.addEventListener("pointerenter", () => clearTimeout(timer));
      pop.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") hideSoon(); });
      document.body.append(pop);
      place();
      trigger.setAttribute("aria-expanded", "true");
      open.add(api);
    };
    const hide = () => {
      clearTimeout(timer);
      if (!pop) return;
      pop.remove(); pop = null;
      trigger.setAttribute("aria-expanded", "false");
      open.delete(api);
    };
    const hideSoon = () => { clearTimeout(timer); timer = setTimeout(hide, 120); };
    const api = { close: hide, owns: (el) => trigger.contains(el) || (pop && pop.contains(el)) };
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") show(); });
    trigger.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") hideSoon(); });
    // Keyboard focus opens it; a tap toggles it; a mouse click leaves it to hover.
    let via = "";
    trigger.addEventListener("pointerdown", (e) => { via = e.pointerType; });
    trigger.addEventListener("focus", () => { if (!via) show(); });
    trigger.addEventListener("blur", () => { if (via !== "touch") hideSoon(); });
    trigger.addEventListener("click", (e) => { if (via === "touch") { e.preventDefault(); pop ? hide() : show(); } via = ""; });
    return api;
  }
  document.addEventListener("pointerdown", (e) => { for (const p of [...open]) if (!p.owns(e.target)) p.close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") for (const p of [...open]) p.close(); });
  window.Kit = Object.assign(window.Kit || {}, { attachPopover });
})();
