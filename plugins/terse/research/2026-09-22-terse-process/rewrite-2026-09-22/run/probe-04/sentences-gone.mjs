// Sentences of FROM that do not occur verbatim (whitespace-normalised) in TO, with their word counts.
// Usage: node sentences-gone.mjs FROM.md TO.md
import fs from "node:fs";
const [a, b] = process.argv.slice(2);
const norm = (s) => s.replace(/\s+/g, " ").trim();
const split = (t) => norm(t.replace(/^#.*$/gm, "\n").replace(/```[\s\S]*?```/g, "\n")).split(/(?<=[.!?:])\s+(?=[A-Z*`(\-])/).map(norm).filter(Boolean);
const A = split(fs.readFileSync(a, "utf8")), B = norm(fs.readFileSync(b, "utf8"));
for (const s of A) if (!B.includes(s.replace(/^- /, ""))) console.log(String(s.split(" ").length).padStart(3), " ", s);
