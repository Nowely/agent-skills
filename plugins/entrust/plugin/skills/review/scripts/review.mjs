// A review as data: its vocabulary, its faults against the diff, and the model both renderings read.
// references/report-data.md defines the data for the reviewer; this file is what holds a review to it.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { address, blank, changedLines, numberOf } from "./diff.mjs";
import { labelFaults } from "./labels.mjs";

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
  let plurals;
  try { plurals = new Intl.PluralRules(language); } catch { plurals = new Intl.PluralRules("en"); }
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

export const VERDICTS = ["keep", "fix", "remove"];
export const UNIT_VERDICTS = ["keep", "fix", "split", "merge", "remove"];
export const DIRECTIONS = ["behavior", "necessity", "design", "tests"];
export const EVIDENCE = ["ran", "read", "judgment"];
// Where a requirement comes from, and how the reviewer knows it is met: "judgment" is no way to know that.
export const SOURCES = ["task", "discussion", "question", "assumption"];
export const MET = EVIDENCE.filter((word) => word !== "judgment");

const PICTURE_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
const SHOTS = ["mockup", "before", "after"];

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
function compact(list) {
  const runs = [];
  for (const n of [...list].sort((a, b) => a - b)) {
    const last = runs.at(-1);
    if (last && n === last[1] + 1) last[1] = n; else runs.push([n, n]);
  }
  return runs.map(([a, b]) => a === b ? `${a}` : `${a}-${b}`).join(", ");
}

// Every fault of the review, and which block owns each changed line ("path\n+12" -> block index).
export function check(review, files, directory) {
  const errors = [], owner = new Map();
  const text = (v) => typeof v === "string" && v.trim() !== "", filled = (v) => Array.isArray(v) && v.length > 0;
  for (const field of ["title", "range", "verdict", "now", "target", "recommendation"]) if (!text(review[field])) errors.push(`"${field}" is missing`);
  if (!text(review.change?.goal)) errors.push('"change.goal" is missing');
  for (const field of ["parts", "sources"]) if (!filled(review.change?.[field])) errors.push(`"change.${field}" lists nothing`);
  for (const field of ["requirements", "findings", "blocks"]) if (!Array.isArray(review[field])) errors.push(`"${field}" is not a list`);
  if (review.mechanisms !== undefined && !Array.isArray(review.mechanisms)) errors.push('"mechanisms" is not a list');
  if (review.scenarios !== undefined && !Array.isArray(review.scenarios)) errors.push('"scenarios" is not a list');
  errors.push(...labelFaults(review));
  if (errors.length) return { errors, owner };

  const known = (items, what, key) => {
    const seen = new Set();
    for (const item of items) { if (seen.has(item[key])) errors.push(`${what} ${item[key]} appears twice`); seen.add(item[key]); }
    return seen;
  };
  const refs = (who, ids, listed, what) => { for (const id of ids ?? []) if (!listed.has(id)) errors.push(`${who} names ${what} ${id}, which is not listed`); };
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
  for (const r of review.requirements) {
    if (!text(r.text)) errors.push(`requirement ${r.id} has no text`);
    if (!SOURCES.includes(r.source)) errors.push(`requirement ${r.id}: source is one of ${SOURCES.join(", ")}`);
    if (r.met !== undefined && !MET.includes(r.met)) errors.push(`requirement ${r.id}: met is one of ${MET.join(", ")}, or left out when you did not check it`);
    const breaking = review.findings.filter((f) => f.breaks?.includes(r.id)).map((f) => f.id);
    if (r.met !== undefined && breaking.length) errors.push(`requirement ${r.id} is marked met, and finding ${breaking.join(", ")} breaks it`);
    if (r.not_checked !== undefined && !text(r.not_checked)) errors.push(`requirement ${r.id}: "not_checked" says what of it you did not check, or is left out`);
  }
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
  for (const [index, idea] of (review.ideas ?? []).entries())
    for (const field of ["title", "text"]) if (!text(idea[field])) errors.push(`idea ${index + 1} has no "${field}"`);

  (review.screens ?? []).forEach((screen, index) => {
    const name = `screen ${index + 1}`;
    if (!text(screen.name)) errors.push(`${name} has no "name"`);
    for (const shot of SHOTS) if (screen[shot] !== undefined && !pictureOf(screen[shot], directory))
      errors.push(`${name}: ${shot} "${screen[shot]}" is neither a picture file there (${Object.keys(PICTURE_TYPES).join(", ")}) nor an https link`);
    // A match is a claim about two pictures; with nothing found and nothing claimed, the screen was not compared.
    if (screen.match && (screen.mockup === undefined || screen.after === undefined)) errors.push(`${name} is said to match, and has no ${screen.mockup === undefined ? "mockup" : "after"} picture`);
    if (screen.match && screen.differences?.length) errors.push(`${name} is said to match, and lists differences`);
    if (!screen.match && !screen.differences?.length && !text(screen.missing)) errors.push(`${name} has no difference and no "match": say in "missing" what you could not compare`);
    for (const difference of screen.differences ?? []) {
      if (!text(difference.what)) errors.push(`${name}: a difference has no "what"`);
      if (!text(difference.why) && difference.finding === undefined) errors.push(`${name}: a difference has neither "why" nor "finding"`);
      if (difference.finding !== undefined) refs(name, [difference.finding], findings, "finding");
    }
  });

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
    refs(`unit ${u.name}`, u.findings, findings, "finding");
    if (u.verdict !== "keep" && !u.findings?.length) errors.push(`unit ${u.name} is to ${u.verdict} and names no finding`);
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
      else if (!/[\w@./-]+\.\w+:\d+/.test(m.instead)) errors.push(`${who}: "instead" cites no place; name the path:line you read`);
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

  const written = (review.target_units ?? []).some((u) => !u.existing && !changed.has(u.name));
  for (const u of units.filter((u) => u.verdict === "split")) if (!written) errors.push(`unit ${u.name} is to split, and the target has no new unit: name what it splits into in "target_units"`);

  review.blocks.forEach((block, index) => {
    const name = `block ${index + 1}`, file = files.find((f) => f.path === block.path);
    if (block.kind !== undefined && !BLOCK_KINDS.includes(block.kind)) errors.push(`${name}: kind is one of ${BLOCK_KINDS.join(", ")}`);
    if (!file) return errors.push(`${name}: "${block.path}" is not a file of the diff`);
    if (!text(block.does)) errors.push(`${name} has no "does"`);
    if (!VERDICTS.includes(block.verdict)) errors.push(`${name}: verdict is one of ${VERDICTS.join(", ")}`);
    refs(name, block.serves, requirements, "requirement");
    refs(name, block.findings, findings, "finding");
    if (block.verdict !== "keep" && !block.findings?.length) errors.push(`${name} is to ${block.verdict} and names no finding`);
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

  for (const file of files) {
    const loose = changedLines(file).filter((l) => !blank(l) && !owner.has(`${file.path}\n${address(l)}`));
    const of = (kind) => compact(loose.filter((l) => l.kind === kind).map(numberOf));
    if (loose.length) errors.push(`${file.path}: no block covers ${[["added", of("add")], ["removed", of("del")]]
      .filter(([, lines]) => lines).map(([field, lines]) => `${field} ${lines}`).join("; ")}`);
  }
  return { errors, owner };
}

// What the renderings read: blocks with their number, lines and size; requirements with the blocks that serve
// them, the findings that break them and the ones that leave them untested; units with their blocks; screens with
// their pictures read; and a name for this review that no other review has. Nothing here is written by the reviewer twice.
export function modelOf(review, files, owner, directory) {
  const blocks = review.blocks.map((block, index) => ({ ...block, id: index + 1, serves: block.serves ?? [], findings: block.findings ?? [], added: [], removed: [], weightLines: { added: 0, removed: 0 } }));
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
  const requirements = review.requirements.map((r) => ({ ...r, blocks: blocks.filter((b) => b.serves.includes(r.id)),
    broken: naming("breaks", r.id), untested: naming("untested", r.id) }));
  const unit = (u) => ({ ...u, uses: u.uses ?? [], findings: u.findings ?? [], blocks: blocks.filter((b) => b.unit === u.name) });
  const screens = (review.screens ?? []).map((screen) => ({ ...screen, differences: screen.differences ?? [],
    ...Object.fromEntries(SHOTS.filter((shot) => screen[shot] !== undefined).map((shot) => [shot, pictureOf(screen[shot], directory)])) }));
  const { labels, ...content } = review;
  const scenarios = (review.scenarios ?? []).map((s) => ({ ...s, requirements: s.requirements ?? [], findings: naming("scenarios", s.id) }));
  return { blocks, scenarios, mechanisms: weighMechanisms(review.mechanisms ?? [], blocks), requirements, units: (review.units ?? []).map(unit), target: (review.target_units ?? []).map(unit), screens, owner,
    key: createHash("sha256").update(JSON.stringify(content)).digest("hex").slice(0, 10) };
}
