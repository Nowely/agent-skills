// The catalogue card: renderCards(host, items) renders the list into host, replacing what was there. The catalogue
// page calls it again on every search keystroke; other pages call it too. A card is laid out in one row when there is
// room for it, and stacked otherwise.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // One row from 640 px: the list's column is the window less the page's 16 px padding on each side.
  const wide = matchMedia("(min-width: 672px)");
  const layout = () => {
    for (const card of document.querySelectorAll(".card")) card.dataset.layout = wide.matches ? "wide" : "compact";
  };
  wide.addEventListener("change", layout);

  const cardHtml = (item) => `<article class="card" data-id="${esc(item.id)}">
  <div class="card__main">
    <h3 class="card__title">${esc(item.title)}</h3>
    <p class="card__sku">${esc(item.sku)}</p>
    <p class="card__tags">${item.tags.map(esc).join(", ")}</p>
  </div>
  <p class="card__sizes">Sizes: ${item.sizes.map(esc).join(" · ")}</p>
  <div class="card__buy">
    <p class="price">${esc(item.price)}</p>
    <p class="card__stock">${esc(item.stock)}</p>
    <button class="button details" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="sheet">Details</button>
  </div>
</article>`;

  window.renderCards = function renderCards(host, items) {
    host.innerHTML = items.length ? `<div class="list">${items.map(cardHtml).join("")}</div>` : `<p class="empty">Nothing matches your search.</p>`;
    layout();
  };
})();
