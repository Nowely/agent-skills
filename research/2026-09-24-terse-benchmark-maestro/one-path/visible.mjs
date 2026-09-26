import fs from "node:fs";
const t = fs.readFileSync(process.argv[2], "utf8").split("\n");
let n = 0;
for (let l of t) {
  if (/^\s*(```|~~~)/.test(l)) continue;
  if (/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l)) continue;
  l = l.replace(/<\/?(p|img|a|div|picture|source|br)\b[^>]*>/gi, " ");
  l = l.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1");
  l = l.replace(/^\s*#{1,6}\s+/, "").replace(/^\s*([-*+]|\d+\.)\s+/, "");
  for (const w of l.split(/\s+/)) if (/[\p{L}\p{N}]/u.test(w)) n++;
}
console.log(n);
