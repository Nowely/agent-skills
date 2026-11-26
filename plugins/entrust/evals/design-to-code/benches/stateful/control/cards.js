// The catalogue: a list of cards that the search empties and restores, a sidebar that narrows the list, and a sheet
// with a card's details that is hidden when its slide-out transition ends.
const WIDE = 640; // a card at least this wide lays itself out in one row
const ITEMS = window.CATALOGUE[new URLSearchParams(location.search).get("data") ?? "default"] ?? window.CATALOGUE.default;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cardHtml = (item) => `<article class="card" data-layout="wide" data-id="${esc(item.id)}">
  <div class="card__main">
    <h3 class="card__title">${esc(item.title)}</h3>
    <p class="card__sku">${esc(item.sku)}</p>
    <ul class="card__tags">${item.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>
  </div>
  <div class="sizes">${item.sizes.map((s) => `<span class="size">${esc(s)}</span>`).join("")}</div>
  <div class="card__buy">
    <p class="price">${esc(item.price)}</p>
    <p class="card__stock">${esc(item.stock)}</p>
    <button class="button details" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="sheet">Details</button>
  </div>
</article>`;

// Each card chooses its layout from its own width, as a component with a ResizeObserver does.
const observers = new Map();
function watch(card) {
  const observer = new ResizeObserver(([entry]) => { card.dataset.layout = entry.contentRect.width >= WIDE ? "wide" : "compact"; });
  observer.observe(card);
  observers.set(card, observer);
}
function unwatch(card) {
  observers.get(card)?.disconnect();
  observers.delete(card);
}

function renderCards(host, items) {
  for (const card of host.querySelectorAll(".card")) unwatch(card); // let go of the cards leaving
  host.innerHTML = items.length ? `<div class="list">${items.map(cardHtml).join("")}</div>` : `<p class="empty">Nothing matches your search.</p>`;
  for (const card of host.querySelectorAll(".card")) watch(card); // observe the cards mounted now
}

const host = document.getElementById("host");
renderCards(host, ITEMS);

const search = document.getElementById("q");
search.addEventListener("input", () => {
  const term = search.value.trim().toLowerCase();
  renderCards(host, ITEMS.filter((item) => item.title.toLowerCase().includes(term)));
});

const toggle = document.getElementById("filters"), sidebar = document.getElementById("sidebar");
toggle.addEventListener("click", () => {
  const open = sidebar.hidden;
  sidebar.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
});

const sheet = document.getElementById("sheet"), panel = sheet.querySelector(".sheet__panel");
let opener = null;
function openSheet(button) {
  const item = ITEMS.find((i) => i.id === button.closest(".card").dataset.id);
  sheet.querySelector(".sheet__title").textContent = item.title;
  sheet.querySelector(".sheet__body").textContent = `${item.sku} · ${item.stock}`;
  opener = button;
  sheet.hidden = false;
  void panel.offsetWidth; // the slide starts from below
  sheet.classList.add("open");
  button.setAttribute("aria-expanded", "true");
}
function closeSheet() {
  if (!sheet.classList.contains("open")) return;
  sheet.classList.remove("open");
  opener?.setAttribute("aria-expanded", "false");
}
// Hidden once the panel has slid out.
panel.addEventListener("transitionend", (e) => {
  if (e.target === panel && e.propertyName === "transform" && !sheet.classList.contains("open")) sheet.hidden = true;
});
host.addEventListener("click", (e) => { const button = e.target.closest(".details"); if (button) openSheet(button); });
sheet.querySelector(".sheet__close").addEventListener("click", closeSheet);
sheet.querySelector(".sheet__backdrop").addEventListener("click", closeSheet);
