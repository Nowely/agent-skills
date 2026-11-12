// Who uses whom: each node below every node that uses it, an arrow from user to used. The boxes are markup, so
// the browser wraps and cuts their text in any language; only the arrows are drawn.
// A node is { name, uses, label, meta, tone, href, share }: `tone` is a class of the page's style, `share`
// a list of { tone, part } drawn as a bar along the node's foot.
import { esc } from "./text.mjs";

const W = 200, H = 76, GAP_X = 24, GAP_Y = 40, PER_ROW = 4;

// Rows of nodes, callers first. A cycle stops sinking after one pass per node.
function rowsOf(nodes) {
  const row = new Map(nodes.map((n) => [n.name, 0]));
  for (let pass = 1; pass < nodes.length; pass++)
    for (const n of nodes) for (const used of n.uses) if (used !== n.name && row.get(used) <= row.get(n.name)) row.set(used, row.get(n.name) + 1);
  const rows = [];
  for (const n of nodes) (rows[row.get(n.name)] ??= []).push(n);
  return rows.filter(Boolean);
}

function box(n, { x, y }) {
  const total = n.share.reduce((sum, s) => sum + s.part, 0), tag = n.href ? "a" : "div";
  const bar = n.share.filter((s) => s.part).map((s) => `<span class="${s.tone}" style="width:${(100 * s.part / total).toFixed(1)}%"></span>`).join("");
  return `<${tag} class="unit ${n.tone}"${n.href ? ` href="${esc(n.href)}"` : ""} style="left:${x}px;top:${y}px" title="${esc(`${n.name}: ${n.label}`)}">`
    + `<strong>${esc(n.name)}</strong><span class="jobs">${esc(n.label)}</span><span class="meta">${esc(n.meta)}</span>${bar ? `<span class="part">${bar}</span>` : ""}</${tag}>`;
}

export function diagram(nodes, label) {
  if (!nodes.length) return "";
  const rows = rowsOf(nodes), at = new Map(), span = (count) => count * (W + GAP_X) - GAP_X;
  const width = span(Math.min(PER_ROW, Math.max(...rows.map((row) => row.length))));
  let y = 0;
  for (const row of rows) {
    // Under its users, to keep the arrows from crossing more than they must.
    const users = (n) => nodes.filter((u) => u.uses.includes(n.name) && at.has(u.name)).map((u) => at.get(u.name).x);
    const mean = (n) => users(n).reduce((sum, x, _, all) => sum + x / all.length, 0);
    row.sort((a, b) => mean(a) - mean(b));
    // A row too wide to read wraps onto the next line.
    for (let start = 0; start < row.length; start += PER_ROW, y += H + GAP_Y) {
      const line = row.slice(start, start + PER_ROW);
      line.forEach((n, i) => at.set(n.name, { x: (width - span(line.length)) / 2 + i * (W + GAP_X), y }));
    }
  }
  const height = y - GAP_Y;
  const arrows = nodes.flatMap((n) => n.uses.filter((used) => used !== n.name && at.has(used)).map((used) => {
    const from = at.get(n.name), to = at.get(used), x1 = from.x + W / 2, y1 = from.y + H, x2 = to.x + W / 2, y2 = to.y;
    return `<path class="edge" d="M${x1} ${y1} C${x1} ${y1 + GAP_Y / 2}, ${x2} ${y2 - GAP_Y / 2}, ${x2} ${y2 - 6}"/><path class="head" d="M${x2 - 4} ${y2 - 7} L${x2 + 4} ${y2 - 7} L${x2} ${y2 - 1} Z"/>`;
  }));
  return `<div class="graph" role="img" aria-label="${esc(label)}" style="width:${width}px;height:${height}px;--w:${W}px;--h:${H}px">`
    + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true">${arrows.join("")}</svg>`
    + `${nodes.map((n) => box(n, at.get(n.name))).join("")}</div>`;
}
