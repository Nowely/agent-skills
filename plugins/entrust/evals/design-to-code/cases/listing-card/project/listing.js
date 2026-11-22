// The listing card. Other pages call renderListing(el, data, { onEdit }); see README.md for the data.
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // A small hint shown next to its icon.
  function hint(icon, text) {
    let box = null, timer = 0;
    icon.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      if (box) return;
      box = document.createElement("div");
      box.className = "hint";
      box.textContent = text;
      box.addEventListener("mouseenter", () => clearTimeout(timer));
      icon.after(box);
    });
    icon.addEventListener("mouseleave", () => {
      timer = setTimeout(() => { if (box) { box.remove(); box = null; } }, 200);
    });
  }

  function renderListing(el, data, { onEdit } = {}) {
    const p = data.price;
    el.innerHTML = `<div class="listing">
  <h3>${esc(data.title)}</h3>
  <div class="address">${esc(data.address)}</div>
  <div class="badges">${data.badges.map((b) => `<span class="badge">${esc(b.text)}</span>`).join(" ")}</div>
  <div class="specs">${data.specs.map((s) => `${esc(s.value)} ${esc(s.unit)}`).join(" · ")}</div>
  <div class="price">${esc(p.amount)} ${esc(p.period)}${p.old ? ` <span class="old">(was ${esc(p.old)})</span>` : ""}</div>
  <div class="availability">${esc(data.availability.text)} <span class="hint-icon">?</span></div>
  ${data.editable ? `<a href="#" class="edit">Edit</a>` : ""}
</div>`;
    hint(el.querySelector(".hint-icon"), data.availability.help);
    const edit = el.querySelector(".edit");
    if (edit) edit.addEventListener("click", (e) => { e.preventDefault(); onEdit?.(data.id); });
  }
  window.renderListing = renderListing;
})();
