// The catalogue page, a consumer of card.js: the search re-renders the list on every keystroke (emptying it when
// nothing matches), Filters opens a sidebar beside the list, and a card's Details opens a sheet that is hidden when
// its slide-out transition ends. Other pages call renderCards(host, items) the same way.
const ITEMS = window.CATALOGUE[new URLSearchParams(location.search).get("data") ?? "default"] ?? window.CATALOGUE.default;
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
  const item = ITEMS.find((i) => i.id === button.closest("[data-id]").dataset.id);
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
panel.addEventListener("transitionend", (e) => {
  if (e.target === panel && e.propertyName === "transform" && !sheet.classList.contains("open")) sheet.hidden = true;
});
host.addEventListener("click", (e) => { const button = e.target.closest(".details"); if (button) openSheet(button); });
sheet.querySelector(".sheet__close").addEventListener("click", closeSheet);
sheet.querySelector(".sheet__backdrop").addEventListener("click", closeSheet);
