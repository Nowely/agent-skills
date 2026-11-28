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
// A file's lines in a root, never outside it: at a commit through git, or on disk for a directory.
function reader(root, sha) {
  const cache = new Map();
  return (rel) => {
    if (cache.has(rel)) return cache.get(rel);
    let lines = null;
    const abs = path.resolve(root, rel);
    if (abs === root || !abs.startsWith(root + path.sep)) { cache.set(rel, null); return null; }
    if (sha) { const r = git(root, ["show", `${sha}:${path.relative(root, abs).split(path.sep).join("/")}`]); if (r.status === 0) lines = r.stdout.split(/\r?\n/); }
    else if (fs.existsSync(abs)) {
      try { const real = fs.realpathSync(abs); if (real.startsWith(fs.realpathSync(root) + path.sep) && fs.statSync(real).isFile()) lines = fs.readFileSync(real, "utf8").split(/\r?\n/); } catch { lines = null; }
    }
    cache.set(rel, lines);
    return lines;
  };
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
  const named = strip(lines.slice(p.from - 1, p.to).join("")).length, window = lines.slice(p.from - 1, p.to + Math.max(quote.split("\n").length, 1) + 20).join("");
  for (const text of json ? [window, window.replace(/\\(["\\/])/g, "$1").replace(/\\n/g, "")] : [window]) {
    const i = strip(text).indexOf(want);
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
    if (!found.length) { if (looksLikeFile(p.path)) result.missing.push({ who: q.who, at: q.at, why: "file" }); result.skipped++; continue; }
    result.checked++;
    if (found.some((lines) => standsAt(lines, { ...p, path: paths[0] }, q.quote, /\.json$/i.test(p.path)))) continue;
    // a line the diff removes, cited by its old number without "(base)"
    const removed = file && file.hunks.flat().filter((l) => l.kind === "del" && l.old >= p.from && l.old <= p.to + 20).sort((a, b) => a.old - b.old);
    if (removed?.length && standsAt(Object.assign([], ...removed.map((l) => ({ [l.old - 1]: l.text }))), p, q.quote, false)) { result.base.push({ who: q.who, at: q.at }); continue; }
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
// Production code only: a test asserts behaviour and is evidence for a route, not a step of it; docs and config run nothing.
const running = (p) => purposeOfPath(p) === "production";

export function candidatesOf(files, checkout, { perName = 12, calls = 120 } = {}) {
  const found = [], seen = new Set(), touched = new Map(), read = reader(path.resolve(checkout.root), checkout.sha);
  const add = (c) => { const key = `${c.kind}\n${c.name}\n${c.at}`; if (!seen.has(key)) { seen.add(key); found.push(c); } };
  for (const file of files.filter((f) => running(f.path))) {
    const head = read(file.path);
    for (const hunk of file.hunks) {
      for (const line of hunk.filter((l) => l.kind === "add")) {
        const name = definitionIn(line.text);
        if (name) { add({ kind: "function", name, at: `${file.path}:${line.new}`, quote: line.text.trim().slice(0, 160) }); continue; }
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
        const own = head[n - 1] ?? "", depth = own.trim() ? indentOf(own) : Infinity;
        for (let k = n - 1; k >= 1; k--) {
          const text = head[k - 1], name = text && definitionIn(text);
          if (!name || indentOf(text) >= depth) continue;
          const at = `${file.path}:${k}`, had = found.find((c) => c.kind === "function" && c.name === name && c.at === at);
          if (had) had.changes = [...new Set([...(had.changes ?? []), ...changes])];
          else add({ kind: "function", name, at, quote: text.trim().slice(0, 160), changes });
          if (name.length >= 3) touched.set(name, at);
          break;
        }
      }
    }
    for (const c of found.filter((c) => c.kind === "function" && c.at.startsWith(file.path + ":") && c.name.length >= 3)) touched.set(c.name, c.at);
  }
  // The callers of each function the change touches, in the repository's production files at the reviewed commit.
  if (checkout.sha && touched.size) {
    const names = [...touched.keys()].map((n) => n.replace(/\$/g, "\\$"));
    const r = git(checkout.root, ["grep", "-n", "-I", "--full-name", "-w", "-E", names.join("|"), checkout.sha, "--"]);
    const call = new RegExp(`(?<![\\w$.])(${names.join("|")})\\s*\\(`, "g"), per = new Map(), texts = new Map();
    const textOf = (p) => { if (!texts.has(p)) texts.set(p, read(p) ?? []); return texts.get(p); };
    const word = (w) => new RegExp(`(?<![\\w$-])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$-])`);
    // A call in another file reaches the changed function only when that file imports it, by its name or its file's;
    // a file that defines the name itself calls its own.
    const reaches = (p, name) => {
      const home = touched.get(name).replace(/:\d+$/, "");
      if (p === home) return true;
      const lines = textOf(p);
      if (lines.some((t) => definitionIn(t) === name)) return false;
      if (!/\.(?:[cm]?[jt]sx?|py)$/.test(p)) return true;
      const stem = word(path.posix.basename(home).replace(/\.[^.]+$/, "")), named = word(name);
      return lines.some((t) => /\bimport\b|\brequire\s*\(|^\s*from\s/.test(t) && (stem.test(t) || named.test(t)));
    };
    // A name in a comment or inside a string is prose: «this can carry (…)» calls nothing.
    const quoted = (t, at) => { const before = t.slice(0, at).replace(/\\./g, ""); return ['"', "'", "`"].some((q) => before.split(q).length % 2 === 0); };
    const firstCall = (t) => { if (/^\s*(?:\/\/|#|\*|\/\*)/.test(t)) return null; call.lastIndex = 0; for (const m of t.matchAll(call)) if (!quoted(t, m.index)) return m; return null; };
    let total = 0;
    for (const row of r.status === 0 ? r.stdout.split("\n") : []) {
      if (total >= calls) break;
      const m = /^[^:]+:(.+?):(\d+):(.*)$/.exec(row); if (!m || !running(m[1])) continue;
      const hit = firstCall(m[3]); if (!hit || definitionIn(m[3]) === hit[1] || (per.get(hit[1]) ?? 0) >= perName) continue;
      const atCall = `${m[1]}:${m[2]}`; if (touched.get(hit[1]) === atCall || !reaches(m[1], hit[1])) continue;
      add({ kind: "call", name: hit[1], at: atCall, quote: m[3].trim().slice(0, 160) }); per.set(hit[1], (per.get(hit[1]) ?? 0) + 1); total++;
    }
  }
  return found;
}

// A candidate a route follows: its line, or a change it encloses, falls in a block that is a step, or is a step's place in unchanged code, or the
// route's words name its place; a function, a case, a listener, a handler or a route is followed too when the route
// names it as code — in backticks, or in a step's quoted line. A caller is followed by its place only.
export function onRoute(c, review, owner) {
  const p = placeOf(c.at), routes = Array.isArray(review.routes) ? review.routes : [];
  const blocks = new Set([p && owner?.get(`${p.path}\n+${p.from}`), ...(p ? c.changes ?? [] : []).map((a) => owner?.get(`${p.path}\n${a}`))].filter((b) => b !== undefined));
  const same = (at) => { const q = placeOf(at); return Boolean(q && p && q.path === p.path && p.from >= q.from && p.from <= q.to); };
  const text = (r) => [r.title, ...(r.steps ?? []).flatMap((s) => [s.role, s.via, s.value]), ...(r.links ?? []).map((l) => l.via)].filter((x) => typeof x === "string").join("\n");
  const code = (r) => [...text(r).matchAll(/`([^`]+)`/g)].map((m) => m[1]).join("\n") + "\n" + (r.steps ?? []).map((s) => s.quote ?? "").join("\n");
  const named = (hay) => new RegExp(`(?<![\\w$-])${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$-])`).test(hay);
  return routes.some((r) => (r.steps ?? []).some((s) => blocks.has(s.block - 1) || (s.at && same(s.at)))
    || [...text(r).matchAll(/([\w./-]+:\d+(?:-\d+)?)/g)].some((m) => same(m[1])) || (c.kind !== "call" && named(code(r))));
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
    const off = added.find((l) => (lines[l.new - 1] ?? null) !== l.text);
    if (off) return `${file.path}:${off.new} reads «${(lines[off.new - 1] ?? "").trim()}», and the diff adds «${off.text.trim()}» there`;
  }
  return null;
}
