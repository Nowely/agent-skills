import fs from "node:fs";
const lines = fs.readFileSync(process.argv[2], "utf8").split("\n");
let inFence = false; const prose = [];
for (let l of lines) {
  if (/^\s*(```|~~~)/.test(l)) { inFence = !inFence; continue; }
  if (inFence || /^\s*\|/.test(l) || /^\s*#/.test(l) || /^\s*<[^>]+>\s*$/.test(l) || !l.trim()) { prose.push("\n"); continue; }
  l = l.replace(/<[^>]+>/g, " ").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^\s*([-*+]|\d+\.)\s+/, "");
  prose.push(l);
}
const text = prose.join(" ").replace(/\s*\n\s*/g, "\n");
const sents = text.split(/(?<=[.!?:])\s+(?=[A-Z`/*(])|\n/).map(s => s.trim()).filter(s => /[A-Za-z]/.test(s));
const W = s => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const ws = sents.map(W).filter(n => n >= 3).sort((a, b) => a - b);
const codes = sents.map(s => (s.match(/`[^`]+`/g) || []).length);
const mean = ws.reduce((a, b) => a + b, 0) / ws.length;
console.log([process.argv[3].padEnd(10), "sent=" + ws.length, "mean=" + mean.toFixed(1), "median=" + ws[Math.floor(ws.length / 2)], ">25w=" + ws.filter(n => n > 25).length, "max=" + ws[ws.length - 1], "code/sent=" + (codes.reduce((a, b) => a + b, 0) / sents.length).toFixed(2)].join("  "));
