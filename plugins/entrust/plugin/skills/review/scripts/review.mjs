// A review as data: its vocabulary, its faults against the diff, and the model both renderings read.
// references/report-data.md defines the data for the reviewer; this file is what holds a review to it.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { address, blank, changedLines, numberOf, parseDiff } from "./diff.mjs";
import { comparisonFaults } from "./comparisons.mjs";

export const MECHANISM_CHANGES = ["added", "reused", "changed", "removed"];
export const mechanismCounts = (review) => MECHANISM_CHANGES.map((change) =>
  [change, (review.mechanisms ?? []).filter((m) => m.change === change).length]);
export const BLOCK_KINDS = ["code", "test", "other"];
export function weightCountsText(counts, t) {
  return BLOCK_KINDS.filter(kind => counts[kind]?.added || counts[kind]?.removed)
    .map(kind => `${t(`weight.${kind}`)} +${counts[kind].added} / −${counts[kind].removed}`).join(" · ") || t("weight.zero");
}

// The overview counts each attributed block once within a mechanism, including its shared subset.
export function weightOverview(weight, t, language) {
  if (!weight) return [];
  const plurals = new Intl.PluralRules(language);
  const delta = (counts, shared) => ["added", "removed"].filter(side => counts[side])
    .map(side => t(`weight.${side}.${plurals.select(counts[side])}`, counts[side])
      + (shared[side] ? ` (${t(`weight.shared-count.${plurals.select(shared[side])}`, shared[side])})` : "")).join(", ");
  return BLOCK_KINDS.flatMap(kind => {
    const own = weight.exclusive[kind], shared = weight.sharedCounts[kind];
    const total = { added: own.added + shared.added, removed: own.removed + shared.removed };
    if (!total.added && !total.removed) return [];
    return [{ kind, text: delta(total, shared) }];
  });
}

// What the weighed mechanisms come to together, each block counted once: the lines a decision to remove them all
// would touch. Null when fewer than two are weighed.
export function combinedWeight(mechanisms, blocks) {
  const weighed = mechanisms.filter((m) => m.weight), ids = new Set(weighed.flatMap((m) => m.blocks));
  if (weighed.length < 2) return null;
  const exclusive = Object.fromEntries(BLOCK_KINDS.map((kind) => [kind, { added: 0, removed: 0 }]));
  for (const id of ids) { const b = blocks[id - 1]; exclusive[b.kind].added += b.weightLines.added; exclusive[b.kind].removed += b.weightLines.removed; }
  return { names: weighed.map((m) => m.name), exclusive, sharedCounts: Object.fromEntries(BLOCK_KINDS.map((kind) => [kind, { added: 0, removed: 0 }])), shared: [] };
}

function weighMechanisms(mechanisms, blocks) {
  const users = new Map(blocks.map(b => [b.id, mechanisms.filter(m => m.blocks?.includes(b.id)).map(m => m.name)]));
  return mechanisms.map(m => {
    if (m.blocks === undefined) return { ...m, weight: null };
    const exclusive = Object.fromEntries(BLOCK_KINDS.map(kind => [kind, { added: 0, removed: 0 }])), shared = [];
    for (const id of m.blocks) {
      const b = blocks[id - 1], names = users.get(id);
      if (names.length > 1) shared.push({ block: id, kind: b.kind, ...b.weightLines, with: names.filter(name => name !== m.name) });
      else { exclusive[b.kind].added += b.weightLines.added; exclusive[b.kind].removed += b.weightLines.removed; }
    }
    const sharedCounts = Object.fromEntries(BLOCK_KINDS.map(kind => [kind, { added: 0, removed: 0 }]));
    for (const b of shared) { sharedCounts[b.kind].added += b.added; sharedCounts[b.kind].removed += b.removed; }
    return { ...m, weight: { exclusive, shared, sharedCounts } };
  });
}

// "question": the premise is unread, so the code is neither kept nor removed until the question named is answered.
export const VERDICTS = ["keep", "fix", "remove", "question"];
export const UNIT_VERDICTS = ["keep", "fix", "split", "merge", "remove", "question"];
// What a question asks of its resolver: a choice, a fact, or evidence. The number never decides the kind.
export const QUESTION_KINDS = ["decision", "fact", "evidence"];
export const COVERAGE_KINDS = ["ran", "read", "not_checked"];
// Two revision texts name the same code when they are equal, or when one is an abbreviated hash of the other.
export const sameRevision = (a, b) => {
  const x = String(a ?? "").trim().toLowerCase(), y = String(b ?? "").trim().toLowerCase();
  return Boolean(x && y) && (x === y || (Math.min(x.length, y.length) >= 7 && /^[0-9a-f]+$/.test(x) && /^[0-9a-f]+$/.test(y) && (x.startsWith(y) || y.startsWith(x))));
};
// Who raised a point against the draft, and what the review did with it.
export const CHALLENGERS = ["target", "critic", "verifier", "reviewer"];
export const OUTCOMES = ["accepted", "rejected", "owner"];
export const DIRECTIONS = ["behavior", "necessity", "design", "tests"];
export const EVIDENCE = ["ran", "read", "judgment"];
// The words a decision's recommendation opens with when the data leaves no clear one.
export const NO_CLEAR = { en: "No clear recommendation", ru: "Однозначной рекомендации нет" };
// Where a requirement comes from, and how the reviewer knows it is met: "judgment" is no way to know that.
export const SOURCES = ["task", "discussion", "project", "author", "contract", "assumption", "question"];
// Where a requirement comes from decides whether it binds: the task, an owner's decision and a project rule are
// established; what the author proposes, an existing behaviour or contract that may need keeping, the reviewer's own
// reading and an open point wait for the owner to confirm them.
export const ESTABLISHED = new Set(["task", "discussion", "project"]);
export const MET = EVIDENCE.filter((word) => word !== "judgment");
// The one state the model gives each requirement, which every rendering words.
export const REQUIREMENT_STATES = ["permission", "fail", "met", "unchecked"];
// What the model says of a screen's pictures' revision: historical with or without one, of this one, or nothing.
export const PROVENANCES = ["historical", "historical-unknown", "revision", "revision-unknown"];

const PICTURE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
export const SHOTS = ["mockup", "before", "after"];

// What a touched file is for, derived from its path alone: the map and the tree group and filter by it.
// Deterministic rules, disclosed on the page; a block's own kind only redirects a test block of a production
// file. Nothing here is a record field: the classification is the model's, computed the same way every render.
export const PURPOSES = ["production", "tests", "styles", "assets", "docs", "config"];
export function purposeOfPath(p) {
  const base = p.split("/").pop().toLowerCase();
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".") + 1) : "";
  if (/(^|\/)__tests__(\/|$)/.test(p) || /\.(test|spec)\.[a-z]+$/.test(base) || /\.browser\.mjs$/.test(base) || /(^|\/)__stories__(\/|$)/.test(p) || /\.stories\.[a-z]+$/.test(base)) return "tests";
  if (["scss", "css", "less", "sass", "styl"].includes(ext)) return "styles";
  if (["svg", "png", "jpg", "jpeg", "gif", "ico", "webp", "avif", "woff", "woff2", "ttf", "eot"].includes(ext) || /(^|\/)(assets|icons)(\/|$)/.test(p) || /(^|\/)keysets(\/|$)/.test(p)) return "assets";
  if (["md", "mdx", "rst", "txt"].includes(ext) || /^(changelog|readme|license)/.test(base)) return "docs";
  if (base === "package.json" || /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|npm-shrinkwrap\.json)$/.test(p) || /^tsconfig(\..*)?\.json$/.test(base) || base === "a.yaml" || ["yaml", "yml", "toml", "ini"].includes(ext) || /^(\.eslintrc|\.prettierrc|babel\.config|jest\.config|vite\.config|webpack\.config)/.test(base)) return "config";
  return "production";
}

// A picture the reviewer was given: an https link stays a link, a file is taken in whole so the page needs nothing beside it.
function pictureOf(source, directory) {
  if (/^https:\/\//.test(source)) return { link: source };
  const file = path.resolve(directory, String(source)), type = PICTURE_TYPES[path.extname(file).toLowerCase()];
  return type && fs.existsSync(file) ? { data: `data:${type};base64,${fs.readFileSync(file).toString("base64")}` } : null;
}

// "3, 10-16" as [3, 10, 11, ... 16]; "all" as every line there is.
function numbers(spec, all) {
  if (spec === undefined || spec === "") return [];
  if (spec === "all") return all;
  return String(spec).split(",").flatMap((part) => {
    const m = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(part);
    if (!m) throw new Error(`"${spec}" is not a list of lines such as "3, 10-16"`);
    return Array.from({ length: +(m[2] ?? m[1]) - +m[1] + 1 }, (_, i) => +m[1] + i);
  });
}

// [3, 4, 5, 9] as "3-5, 9".
export function compact(list) {
  const runs = [];
  for (const n of [...list].sort((a, b) => a - b)) {
    const last = runs.at(-1);
    if (last && n === last[1] + 1) last[1] = n; else runs.push([n, n]);
  }
  return runs.map(([a, b]) => a === b ? `${a}` : `${a}-${b}`).join(", ");
}

// The page writes the language into <html lang> as Intl canonicalizes it, and Intl takes one well-formed tag.
const languageTag = (value) => { if (typeof value !== "string") return false; try { Intl.getCanonicalLocales(value); return true; } catch { return false; } };

// The requirements a question asks the owner about: those its context, variants, recommendation or zones cite.
function askedAbout(review) {
  return new Set((review.questions ?? []).flatMap((q) => [q.context, q.zones, q.recommendation && [q.recommendation], ...(Array.isArray(q.variants) ? q.variants.map((v) => v?.consequences) : [])]
    .flatMap((list) => Array.isArray(list) ? list : []).flatMap((c) => Array.isArray(c?.sources) ? c.sources : [])
    .map((x) => /^\/requirements\/(\d+)$/.exec(String(x?.ref))?.[1]).filter((i) => i !== undefined).map((i) => review.requirements[+i]?.id)));
}
// A review's name, which no other review has: the page keeps the owner's answers under it.
export const keyOf = (review) => createHash("sha256").update(JSON.stringify(review)).digest("hex").slice(0, 10);
// Which block owns each changed line, by the blocks' own line lists, whatever else the record holds.
export function ownerOf(review, files) {
  const owner = new Map();
  (review.blocks ?? []).forEach((block, index) => {
    const file = files.find((f) => f.path === block.path);
    if (!file) return;
    for (const [kind, field] of [["add", "added"], ["del", "removed"]]) {
      const lines = changedLines(file).filter((l) => l.kind === kind);
      let wanted;
      try { wanted = new Set(numbers(block[field], lines.map(numberOf))); } catch { continue; }
      for (const line of lines.filter((l) => wanted.has(numberOf(l)))) { const key = `${file.path}\n${address(line)}`; if (!owner.has(key)) owner.set(key, index); }
    }
  });
  return owner;
}
// A block's changed lines as they read, in order: two blocks with the same lines hold the same code.
export const lineRead = (l) => `${l.kind}\t${l.text}`;
export const blockLines = (files, owner, index, path) => {
  const file = files.find((f) => f.path === path);
  return file ? changedLines(file).filter((l) => owner.get(`${file.path}\n${address(l)}`) === index).map(lineRead).join("\n") : "";
};
// Which carried blocks cannot stand as carried. The previous record kept a block for the code around it too: one whose
// unit changed — a block of it read again, changed or gone — or uses, at any remove, a unit that changed is read again,
// and so is one with no unit in a file that holds a block read again. Each stale block gets the reason, the rest null.
export function staleCarried(review, files, owner, prev) {
  const sig = (f, o, i, p) => `${p}\n${blockLines(f, o, i, p)}`;
  const carried = new Set(review.blocks.map((b, i) => b.carried === true ? sig(files, owner, i, b.path) : null).filter(Boolean));
  const changed = new Set();
  prev.review.blocks.forEach((b, i) => { if (b.unit && !(b.verdict === "keep" && carried.has(sig(prev.files, prev.owner, i, b.path)))) changed.add(b.unit); });
  review.blocks.forEach((b) => { if (b.carried !== true && b.unit) changed.add(b.unit); });
  const affected = new Set(changed), uses = (review.units ?? []).map((u) => [u.name, Array.isArray(u.uses) ? u.uses : []]);
  for (let grew = true; grew;) { grew = false; for (const [name, list] of uses) if (!affected.has(name) && list.some((x) => affected.has(x))) { affected.add(name); grew = true; } }
  const touched = new Set(review.blocks.filter((b) => b.carried !== true).map((b) => b.path));
  return review.blocks.map((b) => b.carried !== true ? null
    : b.unit ? (affected.has(b.unit) ? `its unit ${b.unit} changed since the previous review, or uses a unit that did` : null)
    : touched.has(b.path) ? `it has no unit, and its file holds a block read again` : null);
}

// The previous record a continuation carries blocks from, read with its saved diff, both by their digests.
export function previousOf(review, directory) {
  const p = review.previous;
  if (!p || typeof p.record !== "string" || typeof p.sha256 !== "string") return { fault: `"previous" names the record blocks were carried from: {record, sha256}` };
  const file = path.resolve(directory, p.record);
  if (!fs.existsSync(file)) return { fault: `the previous record "${p.record}" is not there` };
  const bytes = fs.readFileSync(file);
  if (createHash("sha256").update(bytes).digest("hex") !== p.sha256) return { fault: `the previous record "${p.record}" is not the one the blocks were carried from` };
  let prev;
  try { prev = JSON.parse(bytes.toString("utf8")); } catch (error) { return { fault: `the previous record "${p.record}" is not JSON: ${error.message}` }; }
  if (!Array.isArray(prev?.blocks)) return { fault: `the previous record "${p.record}" lists no blocks` };
  const dir = path.dirname(file), diff = path.resolve(dir, String(prev.diff?.file ?? ""));
  if (!prev.diff?.file || !fs.existsSync(diff)) return { fault: `the previous record's saved diff is not beside it` };
  const diffBytes = fs.readFileSync(diff);
  if (createHash("sha256").update(diffBytes).digest("hex") !== prev.diff.sha256) return { fault: `the previous record's saved diff is not the one it was made from` };
  const files = parseDiff(diffBytes.toString("utf8"));
  return { review: prev, files, owner: ownerOf(prev, files), sha256: p.sha256 };
}

// Every fault of the review, and which block owns each changed line ("path\n+12" -> block index).
// Warnings name what is substantively thin or unreachable without breaking referential integrity; a record
// without the optional fields of the decision-first report gets none of them.
export function check(review, files, directory) {
  const errors = [], warnings = [], owner = new Map();
  const text = (v) => typeof v === "string" && v.trim() !== "", filled = (v) => Array.isArray(v) && v.length > 0;
  for (const field of ["title", "range", "verdict", "now", "target", "recommendation"]) if (!text(review[field])) errors.push(`"${field}" is missing`);
  if (!text(review.change?.goal)) errors.push('"change.goal" is missing');
  for (const field of ["parts", "sources"]) if (!filled(review.change?.[field])) errors.push(`"change.${field}" lists nothing`);
  for (const field of ["requirements", "findings", "blocks"]) if (!Array.isArray(review[field])) errors.push(`"${field}" is not a list`);
  if (review.mechanisms !== undefined && !Array.isArray(review.mechanisms)) errors.push('"mechanisms" is not a list');
  if (review.scenarios !== undefined && !Array.isArray(review.scenarios)) errors.push('"scenarios" is not a list');
  for (const field of ["challenges", "questions", "steps", "checks", "ideas", "screens", "units", "target_units"])
    if (review[field] !== undefined && !Array.isArray(review[field])) errors.push(`"${field}" is not a list`);
  if (review.language !== undefined && !languageTag(review.language)) errors.push(`"language" is not a language tag: ${JSON.stringify(review.language)}`);
  if (review.labels !== undefined) errors.push('"labels" is not a field of the record: the report speaks Russian for a "ru" language and English for any other');
  errors.push(...comparisonFaults(review, directory));
  if (errors.length) return { errors, warnings, owner };

  const known = (items, what, key) => {
    const seen = new Set();
    for (const item of items) { if (seen.has(item[key])) errors.push(`${what} ${item[key]} appears twice`); seen.add(item[key]); }
    return seen;
  };
  const refs = (who, ids, listed, what) => { for (const id of ids ?? []) if (!listed.has(id)) errors.push(`${who} names ${what} ${id}, which is not listed`); };
  // One source format everywhere: an internal ref the check resolves mechanically, or an external place.
  // An analytical claim without a source is a fault; a source that cannot travel with the record is a warning. A
  // claim cannot cite the entry that makes it (`self`, its ref): that says where the claim stands, not what shows it.
  const sourceFaults = (who, sources, self) => {
    if (!filled(sources)) { errors.push(`${who} names no source: an analytical claim needs one`); return; }
    for (const s of sources) {
      if (typeof s !== "object" || s === null || Array.isArray(s)) { errors.push(`${who}: a source is {ref} or {at, revision?, quote?}`); continue; }
      if (s.ref !== undefined) {
        const m = /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(s.ref)), list = m && review[m[1]];
        if (!m || !Array.isArray(list) || +m[2] >= list.length) errors.push(`${who}: source ref "${s.ref}" names nothing in the record`);
        else if (`/${m[1]}/${+m[2]}` === self) errors.push(`${who}: source ref "${s.ref}" is the entry that makes the claim; cite what shows it`);
      } else if (text(s.at)) {
        if (s.revision !== undefined && !text(s.revision)) errors.push(`${who}: a source's revision is empty`);
        if (s.quote !== undefined && !text(s.quote)) errors.push(`${who}: a source's quote is empty`);
        if (!text(s.quote)) warnings.push(`${who}: source "${s.at}" has no quote; it does not travel without the file`);
      } else errors.push(`${who}: a source needs "ref" or "at"`);
    }
  };
  const claims = (who, list, what, self) => {
    if (list === undefined) return;
    if (!Array.isArray(list)) { errors.push(`${who}: ${what} is not a list`); return; }
    list.forEach((c, i) => { const w = `${who} ${what} ${i + 1}`; if (!text(c?.text)) errors.push(`${w} has no text`); sourceFaults(w, c?.sources, self); });
  };
  const requirements = known(review.requirements, "requirement", "id"), findings = known(review.findings, "finding", "id");
  // A change of the task walked through the code: where it is edited, and what must be read to make it safely.
  const scenarios = review.scenarios ?? [], scenarioIds = known(scenarios, "scenario", "id");
  const places = (list) => Array.isArray(list) && list.every(text);
  for (const s of scenarios) {
    const who = `scenario ${s.id}`;
    if (!text(s.change)) errors.push(`${who} has no "change": the change of the task it walks through`);
    refs(who, s.requirements, requirements, "requirement");
    for (const side of ["now", "target"]) {
      if (side === "target" && s.target === undefined) continue;
      if (!filled(s[side]?.edit) || !places(s[side].edit)) errors.push(`${who}: "${side}.edit" lists no place to edit`);
      if (s[side]?.read !== undefined && !places(s[side].read)) errors.push(`${who}: "${side}.read" is not a list of places`);
    }
  }
  for (const f of review.findings) {
    // An id travels into anchors and hrefs: letters, digits, "_" and "-" only, so no quote or markup can ride along.
    if (!/^[A-Za-z0-9_-]+$/.test(String(f.id))) errors.push(`finding ${f.id}: id is letters, digits, "_" or "-"`);
    for (const field of ["title", "at", "what", "shown_by", "fix"]) if (!text(f[field])) errors.push(`finding ${f.id} has no "${field}"`);
    if (!DIRECTIONS.includes(f.direction)) errors.push(`finding ${f.id}: direction is one of ${DIRECTIONS.join(", ")}`);
    if (!EVIDENCE.includes(f.evidence)) errors.push(`finding ${f.id}: evidence is one of ${EVIDENCE.join(", ")}`);
    refs(`finding ${f.id}`, f.breaks, requirements, "requirement");
    refs(`finding ${f.id}`, f.untested, requirements, "requirement");
    // A missing test breaks no requirement, and only a finding about tests says one is missing.
    if (f.direction === "tests" && f.breaks?.length) errors.push(`finding ${f.id} is about tests: it lists requirements under "untested", not "breaks"`);
    if (f.direction !== "tests" && f.untested?.length) errors.push(`finding ${f.id} is not about tests: it lists requirements under "breaks", not "untested"`);
    refs(`finding ${f.id}`, f.scenarios, scenarioIds, "scenario");
  }
  review.requirements.forEach((r, index) => {
    if (!text(r.text)) errors.push(`requirement ${r.id} has no text`);
    if (!SOURCES.includes(r.source)) errors.push(`requirement ${r.id}: source is one of ${SOURCES.join(", ")}`);
    // A requirement shows where it is stated; an established one quotes it — the task's sentence, the owner's word, the
    // project's rule — or cites the screen it comes from, so the reader can check it without the conversation.
    sourceFaults(`requirement ${r.id}`, r.sources, `/requirements/${index}`);
    const quoted = (Array.isArray(r.sources) ? r.sources : []).some((x) => (x?.at !== undefined && text(x.quote)) || /^\/screens\/\d+$/.test(String(x?.ref)));
    if (ESTABLISHED.has(r.source) && Array.isArray(r.sources) && r.sources.length && !quoted)
      errors.push(`requirement ${r.id} is ${r.source}: quote where it is stated, as {at, quote}, or cite the screen it comes from`);
    if (r.met !== undefined && !MET.includes(r.met)) errors.push(`requirement ${r.id}: met is one of ${MET.join(", ")}, or left out when you did not check it`);
    const breaking = review.findings.filter((f) => f.breaks?.includes(r.id)).map((f) => f.id);
    if (r.met !== undefined && breaking.length) errors.push(`requirement ${r.id} is marked met, and finding ${breaking.join(", ")} breaks it`);
    if (r.not_checked !== undefined && !text(r.not_checked)) errors.push(`requirement ${r.id}: "not_checked" says what of it you did not check, or is left out`);
    // A permission allows; it does not oblige, so there is nothing to mark met.
    if (r.permission !== undefined && typeof r.permission !== "boolean") errors.push(`requirement ${r.id}: permission is true, or left out`);
    if (r.permission === true && r.met !== undefined) errors.push(`requirement ${r.id} is a permission, not an obligation: it cannot be marked met`);
  });
  (review.steps ?? []).forEach((step, index) => {
    if (!text(step.text)) errors.push(`step ${index + 1} has no "text"`);
    refs(`step ${index + 1}`, step.findings, findings, "finding");
  });
  (review.checks ?? []).forEach((scenario, index) => {
    const name = `check ${index + 1}`;
    if (!filled(scenario.do) || !scenario.do.every(text)) errors.push(`${name} has no "do": the steps a person takes`);
    if (!text(scenario.expect)) errors.push(`${name} has no "expect"`);
    refs(name, scenario.requirements, requirements, "requirement");
  });
  for (const [index, idea] of (review.ideas ?? []).entries()) {
    for (const field of ["title", "text"]) if (!text(idea[field])) errors.push(`idea ${index + 1} has no "${field}"`);
    if (idea.sources !== undefined) sourceFaults(`idea ${index + 1}`, idea.sources, `/ideas/${index}`);
  }
  // A question is named by its place in the list, from 1.
  const qList = review.questions ?? [];
  const questions = new Set(qList.map((_, index) => index + 1));
  qList.forEach((q, index) => {
    const who = `question ${index + 1}`;
    if (!QUESTION_KINDS.includes(q.kind)) errors.push(`${who}: kind is one of ${QUESTION_KINDS.join(", ")}`);
    if (!text(q.at)) errors.push(`${who} has no "at"`);
    if (!text(q.text)) errors.push(`${who} has no "text"`);
    if (q.resolver !== undefined && !text(q.resolver)) errors.push(`${who}: resolver is a role name, or left out`);
    const self = `/questions/${index}`;
    claims(who, q.context, "context", self);
    claims(who, q.zones, "zone", self);
    const variantIds = new Set();
    // A decision is a choice between at least two variants, each with what it brings: a choice of one is no choice.
    if (q.variants !== undefined && !Array.isArray(q.variants)) errors.push(`${who}: variants is not a list`);
    else if (q.kind === "decision" && (q.variants?.length ?? 0) < 2) errors.push(`${who} is a decision with ${q.variants?.length ? "one variant" : "no variants"}: give at least two, each with its consequences`);
    for (const v of Array.isArray(q.variants) ? q.variants : []) {
      const w = `${who} variant ${v?.id}`;
      if (!text(v?.id)) errors.push(`${who}: a variant has no id`);
      else if (variantIds.has(v.id)) errors.push(`${who}: variant id "${v.id}" appears twice`);
      else variantIds.add(v.id);
      if (!text(v?.text)) errors.push(`${w} has no text`);
      if (v?.consequences !== undefined && !Array.isArray(v.consequences)) errors.push(`${w}: consequences is not a list`);
      else if (!filled(v?.consequences)) (q.kind === "decision" ? errors : warnings).push(`${w} lists no consequences`);
      else claims(w, v.consequences, "consequence", self);
    }
    // Variants that combine are marked so; the owner may then take several, and the recommendation may name several.
    if (q.multiple !== undefined && (q.multiple !== true || q.kind !== "decision")) errors.push(`${who}: multiple is only for a decision whose variants combine, and only true`);
    // A choice comes with the reviewer's opinion tied to a variant, or the plain word that there is none.
    if (q.kind === "decision" && q.recommendation === undefined) errors.push(`${who} is a decision with no recommendation: name the variant you recommend, or open its text with «${NO_CLEAR.en}»`);
    if (q.recommendation !== undefined) {
      const w = `${who} recommendation`;
      if (!text(q.recommendation?.text)) errors.push(`${w} has no text`);
      else if (q.kind === "decision" && q.recommendation.variant === undefined && q.recommendation.variants === undefined && !Object.values(NO_CLEAR).some((x) => q.recommendation.text.startsWith(x)))
        errors.push(`${w} names no variant: name the one you recommend, or open its text with «${NO_CLEAR.en}» and give the rule`);
      if (q.recommendation?.variant !== undefined && !variantIds.has(q.recommendation.variant)) errors.push(`${w} names variant "${q.recommendation.variant}", which is not listed`);
      const several = q.recommendation?.variants;
      if (several !== undefined) {
        if (q.multiple !== true) errors.push(`${w}: variants is for a decision whose variants combine; name one in "variant"`);
        else if (q.recommendation.variant !== undefined) errors.push(`${w} names one in "variant" and several in "variants": keep one of them`);
        else if (!Array.isArray(several) || !several.length) errors.push(`${w}: variants lists the variant ids it recommends`);
        else for (const id of several) if (!variantIds.has(id)) errors.push(`${w} names variant "${id}", which is not listed`);
      }
      sourceFaults(w, q.recommendation?.sources, self);
    }
    if (q.remainingEvidence !== undefined) {
      if (!Array.isArray(q.remainingEvidence)) errors.push(`${who}: remainingEvidence is not a list`);
      else for (const n of q.remainingEvidence) {
        if (!Number.isInteger(n) || n < 1 || n > qList.length) errors.push(`${who}: remainingEvidence names question ${n}, which is not listed`);
        else if (qList[n - 1].kind !== "evidence") errors.push(`${who}: remainingEvidence names question ${n}, which is not of kind evidence`);
      }
    }
  });
  // A child declares the variants of its parent under which it still applies; the parent stores no children.
  qList.forEach((q, index) => {
    if (q.parent === undefined) return;
    const who = `question ${index + 1}`, p = q.parent;
    if (!Number.isInteger(p?.question) || p.question < 1 || p.question > qList.length) errors.push(`${who}: parent names question ${p?.question}, which is not listed`);
    else if (p.question === index + 1) errors.push(`${who}: parent is itself`);
    else {
      const parentVariants = qList[p.question - 1].variants;
      if (parentVariants !== undefined && !Array.isArray(parentVariants)) errors.push(`${who}: the variants of parent question ${p.question} are not a list`);
      const ids = new Set((Array.isArray(parentVariants) ? parentVariants : []).map((v) => v?.id));
      if (!filled(p.variants)) errors.push(`${who}: parent lists no variants`);
      else for (const id of p.variants) if (!ids.has(id)) errors.push(`${who}: parent.variants names "${id}", which is not a variant of question ${p.question}`);
    }
  });
  for (let i = 0; i < qList.length; i++) {
    const seen = new Set();
    for (let at = i; qList[at]?.parent !== undefined;) {
      if (seen.has(at)) { errors.push(`question ${i + 1}: the parent chain is a cycle`); break; }
      seen.add(at);
      at = qList[at].parent.question - 1;
      if (!qList[at]) break;
    }
  }
  const settled = (who, item) => {
    refs(who, item.findings, findings, "finding");
    refs(who, item.questions, questions, "question");
    if (item.verdict === "question" && !item.questions?.length) errors.push(`${who} is a question and names none of the questions`);
    else if (!["keep", "question"].includes(item.verdict) && !item.findings?.length) errors.push(`${who} is to ${item.verdict} and names no finding`);
  };
  // A point against the draft is rejected only on a place, in the code or the task's sources, that refutes it; the
  // check sees that a place is named, not what it says.
  (review.challenges ?? []).forEach((c, index) => {
    const who = `challenge ${index + 1}`;
    if (!CHALLENGERS.includes(c.from)) errors.push(`${who}: from is one of ${CHALLENGERS.join(", ")}`);
    if (!OUTCOMES.includes(c.outcome)) errors.push(`${who}: outcome is one of ${OUTCOMES.join(", ")}`);
    for (const field of ["point", "note"]) if (!text(c[field])) errors.push(`${who} has no "${field}"`);
    if (c.outcome === "rejected" && !text(c.at)) errors.push(`${who} is rejected and "at" cites no place that refutes it; name the place, or send it to the owner`);
    // The reviewer's own candidate is recorded only when it was set aside: one that holds is a finding, a question or an idea.
    if (c.from === "reviewer" && c.outcome !== "rejected") errors.push(`${who} is the reviewer's own candidate: record it only when you set it aside on a place, as rejected; one that holds is a finding, a question or an idea`);
  });

  (review.screens ?? []).forEach((screen, index) => {
    const name = `screen ${index + 1}`;
    if (!text(screen.name)) errors.push(`${name} has no "name"`);
    for (const shot of SHOTS) if (screen[shot] !== undefined && !pictureOf(screen[shot], directory))
      errors.push(`${name}: ${shot} "${screen[shot]}" is neither a picture file there (${Object.keys(PICTURE_TYPES).join(", ")}) nor an https link`);
    // A match is a claim about two pictures; with nothing found and nothing claimed, the screen was not compared.
    if (screen.differences !== undefined && !Array.isArray(screen.differences)) errors.push(`${name}: differences is not a list`);
    const differences = Array.isArray(screen.differences) ? screen.differences : [];
    if (screen.match && (screen.mockup === undefined || screen.after === undefined)) errors.push(`${name} is said to match, and has no ${screen.mockup === undefined ? "mockup" : "after"} picture`);
    if (screen.match && differences.length) errors.push(`${name} is said to match, and lists differences`);
    if (!screen.match && !differences.length && !text(screen.missing)) errors.push(`${name} has no difference and no "match": say in "missing" what you could not compare`);
    for (const difference of differences) {
      if (!text(difference.what)) errors.push(`${name}: a difference has no "what"`);
      if (!text(difference.why) && difference.finding === undefined) errors.push(`${name}: a difference has neither "why" nor "finding"`);
      if (difference.finding !== undefined) refs(name, [difference.finding], findings, "finding");
    }
    // A historical picture is evidence of another revision; absence of the mark is unknown, not the current one.
    if (screen.historical !== undefined) {
      if (typeof screen.historical !== "boolean") errors.push(`${name}: historical is true, or left out`);
      else if (screen.historical) {
        if (!text(screen.revision)) warnings.push(`${name} is historical and names no revision`);
        sourceFaults(name, screen.sources, `/screens/${index}`);
      }
    }
  });

  if (review.tradeoffs !== undefined) {
    if (!Array.isArray(review.tradeoffs)) errors.push('"tradeoffs" is not a list');
    else review.tradeoffs.forEach((x, index) => {
      const who = `tradeoff ${index + 1}`;
      if (!text(x?.text)) errors.push(`${who} has no text`);
      if (!text(x?.consequence)) errors.push(`${who} has no consequence`);
      sourceFaults(who, x?.sources, `/tradeoffs/${index}`);
    });
  }
  if (review.coverageStructured !== undefined) {
    if (!Array.isArray(review.coverageStructured)) errors.push('"coverageStructured" is not a list');
    else review.coverageStructured.forEach((c, index) => {
      const who = `coverageStructured ${index + 1}`;
      if (!COVERAGE_KINDS.includes(c?.kind)) errors.push(`${who}: kind is one of ${COVERAGE_KINDS.join(", ")}`);
      if (!text(c?.text)) errors.push(`${who} has no text`);
      if (c?.revision !== undefined && !text(c.revision)) errors.push(`${who}: revision is empty`);
      for (const k of ["by", "where"]) if (c?.[k] !== undefined && !text(c[k])) errors.push(`${who}: ${k} is empty`);
      // A run is a claim about a checked version: an external source without a revision cannot travel to it.
      if (c?.kind === "ran" && !text(c.revision) && (Array.isArray(c.sources) ? c.sources : []).some((s) => s && typeof s === "object" && !Array.isArray(s) && s.ref === undefined && text(s.at)))
        warnings.push(`${who} claims a run on an external source without a revision: name the revision it ran at`);
      sourceFaults(who, c?.sources, `/coverageStructured/${index}`);
    });
  }
  if (review.passport !== undefined) {
    const p = review.passport;
    if (typeof p !== "object" || p === null || Array.isArray(p)) errors.push('"passport" is not an object');
    else {
      for (const field of ["repository", "base", "head", "reviewedAt"]) if (!text(p[field])) errors.push(`passport has no "${field}"`);
      if (p.links !== undefined) {
        if (!Array.isArray(p.links)) errors.push('"passport.links" is not a list');
        else p.links.forEach((l, index) => {
          const who = `passport link ${index + 1}`;
          if (!text(l?.label)) errors.push(`${who} has no label`);
          if (!/^https?:\/\//.test(String(l?.url ?? ""))) errors.push(`${who}: url is an http(s) link`);
          if (l?.kind !== undefined && !text(l.kind)) errors.push(`${who}: kind is empty`);
        });
      }
    }
  }

  const units = review.units ?? [], changed = new Set(units.filter((u) => !u.existing).map((u) => u.name));
  for (const [where, list] of [["units", units], ["target_units", review.target_units ?? []]]) {
    const names = known(list, `${where}:`, "name");
    for (const u of list) {
      if (!filled(u.jobs)) errors.push(`${where}: ${u.name} has no jobs`);
      refs(`${where}: ${u.name}`, u.uses, names, "unit");
    }
  }
  for (const u of units.filter((u) => !u.existing)) {
    if (!text(u.reason)) errors.push(`unit ${u.name} has no "reason": why it is to ${u.verdict ?? "keep"}, a unit kept as it is included`);
    if (!UNIT_VERDICTS.includes(u.verdict)) errors.push(`unit ${u.name}: verdict is one of ${UNIT_VERDICTS.join(", ")}`);
    settled(`unit ${u.name}`, u);
    if (!review.blocks.some((b) => b.unit === u.name)) errors.push(`unit ${u.name} has no block: give its blocks "unit": "${u.name}", or mark it "existing"`);
  }

  const mechanismUnits = new Set(units.map((u) => u.name));
  known(review.mechanisms ?? [], "mechanism", "name");
  for (const m of review.mechanisms ?? []) {
    const who = `mechanism ${m.name}`;
    for (const field of ["name", "purpose", "basis", "benefit", "cost", "decision"])
      if (!text(m[field])) errors.push(`${who} has no "${field}"`);
    if (!MECHANISM_CHANGES.includes(m.change)) errors.push(`${who}: change is one of ${MECHANISM_CHANGES.join(", ")}`);
    // What the change brings in is weighed against what was already there, so the record must say what was looked at.
    if (["added", "changed"].includes(m.change)) {
      if (!text(m.instead)) errors.push(`${who} has no "instead": where this is already available, or what you read that does not supply it`);
    }
    if (!EVIDENCE.includes(m.evidence)) errors.push(`${who}: evidence is one of ${EVIDENCE.join(", ")}`);
    if (m.units !== undefined && !Array.isArray(m.units)) errors.push(`${who}: units is not a list`);
    else refs(who, m.units, mechanismUnits, "unit");
    refs(who, m.findings, findings, "finding");
    if (m.blocks !== undefined) {
      if (!Array.isArray(m.blocks)) errors.push(`${who}: blocks must be an array of 1-based block numbers`);
      else {
        if (new Set(m.blocks).size !== m.blocks.length) errors.push(`${who}: duplicate block references`);
        if (!m.blocks.length && m.change !== "reused") errors.push(`${who}: empty blocks are only valid for reused mechanisms`);
        for (const id of m.blocks) {
          if (!Number.isInteger(id) || id < 1 || id > review.blocks.length) errors.push(`${who}: unknown block ${id}`);
          else if (!BLOCK_KINDS.includes(review.blocks[id - 1].kind)) errors.push(`${who}: block ${id} requires explicit kind for weight`);
        }
      }
    }
  }

  review.blocks.forEach((block, index) => {
    const name = `block ${index + 1}`, file = files.find((f) => f.path === block.path);
    if (block.kind !== undefined && !BLOCK_KINDS.includes(block.kind)) errors.push(`${name}: kind is one of ${BLOCK_KINDS.join(", ")}`);
    if (!file) return errors.push(`${name}: "${block.path}" is not a file of the diff`);
    // Every block says what it does and why it is there: the owner reads the kept ones to understand the change too.
    if (!text(block.does)) errors.push(`${name} has no "does": say what it does and why it is there, or that no source gives a reason`);
    // A large block that is one decision says why; the critic reads it and may divide the block.
    if (block.whole !== undefined && !text(block.whole)) errors.push(`${name}: "whole" says why the block is one decision, or is left out`);
    if (!VERDICTS.includes(block.verdict)) errors.push(`${name}: verdict is one of ${VERDICTS.join(", ")}`);
    refs(name, block.serves, requirements, "requirement");
    settled(name, block);
    if (block.unit !== undefined && !changed.has(block.unit)) errors.push(`${name}: "${block.unit}" is not a unit of the change`);
    // Code that stays is read line by line; only what goes entirely may be named whole.
    if ([block.added, block.removed].includes("all") && block.verdict !== "remove") errors.push(`${name}: "all" is for a block to remove; a block to ${block.verdict} lists its lines`);
    let own = 0;
    for (const [kind, field] of [["add", "added"], ["del", "removed"]]) {
      const lines = changedLines(file).filter((l) => l.kind === kind);
      let wanted;
      try { wanted = new Set(numbers(block[field], lines.map(numberOf))); }
      catch (error) { errors.push(`${name}: ${error.message}`); continue; }
      for (const line of lines.filter((l) => wanted.has(numberOf(l)))) {
        const key = `${file.path}\n${address(line)}`;
        if (owner.has(key)) errors.push(`${file.path} ${address(line)} is in block ${owner.get(key) + 1} and in ${name}`);
        else { owner.set(key, index); own++; }
      }
    }
    if (!own) errors.push(`${name} covers no changed line of ${block.path}`);
  });

  // A carried block was not read again: it holds the very lines of a block the previous record kept, which the check
  // proves from that record and its saved diff, and it stays kept.
  const carried = review.blocks.map((b, i) => [b, i]).filter(([b]) => b.carried !== undefined);
  for (const [b, i] of carried) {
    if (b.carried !== true) errors.push(`block ${i + 1}: carried is true, or left out`);
    else if (b.verdict !== "keep") errors.push(`block ${i + 1} is carried and not kept: a block carried from the previous record is kept as it was; judge it again, and it is not carried`);
  }
  const prev = review.previous !== undefined ? previousOf(review, directory) : null;
  if (prev?.fault) errors.push(`"previous" cannot be read: ${prev.fault}`);
  if (carried.some(([b]) => b.carried === true)) {
    if (!prev) errors.push(`carried blocks cannot be proven: "previous" names no record`);
    else if (!prev.fault) {
      const kept = new Set(prev.review.blocks.map((b, i) => b.verdict === "keep" ? `${b.path}\n${blockLines(prev.files, prev.owner, i, b.path)}` : null).filter(Boolean));
      for (const [b, i] of carried) if (b.carried === true && !kept.has(`${b.path}\n${blockLines(files, owner, i, b.path)}`))
        errors.push(`block ${i + 1} is marked carried, and no block the previous record kept has its lines: read it and judge it, and it is not carried`);
      staleCarried(review, files, owner, prev).forEach((why, i) => { if (why) errors.push(`block ${i + 1} is marked carried, and ${why}: read it and judge it, and it is not carried`); });
    }
  }
  // A reply answers a comment the owner made on the previous review, at the place that comment had there.
  if (review.replies !== undefined && !Array.isArray(review.replies)) errors.push(`"replies" is not a list`);
  (Array.isArray(review.replies) ? review.replies : []).forEach((x, index) => {
    const who = `reply ${index + 1}`;
    for (const field of ["comment", "place", "text"]) if (!text(x?.[field])) errors.push(`${who} has no "${field}"`);
    sourceFaults(who, x?.sources, `/replies/${index}`);
  });

  // A test that asserts a step, a link or a check: the run that shows it, a `ran` coverage statement by ref, and the
  // assertion itself, quoted at its place. Without both the claim is read, and the page never shows it as tested.
  const confirmations = (who, list) => {
    if (list === undefined) return;
    if (!filled(list)) { errors.push(`${who}: confirmedBy lists nothing; leave it out, or name the run and the assertion`); return; }
    sourceFaults(`${who} confirmedBy`, list);
    const objects = list.filter((s) => s && typeof s === "object" && !Array.isArray(s)), head = review.passport?.head;
    for (const s of objects.filter((s) => s.ref !== undefined)) {
      const m = /^\/coverageStructured\/(\d+)$/.exec(String(s.ref)), c = m && review.coverageStructured?.[+m[1]];
      if (!m) { errors.push(`${who}: confirmedBy cites ${s.ref}; it cites runs and assertions only`); continue; }
      if (c && c.kind !== "ran") { errors.push(`${who}: confirmedBy cites coverage statement ${+m[1] + 1}, which is ${c.kind}, not a run`); continue; }
      if (c && !text(c.revision)) warnings.push(`${who}: confirmedBy cites a run that names no revision: say what code it ran on`);
      else if (c && text(head) && !sameRevision(c.revision, head)) warnings.push(`${who}: confirmedBy cites a run at ${c.revision}, not the reviewed head ${head}: the page shows it as tested at another revision`);
    }
    if (!objects.some((s) => { const m = /^\/coverageStructured\/(\d+)$/.exec(String(s.ref ?? "")); return m && review.coverageStructured?.[+m[1]]?.kind === "ran"; }))
      errors.push(`${who}: confirmedBy names no "ran" coverage statement: cite the run, as {"ref": "/coverageStructured/N"}`);
    if (!objects.some((s) => s.ref === undefined && text(s.at) && text(s.quote))) errors.push(`${who}: confirmedBy quotes no assertion: cite the test's line that asserts it, with its quote`);
  };
  // A route follows one behaviour through the code in the order it runs: each step at a block of the diff, or at
  // unchanged code it passes through, quoted; its role there; and how each step gets what the one before produced —
  // from the second step on in order, or on `links` when the route forks, joins or loops. A route of `states` has
  // states for steps and transitions for links, each with its trigger. A step where the path ends early says so in
  // `stops`, with the finding or question that says whether it should go on.
  const STEP_LIMIT = 12;
  if (review.routes !== undefined && !Array.isArray(review.routes)) errors.push(`"routes" is not a list`);
  const routes = Array.isArray(review.routes) ? review.routes : [];
  routes.forEach((route, index) => {
    const who = `route ${index + 1}`;
    if (!text(route?.title)) errors.push(`${who} has no "title": name the behaviour it follows`);
    if (route?.requirements !== undefined && !Array.isArray(route.requirements)) errors.push(`${who}: requirements is not a list`);
    else refs(who, route?.requirements, requirements, "requirement");
    if (route?.kind !== undefined && !["path", "states"].includes(route.kind)) errors.push(`${who}: kind is "path" or "states"`);
    if (!Array.isArray(route?.steps) || route.steps.length < 2) { errors.push(`${who} has fewer than two steps: a route runs through several places`); return; }
    const states = route.kind === "states", steps = route.steps, n = steps.length;
    if (route.links !== undefined && !filled(route.links)) errors.push(`${who}: links lists nothing; leave it out for steps in order`);
    const links = filled(route.links) ? route.links : null;
    if (states && !links) errors.push(`${who} follows states and has no links: each transition is a link, its trigger in "via"`);
    if (n > STEP_LIMIT) warnings.push(`${who} has ${n} steps: above ${STEP_LIMIT} a flow is hard to follow; follow a shorter part, or split it`);
    steps.forEach((step, k) => {
      const w = `${who} step ${k + 1}`, hasBlock = step?.block !== undefined, hasAt = step?.at !== undefined;
      if (hasBlock === hasAt) errors.push(`${w} names ${hasBlock ? "both a block and a place" : "neither a block nor a place"}: a block of the diff, or "at" with the "quote" of its line for code outside it`);
      else if (hasBlock && (!Number.isInteger(step.block) || step.block < 1 || step.block > review.blocks.length)) errors.push(`${w} names block ${step.block}, which is not listed`);
      else if (hasAt && (!text(step.at) || !text(step.quote))) errors.push(`${w}: a place outside the diff needs "at" and the "quote" of its line`);
      else if (hasAt) {
        const [, p, line] = /^(.*):(\d+)$/.exec(step.at) ?? [], file = p && files.find((f) => f.path === p);
        if (file && changedLines(file).some((l) => l.kind === "add" && l.new === +line)) warnings.push(`${w} is at ${step.at}, a line this diff changes: name its block instead`);
      }
      if (!text(step?.role)) errors.push(`${w} has no "role": ${states ? "what the state is" : "what its code does for this behaviour"}`);
      if (step?.value !== undefined && !text(step.value)) errors.push(`${w}: value is empty`);
      if (links && step?.via !== undefined) errors.push(`${w} has "via", and the route has links: say it on the link into the step`);
      if (!links && k > 0 && !text(step?.via)) errors.push(`${w} has no "via": how it gets what step ${k} produced, with its place`);
      if (step?.stops !== undefined) {
        const s = step.stops, ok = s && typeof s === "object" && !Array.isArray(s) && (s.finding === undefined) !== (s.question === undefined);
        if (!ok) errors.push(`${w}: stops names one finding or one question, as {"finding": id} or {"question": n}`);
        else if (s.finding !== undefined) refs(w, [s.finding], findings, "finding");
        else refs(w, [s.question], questions, "question");
        if (links ? links.some((l) => l?.from === k + 1 && l?.to !== k + 1) : k < n - 1) errors.push(`${w} stops, and the route goes on from it: a path stops at a step it does not leave`);
      }
      if (step?.findings !== undefined && !Array.isArray(step.findings)) errors.push(`${w}: findings is not a list`);
      else refs(w, step?.findings, findings, "finding");
      if (step?.questions !== undefined && !Array.isArray(step.questions)) errors.push(`${w}: questions is not a list`);
      else refs(w, step?.questions, questions, "question");
      confirmations(w, step?.confirmedBy);
    });
    (links ?? []).forEach((l, j) => {
      const lw = `${who} link ${j + 1}`;
      for (const end of ["from", "to"]) if (!Number.isInteger(l?.[end]) || l[end] < 1 || l[end] > n) errors.push(`${lw}: ${end} is a step number of this route, from 1`);
      if (l?.from === l?.to && !states) errors.push(`${lw} leads a step to itself: only a state may stay where it is`);
      if (!text(l?.via)) errors.push(`${lw} has no "via": ${states ? "the trigger that makes the move" : "how the step gets what the one before produced, with its place"}`);
      if (l?.question !== undefined) refs(lw, [l.question], questions, "question");
      confirmations(lw, l?.confirmedBy);
    });
    if (links) steps.forEach((_, k) => { if (!links.some((l) => l?.from === k + 1 || l?.to === k + 1)) errors.push(`${who} step ${k + 1} is on no link`); });
  });
  // A check a person runs, as the record keeps it: the point of a route it exercises, the test that asserts the same,
  // and what the owner observed earlier — each result at the revision and in the conditions it was made in, never
  // a result for this one.
  const RESULTS = ["pass", "fail", "could-not-run", "observed"];
  (review.checks ?? []).forEach((c, index) => {
    const name = `check ${index + 1}`;
    if (c.route !== undefined) {
      const p = c.route, rt = p && Number.isInteger(p.route) ? routes[p.route - 1] : undefined;
      if (!rt) errors.push(`${name}: route names route ${p?.route}, which is not listed`);
      else {
        if (p.step !== undefined && (!Number.isInteger(p.step) || p.step < 1 || p.step > (rt.steps?.length ?? 0))) errors.push(`${name}: route ${p.route} has no step ${p.step}`);
        if (p.link !== undefined && (!Number.isInteger(p.link) || p.link < 1 || p.link > (rt.links?.length ?? 0))) errors.push(`${name}: route ${p.route} has no link ${p.link}`);
        if (p.step !== undefined && p.link !== undefined) errors.push(`${name}: route names a step or a link, not both`);
      }
    }
    confirmations(name, c.confirmedBy);
    if (c.observations !== undefined && !Array.isArray(c.observations)) errors.push(`${name}: observations is not a list`);
    (Array.isArray(c.observations) ? c.observations : []).forEach((o, j) => {
      const ow = `${name} observation ${j + 1}`;
      if (!RESULTS.includes(o?.result)) errors.push(`${ow}: result is one of ${RESULTS.join(", ")}`);
      if (!/^[0-9a-f]{64}$/.test(String(o?.diff ?? ""))) errors.push(`${ow} has no "diff": the export's diff_sha256, which names the code it was made on`);
      for (const k of ["revision", "note", "conditions", "by"]) if (o?.[k] !== undefined && !text(o[k])) errors.push(`${ow}: ${k} is empty`);
    });
  });

  // Code kept only for requirements to confirm stays because of a proposal nobody has accepted: a question names each
  // such requirement, so the owner confirms it or lets it go; one decision whose variants combine can ask for all of them.
  const asked = askedAbout(review);
  const unconfirmed = new Set();
  review.blocks.forEach((block) => {
    const served = (block.serves ?? []).map((id) => review.requirements.find((r) => r.id === id)).filter(Boolean);
    if (block.verdict === "keep" && served.length && served.every((r) => SOURCES.includes(r.source) && !ESTABLISHED.has(r.source))) for (const r of served) if (!asked.has(r.id)) unconfirmed.add(r.id);
  });
  for (const id of unconfirmed) warnings.push(`requirement ${id} is to confirm, and kept code serves only such requirements: ask the owner in a question that cites it (one decision whose variants combine can ask for several)`);
  // A requirement many blocks serve reads as a long list; a route says what role each block plays.
  const routed = new Set((Array.isArray(review.routes) ? review.routes : []).flatMap((r) => Array.isArray(r?.requirements) ? r.requirements : []));
  for (const r of review.requirements) {
    const n = review.blocks.filter((b) => Array.isArray(b.serves) && b.serves.includes(r.id)).length;
    if (n > 8 && !routed.has(r.id)) warnings.push(`requirement ${r.id} is served by ${n} blocks and no route follows it: follow it through a route, so each block's part in it shows`);
  }

  for (const file of files) {
    const loose = changedLines(file).filter((l) => !blank(l) && !owner.has(`${file.path}\n${address(l)}`));
    const of = (kind) => compact(loose.filter((l) => l.kind === kind).map(numberOf));
    if (loose.length) errors.push(`${file.path}: no block covers ${[["added", of("add")], ["removed", of("del")]]
      .filter(([, lines]) => lines).map(([field, lines]) => `${field} ${lines}`).join("; ")}`);
  }
  return { errors, warnings, owner };
}

export { sourceOf } from "./sources.mjs";

// What the renderings read: blocks with their number, lines and size; requirements with the blocks that serve
// them, the findings that break them and the ones that leave them untested; units with their blocks; screens with
// their pictures read; and a name for this review that no other review has. Nothing here is written by the reviewer twice.
export function modelOf(review, files, owner, directory) {
  const blocks = review.blocks.map((block, index) => ({ ...block, id: index + 1, does: block.does ?? "", serves: block.serves ?? [], findings: block.findings ?? [], questions: block.questions ?? [], added: [], removed: [], weightLines: { added: 0, removed: 0 } }));
  for (const file of files) for (const line of changedLines(file)) {
    const index = owner.get(`${file.path}\n${address(line)}`);
    if (index !== undefined) {
      const field = line.kind === "add" ? "added" : "removed";
      blocks[index][field].push(numberOf(line));
      if (!blank(line)) blocks[index].weightLines[field]++;
    }
  }
  for (const block of blocks) {
    block.size = block.added.length + block.removed.length;
    block.where = [block.added.length && `+${compact(block.added)}`, block.removed.length && `-${compact(block.removed)}`].filter(Boolean).join(" ");
  }
  const naming = (field, id) => review.findings.filter((f) => f[field]?.includes(id)).map((f) => f.id);
  // A requirement's one state, in this order: a permission is never met, a finding that breaks it outweighs the
  // reviewer's «met», and whatever is left is not checked.
  // The established requirements first, then the ones to confirm, each in the record's order: every rendering lists them so.
  const requirements = review.requirements.map((r) => {
    const broken = naming("breaks", r.id);
    return { ...r, blocks: blocks.filter((b) => b.serves.includes(r.id)), broken, untested: naming("untested", r.id),
      state: r.permission ? "permission" : broken.length ? "fail" : r.met ? "met" : "unchecked", established: ESTABLISHED.has(r.source) };
  });
  requirements.sort((a, b) => b.established - a.established);
  // The lines of some blocks under each block verdict: what a unit or the whole change holds of each.
  const linesOf = (list) => Object.fromEntries(VERDICTS.map((v) => [v, list.filter((b) => b.verdict === v).reduce((sum, b) => sum + b.size, 0)]));
  const unit = (u) => { const own = blocks.filter((b) => b.unit === u.name); return { ...u, uses: u.uses ?? [], findings: u.findings ?? [], questions: u.questions ?? [], blocks: own, lines: linesOf(own) }; };
  const screens = (review.screens ?? []).map((screen) => ({ ...screen, differences: screen.differences ?? [],
    provenance: screen.historical ? (screen.revision ? "historical" : "historical-unknown") : screen.revision ? "revision" : "revision-unknown",
    ...Object.fromEntries(SHOTS.filter((shot) => screen[shot] !== undefined).map((shot) => [shot, pictureOf(screen[shot], directory)])) }));
  const scenarios = (review.scenarios ?? []).map((s) => ({ ...s, requirements: s.requirements ?? [], findings: naming("scenarios", s.id) }));
  const weighed = weighMechanisms(review.mechanisms ?? [], blocks);
  // Questions keep their place as their number; children are derived from parent, never stored twice.
  const questions = (review.questions ?? []).map((q, index) => ({ ...q, id: index + 1, children: [] }));
  for (const q of questions) if (q.parent && questions[q.parent.question - 1]) questions[q.parent.question - 1].children.push(q.id);
  const fileMeta = files.map((f) => ({ path: f.path, status: f.status ?? "M", purpose: purposeOfPath(f.path) }));
  // A block of tests inside a production file is tests; every other block follows its file.
  const blockPurpose = Object.fromEntries(blocks.map((b) => [b.id, b.kind === "test" && fileMeta.find((f) => f.path === b.path)?.purpose === "production" ? "tests" : purposeOfPath(b.path)]));
  const purposeCounts = Object.fromEntries(PURPOSES.map((c) => [c, { files: 0, blocks: 0, lines: 0 }]));
  for (const f of fileMeta) purposeCounts[f.purpose].files++;
  for (const b of blocks) { const c = purposeCounts[blockPurpose[b.id]]; c.blocks++; c.lines += b.size; }
  const blockFile = Object.fromEntries(blocks.map((b) => [b.id, files.findIndex((f) => f.path === b.path)]));
  // Counters over unique sets.
  const lines = { added: 0, removed: 0 };
  for (const f of files) for (const l of changedLines(f)) lines[l.kind === "add" ? "added" : "removed"]++;
  const counters = {
    files: files.length, lines,
    addedFiles: fileMeta.filter((f) => f.status === "A").length, removedFiles: fileMeta.filter((f) => f.status === "D").length,
    modifiedFiles: fileMeta.filter((f) => f.status === "M").length,
    blocks: blocks.length, verdicts: Object.fromEntries(VERDICTS.map((v) => [v, blocks.filter((b) => b.verdict === v).length])), verdictLines: linesOf(blocks),
    nonblank: { added: blocks.reduce((sum, b) => sum + b.weightLines.added, 0), removed: blocks.reduce((sum, b) => sum + b.weightLines.removed, 0) },
    decisions: questions.filter((q) => q.kind === "decision").length,
  };
  // Code kept for no requirement, or only for assumed ones, is where a convenience of the author's stays unasked:
  // the check warns about both, and the page lists them for the reviewer.
  const kept = blocks.filter((b) => b.verdict === "keep");
  const asked = askedAbout(review);
  const assumed = (b) => b.serves.length && b.serves.every((id) => !ESTABLISHED.has(review.requirements.find((r) => r.id === id)?.source)) && b.serves.some((id) => !asked.has(id));
  return { blocks, scenarios, mechanisms: weighed, together: combinedWeight(weighed, blocks), requirements, units: (review.units ?? []).map(unit), target: (review.target_units ?? []).map(unit), screens, owner,
    questions, files: fileMeta, counters,
    unasked: { unlinked: kept.filter((b) => !b.serves.length).map((b) => b.id), assumed: kept.filter(assumed).map((b) => b.id) },
    carried: blocks.filter((b) => b.carried === true).map((b) => b.id),
    purpose: { file: Object.fromEntries(fileMeta.map((f) => [f.path, f.purpose])), block: blockPurpose, counts: purposeCounts }, blockFile,
    key: keyOf(review) };
}
