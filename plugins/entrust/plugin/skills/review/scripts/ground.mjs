// What a record says against the code it is about, read mechanically: every quoted place checked at its file and line
// at the reviewed commit, and the entry points a script finds in the changed code — the functions the change touches
// and their callers, dispatch cases, listeners, handlers, routes — matched against the record's routes. The script's
// list is never complete: static search misses calls made through names it cannot see, and finds functions that are no
// behaviour. What it is for is the disagreement: a quote that is not where it says, and a place no route follows.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { address } from "./diff.mjs";
import { purposeOfPath, sameRevision } from "./review.mjs";

const git = (dir, args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
const strip = (s) => String(s).replace(/\s+/g, "");
// A place `path:line` or `path:line-line`; one marked `(base)` is at the base and is not read here.
const placeOf = (at) => { const m = /^(.+?):(\d+)(?:-(\d+))?$/.exec(String(at).trim()); return m ? { path: m[1], from: +m[2], to: +(m[3] ?? m[2]) } : null; };
const looksLikeFile = (p) => /[/\\]/.test(p) || /\.[A-Za-z0-9]{1,6}$/.test(p);

// The checkout a review was made from: its top level and the commit it is at, or the directory alone when it is no git
// checkout. Files are read at that commit, so a later checkout, rebase or edit of the working tree changes nothing.
export function checkoutOf(dir) {
  const top = git(dir, ["rev-parse", "--show-toplevel"]);
  if (top.status !== 0) return { root: path.resolve(dir), sha: null };
  const root = top.stdout.trim(), head = git(root, ["rev-parse", "HEAD"]);
  return { root, sha: head.status === 0 ? head.stdout.trim() : null };
}
// A file's lines in a root, never outside it: at a commit through git, or on disk for a directory. A directory is no
// file, and a line keeps no carriage return. `many` reads a list of files at the commit in one git process.
const linesOf = (text) => text.split("\n").map((l) => l.replace(/\r$/, ""));
function reader(root, sha) {
  const cache = new Map();
  const inside = (rel) => { const abs = path.resolve(root, rel); return abs !== root && abs.startsWith(root + path.sep) ? path.relative(root, abs).split(path.sep).join("/") : null; };
  const many = (rels) => {
    const want = [...new Set(rels)].filter((rel) => !cache.has(rel));
    if (!sha) { for (const rel of want) read(rel); return; }
    const ok = want.filter((rel) => { const at = inside(rel); if (!at || /\n/.test(at)) { cache.set(rel, null); return false; } return true; });
    if (!ok.length) return;
    const r = spawnSync("git", ["-C", root, "cat-file", "--batch"], { input: ok.map((rel) => `${sha}:${inside(rel)}\n`).join(""), maxBuffer: 1024 * 1024 * 1024 });
    const out = r.status === 0 ? r.stdout : Buffer.alloc(0);
    let at = 0;
    for (const rel of ok) {
      const eol = out.indexOf(10, at);
      if (eol < 0) { cache.set(rel, null); continue; }
      const head = out.subarray(at, eol).toString("utf8").split(" ");
      at = eol + 1;
      if (head.length !== 3) { cache.set(rel, null); continue; }
      const size = +head[2];
      cache.set(rel, head[1] === "blob" ? linesOf(out.subarray(at, at + size).toString("utf8")) : null);
      at += size + 1;
    }
  };
  const read = (rel) => {
    if (cache.has(rel)) return cache.get(rel);
    if (sha) { many([rel]); return cache.get(rel) ?? null; }
    let lines = null;
    const abs = path.resolve(root, rel);
    if (inside(rel) && fs.existsSync(abs)) {
      try { const real = fs.realpathSync(abs); if (real.startsWith(fs.realpathSync(root) + path.sep) && fs.statSync(real).isFile()) lines = linesOf(fs.readFileSync(real, "utf8")); } catch { lines = null; }
    }
    cache.set(rel, lines);
    return lines;
  };
  read.many = many;
  return read;
}

// Every {at, quote} in the record that claims the reviewed code or the files beside the record. A reply's place is in
// the previous review's diff, and the previous record and the comparison inventory have their own: none is read here.
export function quotedPlaces(review) {
  const out = [], SKIP = new Set(["diff", "replies", "previous", "comparisonReview"]);
  const walk = (v, where) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${where}/${i}`));
    if (!v || typeof v !== "object") return;
    if (typeof v.at === "string" && typeof v.quote === "string" && v.quote.trim()) out.push({ who: where || "/", at: v.at, quote: v.quote, revision: typeof v.revision === "string" ? v.revision : null });
    for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, `${where}/${k}`);
  };
  walk(review, "");
  return out;
}

// A quote stands at its place when its words, spaces aside, begin on the lines it names and run on from there. In a
// JSON file the words are compared as the file escapes them and as they read.
function standsAt(lines, p, quote, json) {
  const want = strip(quote);
  if (!want || p.from < 1 || p.from > lines.length) return false;
  const lines0 = lines.slice(p.from - 1, p.to).join(""), window = lines.slice(p.from - 1, p.to + Math.max(quote.split("\n").length, 1) + 20).join("");
  const unescape = (s) => s.replace(/\\(["\\/])/g, "$1").replace(/\\n/g, "");
  for (const as of json ? [(s) => s, unescape] : [(s) => s]) {
    const named = strip(as(lines0)).length, i = strip(as(window)).indexOf(want);
    if (i >= 0 && (i < named || (named === 0 && i === 0))) return true;
  }
  return false;
}

// Each quote read at its place: beside the record (the task, the discussion, the logs) and in the repository at the
// reviewed commit; it passes where it stands in either. A source at another revision, a place marked `(base)` and a
// task id or a URL are not read. What does not stand is a mismatch; a removed line cited without `(base)` is accepted
// and named; a place that reads like a file and is none, or a place in another form, is named too.
export function checkQuotes(review, { roots, diffFiles = [], heads = [] }) {
  const result = { checked: 0, skipped: 0, mismatches: [], base: [], missing: [] };
  const readers = roots.map(({ root, sha }) => reader(path.resolve(root), sha));
  const inDiff = (p) => diffFiles.find((f) => f.path === p) ?? (() => { const hits = diffFiles.filter((f) => f.path.endsWith("/" + p)); return hits.length === 1 ? hits[0] : null; })();
  for (const q of quotedPlaces(review)) {
    if (/\(base\)\s*$/.test(q.at) || (q.revision && !heads.some((h) => h && sameRevision(q.revision, h)))) { result.skipped++; continue; }
    const p = placeOf(q.at);
    if (!p) { if (/:L?\d+/.test(q.at) && looksLikeFile(q.at.split(":")[0])) result.missing.push({ who: q.who, at: q.at, why: "form" }); result.skipped++; continue; }
    const file = inDiff(p.path), paths = [p.path, ...(file && file.path !== p.path ? [file.path] : [])];
    const found = readers.flatMap((read) => paths.map((rel) => read(rel))).filter(Boolean);
    // a line the diff removes, cited by its old number without "(base)": in a file that stays or in one deleted
    const removed = file && file.hunks.flat().filter((l) => l.kind === "del" && l.old >= p.from && l.old <= p.to + 20).sort((a, b) => a.old - b.old);
    const wasRemoved = () => removed?.length && standsAt(Object.assign([], ...removed.map((l) => ({ [l.old - 1]: l.text }))), p, q.quote, false);
    if (!found.length) {
      if (wasRemoved()) { result.checked++; result.base.push({ who: q.who, at: q.at }); continue; }
      if (looksLikeFile(p.path)) result.missing.push({ who: q.who, at: q.at, why: "file" });
      result.skipped++; continue;
    }
    result.checked++;
    if (found.some((lines) => standsAt(lines, { ...p, path: paths[0] }, q.quote, /\.json$/i.test(p.path)))) continue;
    if (wasRemoved()) { result.base.push({ who: q.who, at: q.at }); continue; }
    result.mismatches.push({ who: q.who, at: q.at, quote: q.quote, line: found[0][p.from - 1] ?? null });
  }
  return result;
}

// The entry points a line of code makes: a definition, the case of a dispatch, the event a listener takes, a handler
// assigned, a route. Patterns for JavaScript and TypeScript first, with Python and Go definitions; nothing here
// understands the code, and a type's member is not taken for a handler.
const KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "function", "return", "else", "do", "try", "with", "new", "typeof", "await", "constructor"]);
const DEFINITIONS = [
  /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(/,
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*(?::\s*[^=]+)?=>|[A-Za-z_$][\w$]*\s*=>)/,
  /^\s*(?:export\s+)?(?:(?:public|private|protected|static|readonly|async|override|abstract|get|set)\s+)*([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^={;]+)?\{\s*$/,
  /^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(/,
  /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(/,
];
const MARKS = [
  ["case", /\bcase\s+(["'`][^"'`]+["'`]|[A-Za-z_$][\w$.]*)\s*:/],
  ["listener", /\b(?:addEventListener|on|once)\(\s*(["'`][^"'`]+["'`])/],
  ["handler", /\b(on[A-Z]\w*)\s*=\s*[{(\w]/],
  ["route", /\b(?:app|router|server)\.(?:get|post|put|patch|delete|all|use)\(\s*(["'`][^"'`]+["'`])/],
];
const unquote = (s) => s.replace(/^["'`]|["'`]$/g, "");
const definitionIn = (text) => { for (const re of DEFINITIONS) { const m = re.exec(text); if (m && !KEYWORDS.has(m[1])) return m[1]; } return null; };
const indentOf = (text) => /^\s*/.exec(text)[0].replace(/\t/g, "  ").length;
const COMMENT = /^\s*(?:\/\/|#|\*|\/\*)/;
// Production code only: a test asserts behaviour and is evidence for a route, not a step of it; docs and config run nothing.
const running = (p) => purposeOfPath(p) === "production";

// Where a name is code, not prose: outside a string (inside a template's `${…}` it is code again) and before a comment.
function inCode(t, at, hash) {
  let q = null;
  const nest = [];
  for (let i = 0; i < at; i++) {
    const c = t[i];
    if (q) {
      if (c === "\\") { i++; continue; }
      if (q === "`" && c === "$" && t[i + 1] === "{") { nest.push(0); q = null; i++; continue; }
      if (c === q) q = null;
      continue;
    }
    if ((c === "/" && (t[i + 1] === "/" || t[i + 1] === "*")) || (hash && c === "#")) return false;
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if (nest.length && c === "{") nest[nest.length - 1]++;
    else if (nest.length && c === "}") { if (nest[nest.length - 1] === 0) { nest.pop(); q = "`"; } else nest[nest.length - 1]--; }
  }
  return q === null;
}
function firstCall(t, hash) {
  if (COMMENT.test(t)) return null;
  for (const m of t.matchAll(CALL.re)) if (inCode(t, m.index, hash)) return m;
  return null;
}
const CALL = { re: null };
// The modules a file imports, by the path it names them by, across lines: `from "./a.js"`, `require("./a")`,
// `import("./a.js")`, Python's `from pkg.a import` and `import pkg.a`, Go's import paths.
function importsOf(text, file) {
  if (/\.go$/.test(file)) return [...text.matchAll(/\bimport\s*(?:\(([^)]*)\)|("[^"]+"))/g)].flatMap((m) => [...(m[1] ?? m[2]).matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  if (/\.py$/.test(file)) return [...text.matchAll(/^\s*(?:from\s+([.\w]+)\s+import\b|import\s+([.\w]+))/gm)].map((m) => (m[1] ?? m[2]).replace(/\./g, "/"));
  return [...text.matchAll(/\b(?:from|import|require)\s*\(?\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
}
// The statements that import names, across lines, where a name imported through an index or a package shows.
const importStatements = (text) => [...text.matchAll(/\bimport\b[^;]*?\bfrom\s*["'`][^"'`]+["'`]|\b(?:const|let|var)\s*\{[^}]*\}\s*=\s*require\s*\(|^\s*from\s+[.\w]+\s+import\s+(?:\([^)]*\)|[^\n]+)/gms)].map((m) => m[0]);
// Source files in languages whose imports are not read here: a call in one counts; a patch, a log or data is no code.
const CODE = /\.(?:rb|java|kt|kts|scala|rs|c|cc|cpp|cxx|h|hpp|cs|php|swift|m|mm|dart|ex|exs|erl|clj|lua|pl|sh|vue|svelte)$/;
const wordIn = (w, text) => new RegExp(`(?<![\\w$])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$])`).test(text);
// A call in another file reaches the changed function only when that file imports the function's file, or names the
// function in an import; a file that defines the name itself calls its own. A member call, `m.total(`, reaches it from a
// file that imports its file, or from that file itself. In Go a call reaches it from the same package, or, qualified,
// from a file importing that package. Calls through a renamed default import are not followed.
const stemOf = (f) => path.posix.basename(f).replace(/\.[^.]+$/, "");
// Whether an import in file p, by the path it is written with, names the file home: a relative path resolved from p, so
// a copy of the module elsewhere imports its own copy; a package path or a Python module by its last part.
function refersTo(p, spec, home) {
  const bare = (f) => f.replace(/\.[^./]+$/, ""), homeStem = stemOf(home), homeDir = path.posix.basename(path.posix.dirname(home));
  if (/^\.\.?\//.test(spec) && !/\.py$/.test(p)) { const at = bare(path.posix.normalize(path.posix.join(path.posix.dirname(p), spec))); return at === bare(home) || (homeStem === "index" && at === path.posix.dirname(home)); }
  const s = stemOf(spec); return s === homeStem || (homeStem === "index" && s === homeDir) || (/\.go$/.test(p) && s === homeDir);
}
function reaches(p, name, qualifier, home, textOf) {
  if (p === home) return true;
  const lines = textOf(p), text = lines.join("\n");
  const importsHome = importsOf(text, p).some((spec) => refersTo(p, spec, home));
  if (/\.go$/.test(p)) return qualifier ? importsHome : path.posix.dirname(p) === path.posix.dirname(home);
  if (qualifier) return importsHome;
  if (lines.some((t) => definitionIn(t) === name)) return false;
  if (!/\.(?:[cm]?[jt]sx?|py)$/.test(p)) return CODE.test(p);
  // a name imported from another module of this repository by its relative path is that module's; one imported through
  // an index or a package may be the changed function
  const elsewhere = (s) => { const spec = /["'`]([^"'`]+)["'`]/.exec(s)?.[1] ?? ""; return /^\.\.?\//.test(spec) && !/\.py$/.test(p) && stemOf(spec) !== "index" && !/\/$|^\.\.?$/.test(spec); };
  return importsHome || importStatements(text).some((s) => wordIn(name, s) && !elsewhere(s));
}

// The last line of the definition at line k: the line that closes it at its own indentation, or, where the language
// closes by indentation, the last line indented deeper. A one-line definition ends where it starts.
function endOf(lines, k) {
  const depth = indentOf(lines[k - 1] ?? "");
  let last = k;
  for (let j = k + 1; j <= lines.length; j++) {
    const t = lines[j - 1];
    if (!t.trim()) continue;
    if (indentOf(t) > depth) { last = j; continue; }
    return /^\s*[}\])]/.test(t) ? j : last;
  }
  return last;
}
// The definition that encloses line n, found upward: the first line at a lower indentation that defines a function and
// runs past n. A block at a lower indentation that is no definition — an object, a class, a call — encloses the line
// instead, and the search goes on above it; at the top level it stops.
function enclosingOf(lines, n) {
  const own = lines[n - 1] ?? "";
  let depth = own.trim() ? indentOf(own) : Infinity;
  for (let k = n - 1; k >= 1 && depth > 0; k--) {
    const text = lines[k - 1];
    if (!text?.trim() || COMMENT.test(text) || indentOf(text) >= depth) continue;
    const name = definitionIn(text), to = name ? endOf(lines, k) : 0;
    if (!name || to < n) { depth = indentOf(text); continue; }
    return { k, name, text, to };
  }
  return null;
}
// A call's function: a route that passes through the function a call is in passes through the call.
const within = (lines, n) => { const def = enclosingOf(lines ?? [], n); return def ? { in: [def.k, def.to] } : {}; };
// A candidate's lines: a function from its definition to its end, a call the function it is in, anything else its one
// line.
const spanOf = (c) => {
  const p = placeOf(c.at);
  if (!p) return null;
  if (Array.isArray(c.in)) return { path: p.path, from: Math.min(p.from, c.in[0]), to: Math.max(p.from, c.in[1]) };
  return { ...p, to: Math.max(p.from, Number.isInteger(c.to) ? c.to : p.from) };
};
const overlaps = (a, b) => Boolean(a && b && a.path === b.path && a.from <= b.to && b.from <= a.to);

export function candidatesOf(files, checkout, { perName = 12, calls = 120 } = {}) {
  const found = [], seen = new Set(), touched = new Map(), read = reader(path.resolve(checkout.root), checkout.sha);
  const add = (c) => { const key = `${c.kind}\n${c.name}\n${c.at}`; if (!seen.has(key)) { seen.add(key); found.push(c); } };
  for (const file of files.filter((f) => running(f.path))) {
    const head = read(file.path);
    for (const hunk of file.hunks) {
      for (const line of hunk.filter((l) => l.kind === "add")) {
        const name = definitionIn(line.text);
        if (name) { add({ kind: "function", name, at: `${file.path}:${line.new}`, to: head ? endOf(head, line.new) : line.new, quote: line.text.trim().slice(0, 160) }); continue; }
        for (const [kind, re] of MARKS) { const m = re.exec(line.text); if (m) { add({ kind, name: unquote(m[1]), at: `${file.path}:${line.new}`, quote: line.text.trim().slice(0, 160) }); break; } }
      }
      // the definition that encloses each change, found upward in the file at the reviewed commit: a change to a
      // function's body changes the function, so its callers are where the change is felt
      if (!head) continue;
      // Each keeps the changes it encloses, so a block that is a step follows the function its lines are in.
      const near = new Map();
      for (const l of hunk.filter((l) => l.kind !== "ctx")) {
        const n = l.kind === "add" ? l.new : (hunk.find((x) => x.kind !== "del" && (x.old ?? 0) > l.old)?.new ?? l.old);
        if (!near.has(n)) near.set(n, []);
        near.get(n).push(address(l));
      }
      for (const [n, changes] of near) {
        const def = enclosingOf(head, n);
        if (!def) continue;
        const at = `${file.path}:${def.k}`, had = found.find((c) => c.kind === "function" && c.name === def.name && c.at === at);
        if (had) had.changes = [...new Set([...(had.changes ?? []), ...changes])];
        else add({ kind: "function", name: def.name, at, to: def.to, quote: def.text.trim().slice(0, 160), changes });
        if (def.name.length >= 3) touched.set(def.name, at);
      }
    }
    for (const c of found.filter((c) => c.kind === "function" && c.at.startsWith(file.path + ":") && c.name.length >= 3)) touched.set(c.name, c.at);
  }
  // The callers of each function the change touches, in the repository's production files at the reviewed commit.
  if (checkout.sha && touched.size) {
    const names = [...touched.keys()].map((n) => n.replace(/\$/g, "\\$"));
    const r = git(checkout.root, ["grep", "-n", "-I", "--full-name", "-w", "-E", names.join("|"), checkout.sha, "--"]);
    // a call: the name, or a member of one object, `m.total(`, `this.save(`; never one deeper in a chain
    CALL.re = new RegExp(`(?<![\\w$.])((?:[A-Za-z_$][\\w$]*\\.)?)(${names.join("|")})\\s*\\(`, "g");
    const per = new Map();
    const rows = (r.status === 0 ? r.stdout.split("\n") : []).map((row) => /^[^:]+:(.+?):(\d+):(.*)$/.exec(row)).filter((m) => m && running(m[1]));
    const hits = rows.map((m) => ({ m, hit: firstCall(m[3], /\.py$/.test(m[1])) })).filter(({ m, hit }) => hit && definitionIn(m[3]) !== hit[2]);
    read.many(hits.map(({ m }) => m[1]));
    const textOf = (p) => read(p) ?? [];
    let total = 0;
    for (const { m, hit } of hits) {
      if (total >= calls) break;
      const name = hit[2], atCall = `${m[1]}:${m[2]}`;
      if ((per.get(name) ?? 0) >= perName || touched.get(name) === atCall || !reaches(m[1], name, hit[1], touched.get(name).replace(/:\d+$/, ""), textOf)) continue;
      add({ kind: "call", name, at: atCall, quote: m[3].trim().slice(0, 160), ...within(textOf(m[1]), +m[2]) }); per.set(name, (per.get(name) ?? 0) + 1); total++;
    }
  }
  return found;
}

// A candidate a route follows: its line, or a change it encloses, falls in a block that is a step; a step's place lies in
// its lines — a function's from its definition to its end, a call's the function it is in; or the route's words name a
// place in them. A function, a case, a listener, a handler or a route is followed too when the route names it as code,
// in backticks or in a step's quoted line; a call by its place only.
export function onRoute(c, review, owner) {
  const p = placeOf(c.at), routes = Array.isArray(review.routes) ? review.routes : [];
  const blocks = new Set([p && owner?.get(`${p.path}\n+${p.from}`), ...(p ? c.changes ?? [] : []).map((a) => owner?.get(`${p.path}\n${a}`))].filter((b) => b !== undefined));
  const span = spanOf(c), same = (at) => overlaps(placeOf(at), span);
  const text = (r) => [r.title, ...(r.steps ?? []).flatMap((s) => [s.role, s.via, s.value]), ...(r.links ?? []).map((l) => l.via)].filter((x) => typeof x === "string").join("\n");
  const code = (r) => [...text(r).matchAll(/`([^`]+)`/g)].map((m) => m[1]).join("\n") + "\n" + (r.steps ?? []).map((s) => s.quote ?? "").join("\n");
  const named = (hay) => new RegExp(`(?<![\\w$-])${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$-])`).test(hay);
  return routes.some((r) => (r.steps ?? []).some((s) => blocks.has(s.block - 1) || (s.at && same(s.at)))
    || [...text(r).matchAll(/([\w./-]+:\d+(?:-\d+)?)/g)].some((m) => same(m[1])) || (c.kind !== "call" && named(code(r))));
}

// The other side of the disagreement: a route's step in production code where the script found no entry point — not
// its line, not a change in the function it found, not a call at its place. Such a step stands on the review's reading
// alone, which may be right: static search misses calls made through names it cannot see. `of` counts the steps the
// script could have found, those in production code.
export function unseenSteps(review, candidates, owner) {
  const blocks = new Set(), places = [], out = [];
  let of = 0;
  for (const c of candidates) {
    const p = placeOf(c.at);
    if (!p) continue;
    places.push(spanOf(c));
    for (const a of [`+${p.from}`, ...(c.changes ?? [])]) { const b = owner?.get(`${p.path}\n${a}`); if (b !== undefined) blocks.add(b); }
  }
  (Array.isArray(review.routes) ? review.routes : []).forEach((r, i) => (Array.isArray(r.steps) ? r.steps : []).forEach((s, k) => {
    if (Number.isInteger(s.block)) {
      const b = review.blocks?.[s.block - 1];
      if (!b || !running(b.path)) return;
      of++;
      if (!blocks.has(s.block - 1)) out.push({ route: i, step: k, block: s.block, at: b.path });
      return;
    }
    const q = placeOf(s.at ?? "");
    if (!q || !running(q.path)) return;
    of++;
    if (!places.some((p) => overlaps(p, q))) out.push({ route: i, step: k, block: null, at: s.at });
  }));
  return { unseen: out, of };
}

// What `ground` saves beside the record: the diff it read, the checkout's top level and commit, and the candidates.
// `check` reads it back, checks every quote at that commit again and matches the candidates against the routes as they
// stand.
export const GROUND = "ground.json";
export function readGround(review, directory) {
  const file = directory && path.join(directory, GROUND);
  if (!file || !fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { fault: `${GROUND} is not JSON` }; }
}
// The checkout is at the reviewed state when every line the diff adds stands at its number in a file at its commit.
export function driftOf(files, checkout) {
  const read = reader(path.resolve(checkout.root), checkout.sha);
  for (const file of files) {
    const lines = read(file.path), added = file.hunks.flat().filter((l) => l.kind === "add");
    if (!added.length) continue;
    if (!lines) return `${file.path} is not in the checkout`;
    const off = added.find((l) => (lines[l.new - 1] ?? null) !== l.text.replace(/\r$/, ""));
    if (off) return `${file.path}:${off.new} reads «${(lines[off.new - 1] ?? "").trim()}», and the diff adds «${off.text.trim()}» there`;
  }
  return null;
}
