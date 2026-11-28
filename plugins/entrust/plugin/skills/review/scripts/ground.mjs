// What a record says against the code it is about, read mechanically: every quoted place checked at its file and line,
// and the entry points a script finds in the changed code — changed functions and their callers, dispatch cases,
// listeners, handlers, routes — matched against the record's routes. The script's list is never complete: static
// search misses calls made through names it cannot see, and finds functions that are no behaviour. What it is for is
// the disagreement: a quote that is not where it says, and a place in the changed code no route names.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { purposeOfPath } from "./review.mjs";

// Every {at, quote} in the record, wherever it stands: route steps, test assertions, sources of every kind.
export function quotedPlaces(review) {
  const out = [];
  const walk = (v, where) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${where}/${i}`));
    if (!v || typeof v !== "object") return;
    if (typeof v.at === "string" && typeof v.quote === "string" && v.quote.trim()) out.push({ who: where || "/", at: v.at, quote: v.quote });
    for (const [k, x] of Object.entries(v)) if (k !== "diff") walk(x, `${where}/${k}`);
  };
  walk(review, "");
  return out;
}

const squash = (s) => String(s).replace(/\s+/g, " ").trim();
// A place `path:line` or `path:line-line`, at the head; one marked `(base)` is at the base and is not read here.
const placeOf = (at) => { const m = /^(.+?):(\d+)(?:-(\d+))?$/.exec(String(at).trim()); return m ? { path: m[1], from: +m[2], to: +(m[3] ?? m[2]) } : null; };

// Each quote read at its place, in the repository or beside the record: it matches when its words stand on the lines
// it names, starting on the first, spaces aside. A place in no file here — a task id, a URL — is skipped.
export function checkQuotes(review, roots) {
  const result = { checked: 0, skipped: 0, mismatches: [] }, cache = new Map();
  const linesOf = (file) => { if (!cache.has(file)) cache.set(file, fs.readFileSync(file, "utf8").split("\n")); return cache.get(file); };
  for (const q of quotedPlaces(review)) {
    if (/\(base\)\s*$/.test(q.at)) { result.skipped++; continue; }
    const p = placeOf(q.at), file = p && roots.map((r) => path.join(r, p.path)).find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    if (!file) { result.skipped++; continue; }
    result.checked++;
    const lines = linesOf(file), want = squash(q.quote), span = Math.max(p.to - p.from + 1, q.quote.split("\n").length) + 2;
    const there = squash(lines.slice(p.from - 1, p.from - 1 + span).join(" "));
    if (!want || !there.includes(want)) result.mismatches.push({ who: q.who, at: q.at, quote: q.quote, line: lines[p.from - 1] ?? null });
  }
  return result;
}

// The entry points a line of code makes: the name a definition gives, the case of a dispatch, the event a listener
// takes, a handler property, a route. A pattern per kind, for JavaScript and TypeScript first, with Python and Go
// definitions; nothing here understands the code.
const KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "function", "return", "else", "do", "try", "with", "new", "typeof", "await"]);
const PATTERNS = [
  ["function", /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/],
  ["function", /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/],
  ["function", /^\s*(?:export\s+)?(?:async\s+)?(?:static\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$/],
  ["function", /^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(/],
  ["function", /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*\(/],
  ["case", /\bcase\s+(["'`][^"'`]+["'`]|[A-Za-z_$][\w$.]*)\s*:/],
  ["listener", /\b(?:addEventListener|on|once)\(\s*(["'`][^"'`]+["'`])/],
  ["handler", /\b(on[A-Z]\w*)\s*[=:]\s*[^=]/],
  ["route", /\b(?:app|router|server)\.(?:get|post|put|patch|delete|all|use)\(\s*(["'`][^"'`]+["'`])/],
];
const unquote = (s) => s.replace(/^["'`]|["'`]$/g, "");

// Production code only: a test asserts behaviour and is evidence for a route, not a step of it; docs and config run nothing.
const running = (p) => purposeOfPath(p) === "production";
export function candidatesOf(files, repo, { perName = 12, calls = 120 } = {}) {
  const found = [], defined = new Set();
  for (const file of files.filter((f) => running(f.path))) for (const line of file.hunks.flat()) {
    if (line.kind !== "add") continue;
    for (const [kind, re] of PATTERNS) {
      const m = re.exec(line.text);
      if (!m || KEYWORDS.has(m[1])) continue;
      const name = unquote(m[1]);
      found.push({ kind, name, at: `${file.path}:${line.new}`, quote: line.text.trim().slice(0, 160) });
      if (kind === "function" && name.length >= 3) defined.add(name);
      break;
    }
  }
  // The callers of each function the change defines or changes, in the repository's tracked files.
  if (repo && defined.size) {
    const listed = spawnSync("git", ["-C", repo, "ls-files", "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const paths = listed.status === 0 ? listed.stdout.split("\0").filter(Boolean) : [];
    const own = new Set(found.map((c) => c.at));
    let total = 0;
    const per = new Map();
    for (const rel of paths.filter(running)) {
      if (total >= calls) break;
      const abs = path.join(repo, rel);
      let text;
      try { const st = fs.statSync(abs); if (!st.isFile() || st.size > 1024 * 1024) continue; text = fs.readFileSync(abs, "utf8"); } catch { continue; }
      if (text.includes("\0")) continue;
      text.split("\n").forEach((l, i) => {
        if (total >= calls) return;
        for (const name of defined) {
          if ((per.get(name) ?? 0) >= perName || !new RegExp(`(?<![\\w$.])${name.replace(/\$/g, "\\$")}\\s*\\(`).test(l)) continue;
          const at = `${rel}:${i + 1}`;
          if (own.has(at) || PATTERNS.slice(0, 5).some(([, re]) => re.exec(l)?.[1] === name)) continue;
          found.push({ kind: "call", name, at, quote: l.trim().slice(0, 160) }); per.set(name, (per.get(name) ?? 0) + 1); total++;
        }
      });
    }
  }
  return found;
}

// A candidate a route names: its line falls in a block that is a step, or near a step's place in unchanged code, or a
// route's words name it or its place.
export function onRoute(c, review, owner) {
  const p = placeOf(c.at), routes = Array.isArray(review.routes) ? review.routes : [];
  const block = p && owner?.get(`${p.path}\n+${p.from}`);
  const near = (at) => { const q = placeOf(at); return q && p && q.path === p.path && Math.abs(q.from - p.from) <= 3; };
  const words = (r) => [r.title, ...(r.steps ?? []).flatMap((s) => [s.role, s.via, s.value]), ...(r.links ?? []).map((l) => l.via)].filter((x) => typeof x === "string").join("\n");
  const named = (text) => new RegExp(`(?<![\\w$-])${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$-])`).test(text) || [...text.matchAll(/([\w./-]+:\d+)/g)].some((m) => near(m[1]));
  return routes.some((r) => (r.steps ?? []).some((s) => (block !== undefined && s.block === block + 1) || (s.at && near(s.at))) || named(words(r)));
}

// What `ground` saves beside the record: the diff it read, the repository, and the candidates. `check` reads it back,
// checks every quote against the repository again and matches the candidates against the routes as they stand.
export const GROUND = "ground.json";
export function readGround(review, directory) {
  const file = directory && path.join(directory, GROUND);
  if (!file || !fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { fault: `${GROUND} is not JSON` }; }
}
