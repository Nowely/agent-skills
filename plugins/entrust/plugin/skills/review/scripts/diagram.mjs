// Who uses whom, drawn as inline SVG: each node below every node that uses it, an arrow from user to used.
// A node is { name, uses, label, meta, tone, href, share }: `tone` is a class of the page's style, `share`
// a list of { tone, part } drawn as a bar along the node's foot.
import { clip, esc } from "./text.mjs";

const W = 196, H = 64, GAP_X = 24, GAP_Y = 42, PAD = 4;

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
  const total = n.share.reduce((sum, s) => sum + s.part, 0);
  let left = 1;
  const bar = n.share.filter((s) => s.part).map((s) => {
    const width = (W - 2) * s.part / total, rect = `<rect class="share ${s.tone}" x="${left.toFixed(1)}" y="${H - 5}" width="${width.toFixed(1)}" height="4"/>`;
    left += width;
    return rect;
  }).join("");
  const body = `<g class="unit ${n.tone}" transform="translate(${x},${y})"><title>${esc(`${n.name}: ${n.label}`)}</title><rect class="box" width="${W}" height="${H}" rx="4"/>`
    + `<text x="10" y="19">${esc(clip(n.name, 25))}</text><text class="jobs" x="10" y="35">${esc(clip(n.label, 34))}</text><text class="meta" x="10" y="51">${esc(n.meta)}</text>${bar}</g>`;
  return n.href ? `<a href="${esc(n.href)}">${body}</a>` : body;
}

export function diagram(nodes, label) {
  if (!nodes.length) return "";
  const rows = rowsOf(nodes), at = new Map();
  const width = Math.max(...rows.map((row) => row.length)) * (W + GAP_X) - GAP_X + 2 * PAD, height = rows.length * (H + GAP_Y) - GAP_Y + 2 * PAD;
  rows.forEach((row, r) => {
    // Under its users, to keep the arrows from crossing more than they must.
    const users = (n) => nodes.filter((u) => u.uses.includes(n.name) && at.has(u.name)).map((u) => at.get(u.name).x);
    const mean = (n) => users(n).reduce((sum, x, _, all) => sum + x / all.length, 0);
    if (r) row.sort((a, b) => mean(a) - mean(b));
    row.forEach((n, i) => at.set(n.name, { x: (width - (row.length * (W + GAP_X) - GAP_X)) / 2 + i * (W + GAP_X), y: PAD + r * (H + GAP_Y) }));
  });
  const arrows = nodes.flatMap((n) => n.uses.filter((used) => used !== n.name && at.has(used)).map((used) => {
    const from = at.get(n.name), to = at.get(used), x1 = from.x + W / 2, y1 = from.y + H, x2 = to.x + W / 2, y2 = to.y;
    return `<path class="edge" d="M${x1} ${y1} C${x1} ${y1 + GAP_Y / 2}, ${x2} ${y2 - GAP_Y / 2}, ${x2} ${y2 - 6}"/><path class="head" d="M${x2 - 4} ${y2 - 7} L${x2 + 4} ${y2 - 7} L${x2} ${y2 - 1} Z"/>`;
  }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(label)}">`
    + `${arrows.join("")}${nodes.map((n) => box(n, at.get(n.name))).join("")}</svg>`;
}
