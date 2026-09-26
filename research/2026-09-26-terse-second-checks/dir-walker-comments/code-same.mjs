// usage: node code-same.mjs <original.rs> <new.rs>
// Strips // and /* */ comments outside double-quoted strings, drops trailing space and blank lines,
// and compares what is left line by line. Also lists comments whose kind changed to /// or //!.
import { readFileSync } from 'node:fs';
function strip(src) {
  let out = '', i = 0, depth = 0, inStr = false;
  const kinds = [];
  let line = 1;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '\n') line++;
    if (depth > 0) {
      if (c === '/' && n === '*') { depth++; i += 2; continue; }
      if (c === '*' && n === '/') { depth--; i += 2; continue; }
      if (c === '\n') out += '\n';
      i++; continue;
    }
    if (inStr) {
      out += c;
      if (c === '\\') { out += n; i += 2; continue; }
      if (c === '"') inStr = false;
      i++; continue;
    }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === '/' && n === '/') {
      const end = src.indexOf('\n', i);
      const text = src.slice(i, end < 0 ? src.length : end);
      kinds.push({ line, kind: text.startsWith('///') ? '///' : text.startsWith('//!') ? '//!' : '//' });
      i = end < 0 ? src.length : end; continue;
    }
    if (c === '/' && n === '*') { depth = 1; i += 2; continue; }
    out += c; i++;
  }
  const code = out.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l !== '');
  return { code, kinds };
}
const [a, b] = process.argv.slice(2).map((f) => strip(readFileSync(f, 'utf8')));
let diffs = 0;
const max = Math.max(a.code.length, b.code.length);
for (let k = 0; k < max; k++) {
  if (a.code[k] !== b.code[k]) {
    diffs++;
    if (diffs <= 10) console.log(`code line ${k + 1} differs:\n  - ${a.code[k] ?? '(none)'}\n  + ${b.code[k] ?? '(none)'}`);
  }
}
const count = (s, k) => s.kinds.filter((x) => x.kind === k).length;
console.log(`code lines: ${a.code.length} vs ${b.code.length}; differing: ${diffs}`);
console.log(`comment lines: // ${count(a, '//')} -> ${count(b, '//')}, /// ${count(a, '///')} -> ${count(b, '///')}, //! ${count(a, '//!')} -> ${count(b, '//!')}`);
process.exit(diffs === 0 ? 0 : 1);
