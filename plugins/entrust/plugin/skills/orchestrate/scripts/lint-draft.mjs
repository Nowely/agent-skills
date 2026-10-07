#!/usr/bin/env node
// Lints a draft answer before it goes to the user: machinery, length, unsupported success, unnamed agents.
//
//   node lint-draft.mjs [--agents LIST] [--receipt LABEL]… [--receipts FILE]… [--request FILE] [--max-words N] [FILE|-]
//   node lint-draft.mjs --help
//
// Why a script: the page has said since 0.20.0 never to paste a five-field block, a header field name or a
// path into user-facing text, and #15 F16 counted the same machinery in eight later sessions (agent ids,
// report paths, exit mechanics, a RESUME id, a 3,000-word wall). A rule a reader applies to their own prose
// is the rule that did not hold; a linter over the text needs no reading of intent. It checks what can be
// checked mechanically and nothing more: the critic still reads the answer for what it means.

import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { adapters } from "./adapters.mjs";

export const MAX_WORDS = 400;

const USAGE = `lint-draft — lint a draft answer before it reaches the user.

  node lint-draft.mjs [--agents LIST] [--receipt LABEL]... [--receipts FILE]...
                      [--request FILE] [--max-words N] [FILE|-]

Reads FILE (stdin when it is - or absent) and prints one line per hit:
  LINT=<rule>: <line number>: <the line, cut to 120 characters>
then, always:
  WORDS=<words in the draft>
  SHA256=<the draft digest: the sha256 of the bytes read. It is one line of
          the critic's manifest; the manifest digest the critic returns is
          another number, the sha256 of the manifest file itself>
  HITS=<n>                   the last line
Exit 0 with no hit, 1 with any, 2 when nothing was linted (ERROR=<reason>).

A line that starts with > is the user's own words, quoted, and is not linted.
A word the user's request uses (--request, and the draft's quoted lines) is
the user's own vocabulary and is not machinery: a request about the driver
may be answered about the driver.

Rules:
  path          an absolute machine path (/Users/, /home/, /var/, /private/,
                /tmp/, /opt/, /Volumes/, ~/, C:\\), \${VAR}, $TMPDIR or $CLAUDE_*.
                A path relative to the repository (lib/slug.mjs) is allowed.
  field         an uppercase prompt header written as NAME: or an uppercase
                NAME_WITH_UNDERSCORE token; a status key such as PATH= or EXIT=.
  five-fields   two or more of status:, result:, evidence:, artifacts:, open:
                at line starts: a pasted return.
  machinery     wrapper, driver, report.json, prompt.txt, out.json, err.txt,
                exitCode, answerJson, turnStatus, threadId, RESUME, "exit <n>",
                обёртка, драйвер.
  model-slug    a slug in the shape an installed adapter declares: the user reads model names.
  agent-id      a harness id (agent-<12+ hex>) or a thread id (a UUID).
  length        more than --max-words words (default ${MAX_WORDS}).
  bare-id       an agent's id from --agents written without its model before it.
  agent-not-named  an agent from --agents that the draft never names.
  unsupported-success  a sentence claiming success (passed, passes, green,
                works, fixed, verified, confirmed, succeeded; прошли, работает,
                исправлен, подтверждено, успешно, зелёный) that neither contains
                a receipt's label nor is marked unverified (unverified, not
                verified, not checked, untested, unknown, не проверено, без
                проверки). A negated claim (not fixed, не исправлен) is not a
                claim of success, nor is one in a clause that opens with once,
                when, whenever, if, until, unless or before (goes out once the
                check passes). A digit or an agent's name is not a receipt.

--agents LIST    every agent that ran, as "<Model> <id>" separated by commas or
                 newlines: "Reader W2, Vendor Model D0". A model of two or more
                 words is also named by its last word: "Model D0". Repeatable;
                 --agent SPEC adds one.
--receipt LABEL  a check that supports a success claim; the claim's sentence
                 contains the label ("node --test", "the slug suite").
--receipts FILE  receipts, one per line: a plain label, or a JSON object with a
                 label, such as each line of a capture-check ledger. A receipt
                 whose exit is not 0, or that was refused, supports nothing.
--request FILE   the user's request, verbatim: its words are allowed.
--max-words N    the length bound.

Reads and prints; writes nothing.
`;

const RULES = [
  ["path", /(?:^|[\s(\[{"'`=:])((?:\/(?:Users|home|var|private|tmp|opt|Volumes)\/|~\/|[A-Za-z]:\\)\S*)/],
  ["path", /\$\{[A-Za-z_][A-Za-z0-9_]*\}|\$TMPDIR\b|\$[A-Z][A-Z0-9]*_[A-Z0-9_]+/],
  ["field", /\b[A-Z][A-Z_]{2,}:/],
  ["field", /\b[A-Z][A-Z_]*_[A-Z_]+\b/],
  ["field", /\b[A-Z][A-Z_]{2,}=/],
  ["machinery", /\b(?:wrappers?|driver|exitCode|answerJson|turnStatus|threadId|RESUME)\b|\b(?:report|out)\.json\b|\b(?:prompt|err)\.txt\b|\bexit(?: code)? \d+\b/],
  ["machinery", /(?<!\p{L})(?:обёртк|обертк|драйвер)\p{L}*/u],
  // Each installed adapter declares the shape of its model slugs; with none installed the rule has nothing to match.
  ...adapters().filter((a) => a.modelSlug).map((a) => ["model-slug", new RegExp(a.modelSlug, "i")]),
  ["agent-id", /\bagent-[0-9a-f]{12,}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i],
];
const FIVE = /^\s*(?:[-*]\s+)?(?:\*\*)?(status|result|evidence|artifacts|open)(?:\*\*)?:/i;
const SUCCESS = /\b(?:passed|passes|passing|green|works|working|fixed|verified|confirmed|succeeded|successfully)\b|(?<!\p{L})(?:прош(?:ёл|ел|ла|ли|ло)|зел[её]н\p{L}*|работает|работают|исправлен\p{L}*|исправил\p{L}*|подтвержд\p{L}*|успешн\p{L}*)/giu;
const UNVERIFIED = /\b(?:unverified|not verified|not checked|unchecked|untested|unknown|not run)\b|(?<!\p{L})(?:не провер\p{L}*|без проверки|неизвестн\p{L}*|не запуска\p{L}*)/iu;
const NEGATED = /(?:\b(?:not|never|no longer)|n't|(?<!\p{L})(?:не|ни))\s+(?:\S+\s+){0,2}$/iu;
// A success word in a clause that opens with one of these, no comma, semicolon or colon between, says what
// will happen, not what did: "the answer goes out once the check passes" (the live gate's case 5,
// 2026-09-28). "after" is left out, since "After the fix the suite passes" is a claim.
const CONDITIONAL = /\b(?:once|when|whenever|if|until|unless|before)\b[^,;:]*$/i;

const collapse = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
const cut = (s) => (s.length > 120 ? `${s.slice(0, 120)}…` : s);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function parseAgents(list) {
  return list.flatMap((s) => String(s).split(/[,\n]/)).map((s) => s.trim()).filter(Boolean).map((spec) => {
    const words = spec.split(/\s+/);
    const id = words.pop();
    const model = words.join(" ");
    const short = words.length > 1 ? words.at(-1) : model;
    return { spec, id, model, short };
  });
}

// Receipts as the ledger writes them or as plain labels; a failed or refused check supports nothing.
export function parseReceipts(text) {
  const out = [];
  for (const line of String(text).split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let label = t;
    if (t.startsWith("{")) {
      let r = null;
      try { r = JSON.parse(t); } catch {}
      if (!r || typeof r.label !== "string" || r.refused || (r.exit !== undefined && String(r.exit) !== "0")) continue;
      label = r.label;
    }
    out.push(label);
  }
  return out;
}

const sentences = (line) => line.split(/(?<=[.!?…;])\s+/).filter((s) => s.trim());

export function lintDraft(text, { agents = [], receipts = [], request = "", maxWords = MAX_WORDS } = {}) {
  const hits = [];
  const hit = (rule, n, line) => hits.push({ rule, line: n, text: cut(line.trim()) });
  const all = String(text).split("\n");
  const linted = all.map((l, i) => [i + 1, l]).filter(([, l]) => !/^\s*>/.test(l));
  const own = collapse([request, ...all.filter((l) => /^\s*>/.test(l))].join("\n"));
  const labels = receipts.map(collapse).filter((l) => l.length >= 3);
  const specs = parseAgents(agents);
  const idPattern = (a) => new RegExp(`(?<![A-Za-z0-9])${escape(a.id)}(?![A-Za-z0-9])`, "g");
  const namedPattern = (a) => new RegExp(`(?:${escape(a.model)}|${escape(a.short)})\\s+${escape(a.id)}(?![A-Za-z0-9])`, "i");

  for (const [n, line] of linted) {
    const fired = new Set();
    for (const [rule, re] of RULES) {
      if (fired.has(rule)) continue;
      for (const m of line.matchAll(new RegExp(re.source, `${re.flags}g`))) {
        if (own && own.includes(collapse(m[1] ?? m[0]))) continue;
        fired.add(rule);
        hit(rule, n, line);
        break;
      }
    }
    for (const a of specs) {
      for (const m of line.matchAll(idPattern(a))) {
        const before = line.slice(0, m.index);
        if (!new RegExp(`(?:${escape(a.model)}|${escape(a.short)})\\s+$`, "i").test(before)) { hit("bare-id", n, line); break; }
      }
    }
    for (const s of sentences(line)) {
      if (UNVERIFIED.test(s)) continue;
      const claims = [...s.matchAll(SUCCESS)].filter((m) => !NEGATED.test(s.slice(0, m.index)) && !CONDITIONAL.test(s.slice(0, m.index)));
      if (!claims.length) continue;
      const flat = collapse(s);
      if (!labels.some((l) => flat.includes(l))) hit("unsupported-success", n, s);
    }
  }
  // A pasted return is several labels at line starts; one "Open questions:" heading is prose.
  const labelsAtStart = new Set(linted.map(([, l]) => FIVE.exec(l)?.[1]?.toLowerCase()).filter(Boolean));
  if (labelsAtStart.size >= 2) hit("five-fields", linted.find(([, l]) => FIVE.test(l))[0], [...labelsAtStart].join(", "));
  const flatText = linted.map(([, l]) => l).join("\n");
  for (const a of specs) if (!namedPattern(a).test(flatText)) hits.push({ rule: "agent-not-named", line: 0, text: a.spec });
  const words = String(text).split(/\s+/).filter(Boolean).length;
  if (words > maxWords) hits.push({ rule: "length", line: 0, text: `${words} words, more than ${maxWords}` });
  return { hits, words, sha256: crypto.createHash("sha256").update(String(text)).digest("hex") };
}

function parse(argv) {
  const o = { agents: [], receipts: [], receiptFiles: [], request: null, maxWords: MAX_WORDS, file: null, help: false, error: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) o.error = `${a} needs a value`;
      return v;
    };
    if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--agents" || a === "--agent") o.agents.push(value());
    else if (a === "--receipt") o.receipts.push(value());
    else if (a === "--receipts") o.receiptFiles.push(value());
    else if (a === "--request") o.request = value();
    else if (a === "--max-words") {
      const v = value();
      if (!/^\d+$/.test(v ?? "")) o.error = `--max-words ${v}: a whole number`;
      else o.maxWords = Number(v);
    } else if (a.startsWith("--")) o.error = `unknown flag ${a}`;
    else if (o.file !== null) o.error = `one draft at a time: ${o.file} and ${a}`;
    else o.file = a;
    if (o.error) break;
  }
  return o;
}

const isMain = (() => {
  try { return fs.realpathSync(process.argv[1] ?? "") === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
})();

if (isMain) {
  const o = parse(process.argv.slice(2));
  const refuse = (why) => { process.stdout.write(`ERROR=${why}\n`); process.exit(2); };
  if (o.help) { process.stdout.write(USAGE); process.exit(0); }
  if (o.error) refuse(o.error);
  let text, receipts = [...o.receipts];
  try { text = fs.readFileSync(o.file === null || o.file === "-" ? 0 : o.file, "utf8"); }
  catch (e) { refuse(`cannot read the draft: ${e.message}`); }
  for (const f of o.receiptFiles) {
    try { receipts.push(...parseReceipts(fs.readFileSync(f, "utf8"))); }
    catch (e) { refuse(`cannot read receipts ${f}: ${e.message}`); }
  }
  let request = "";
  if (o.request !== null) {
    try { request = fs.readFileSync(o.request, "utf8"); }
    catch (e) { refuse(`cannot read the request ${o.request}: ${e.message}`); }
  }
  const r = lintDraft(text, { agents: o.agents, receipts, request, maxWords: o.maxWords });
  const out = [...r.hits.map((h) => `LINT=${h.rule}: ${h.line}: ${h.text}`), `WORDS=${r.words}`, `SHA256=${r.sha256}`, `HITS=${r.hits.length}`];
  process.stdout.write(`${out.join("\n")}\n`, () => process.exit(r.hits.length ? 1 : 0));
}
