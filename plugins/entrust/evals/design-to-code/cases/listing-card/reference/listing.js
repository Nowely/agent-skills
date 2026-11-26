// The listing card, new design (the case's answer: never given to the implementer).
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tone = (t) => (t ? ` kit-badge--${t}` : "");
  function renderListing(el, data, { onEdit } = {}) {
    const p = data.price;
    el.innerHTML = `<div class="listing-box"><article class="listing">
  <div class="listing__main">
    <h3 class="listing__title t-title">${esc(data.title)}</h3>
    <p class="listing__address t-caption">${esc(data.address)}</p>
    ${data.badges.length ? `<div class="listing__badges">${data.badges.map((b) => `<span class="kit-badge${tone(b.tone)}">${esc(b.text)}</span>`).join("")}</div>` : ""}
  </div>
  <dl class="listing__specs t-body">${data.specs.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.unit)}</dd></div>`).join("")}</dl>
  <div class="listing__price">
    <div><span class="t-price">${esc(p.amount)}</span> <span class="t-small t-muted">${esc(p.period)}</span></div>
    ${p.old ? `<div class="listing__deal"><s class="t-small t-muted">${esc(p.old)}</s><button type="button" class="kit-badge kit-badge--sale">${esc(p.discount)}</button></div>` : ""}
  </div>
  <div class="listing__footer">
    <span class="listing__availability t-small">${esc(data.availability.text)}</span>
    <button type="button" class="kit-help" aria-label="About viewing">?</button>
    ${data.editable ? `<button type="button" class="kit-button listing__edit">Edit listing</button>` : ""}
  </div>
</article></div>`;
    Kit.attachPopover(el.querySelector(".kit-help"), () => esc(data.availability.help));
    const sale = el.querySelector(".kit-badge--sale");
    if (sale) Kit.attachPopover(sale, () => `<div class="deal-pop">
  <div class="deal-pop__row"><span class="t-muted">Old price</span><s>${esc(p.old)}</s></div>
  <div class="deal-pop__row"><span class="t-muted">New price</span><b>${esc(p.amount)}</b></div>
  <div class="deal-pop__until t-caption">Discount until ${esc(p.until)}</div>
</div>`);
    el.querySelector(".listing__edit")?.addEventListener("click", () => onEdit?.(data.id));
  }
  window.renderListing = renderListing;
})();
