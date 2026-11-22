// The accepted card the frames were taken from: renderCards(host, items). Each card lays itself out from its own width
// (an observer per card, let go when the card leaves), and a chosen size is kept by item id across renders.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const WIDE = 640;
  const chosen = new Map();
  const observers = new Map();
  const setLayout = (card, width) => { card.dataset.layout = width >= WIDE ? "wide" : "compact"; };
  function watch(card) {
    const observer = new ResizeObserver(([entry]) => setLayout(card, entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width));
    observer.observe(card);
    observers.set(card, observer);
  }
  function unwatch(card) { observers.get(card)?.disconnect(); observers.delete(card); }

  const cardHtml = (item) => `<article class="card" data-id="${esc(item.id)}">
  <div class="card__main">
    <h3 class="card__title">${esc(item.title)}</h3>
    <p class="card__sku">${esc(item.sku)}</p>
    ${item.tags.length ? `<ul class="card__tags">${item.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>` : ""}
  </div>
  <div class="sizes" role="group" aria-label="Size">${item.sizes.map((s) => `<button class="size" type="button" aria-pressed="${chosen.get(item.id) === s}">${esc(s)}</button>`).join("")}</div>
  <div class="card__buy">
    <p class="price">${esc(item.price)}</p>
    <p class="card__stock">${esc(item.stock)}</p>
    <button class="button details" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="sheet">Details</button>
  </div>
</article>`;

  function choose(card, size) {
    const id = card.dataset.id, next = chosen.get(id) === size ? undefined : size;
    if (next === undefined) chosen.delete(id); else chosen.set(id, next);
    for (const b of card.querySelectorAll(".size")) b.setAttribute("aria-pressed", String(b.textContent === next));
  }

  window.renderCards = function renderCards(host, items) {
    for (const card of host.querySelectorAll(".card")) unwatch(card);
    host.innerHTML = items.length ? `<div class="list">${items.map(cardHtml).join("")}</div>` : `<p class="empty">Nothing matches your search.</p>`;
    for (const card of host.querySelectorAll(".card")) {
      setLayout(card, card.getBoundingClientRect().width);
      watch(card);
      card.querySelector(".sizes").addEventListener("click", (e) => { const b = e.target.closest(".size"); if (b) choose(card, b.textContent); });
    }
  };
})();
