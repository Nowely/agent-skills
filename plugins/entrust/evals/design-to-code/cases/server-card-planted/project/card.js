// The server offer card. The catalogue, the configurator and the comparison page call renderCard(el, offer, { onConfigure }).
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // A small hint next to its icon.
  function hint(icon, html) {
    let box = null, timer = 0;
    icon.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      if (box) return;
      box = document.createElement("div");
      box.className = "hint";
      box.innerHTML = html;
      box.addEventListener("mouseenter", () => clearTimeout(timer));
      icon.after(box);
    });
    icon.addEventListener("mouseleave", () => { timer = setTimeout(() => { if (box) { box.remove(); box = null; } }, 200); });
  }

  function renderCard(el, o, { onConfigure } = {}) {
    const n = o.network;
    el.innerHTML = `<div class="card">
  <div class="sku">${esc(o.sku)}</div>
  <div>${o.badges.map((b) => `<span class="badge">${esc(b.text)}</span>`).join(" ")}</div>
  <div class="cpu">${esc(o.cpu.model)} (${esc(o.cpu.vendor)}), ${esc(o.cpu.frequency)} GHz, ${o.cpu.cores} × ${o.cpu.count}</div>
  <div>${esc(o.cores.total)}, ${esc(o.cores.threads)}; RAM ${esc(o.ram.size)} ${esc(o.ram.type)}</div>
  <div>${o.disks.map((d) => `${d.count} × ${esc(d.size)} ${esc(d.type)}`).join(", ")}</div>
  <div class="net">${esc(n.text)} <span class="q net-q">?</span> · ${esc(o.power.text)} <span class="q psu-q">?</span></div>
  <div class="price">${esc(o.price.amount)} ${esc(o.price.period ?? "")}</div>
  <div class="stock">${o.stock.low ? "Мало" : `Доступно ${o.stock.count}`}</div>
  ${o.configurable ? `<a href="#" class="configure">Configure</a>` : ""}
</div>`;
    hint(el.querySelector(".net-q"), `Private ${esc(n.private)}, public ${esc(n.public)}`);
    hint(el.querySelector(".psu-q"), esc(o.power.help));
    el.querySelector(".configure")?.addEventListener("click", (e) => { e.preventDefault(); onConfigure?.(o.id); });
  }
  window.renderCard = renderCard;
})();
