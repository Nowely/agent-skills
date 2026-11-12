// A review as data: its vocabulary, its faults against the diff, and the model both renderings read.
// references/interactive-report.md defines the data for the reviewer; this file is what holds a review to it.
import fs from "node:fs";
import path from "node:path";
import { address, blank, changedLines, numberOf } from "./diff.mjs";

export const VERDICTS = ["keep", "fix", "remove"];
export const UNIT_VERDICTS = ["keep", "split", "merge", "remove"];
export const DIRECTIONS = ["behavior", "necessity", "design", "tests"];
export const EVIDENCE = ["ran", "traced", "judgment"];

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
  for (const field of ["title", "range", "verdict", "target", "recommendation"]) if (!text(review[field])) errors.push(`"${field}" is missing`);
  if (!text(review.change?.goal)) errors.push('"change.goal" is missing');
  for (const field of ["parts", "sources"]) if (!filled(review.change?.[field])) errors.push(`"change.${field}" lists nothing`);
  for (const field of ["requirements", "findings", "blocks"]) if (!Array.isArray(review[field])) errors.push(`"${field}" is not a list`);
  if (errors.length) return { errors, owner };

  const known = (items, what, key) => {
    const seen = new Set();
    for (const item of items) { if (seen.has(item[key])) errors.push(`${what} ${item[key]} appears twice`); seen.add(item[key]); }
    return seen;
  };
  const refs = (who, ids, listed, what) => { for (const id of ids ?? []) if (!listed.has(id)) errors.push(`${who} names ${what} ${id}, which is not listed`); };
  const requirements = known(review.requirements, "requirement", "id"), findings = known(review.findings, "finding", "id");
  for (const r of review.requirements) if (!text(r.text)) errors.push(`requirement ${r.id} has no text`);
  for (const f of review.findings) {
    for (const field of ["title", "at", "what", "fix"]) if (!text(f[field])) errors.push(`finding ${f.id} has no "${field}"`);
    if (!DIRECTIONS.includes(f.direction)) errors.push(`finding ${f.id}: direction is one of ${DIRECTIONS.join(", ")}`);
    if (!EVIDENCE.includes(f.evidence)) errors.push(`finding ${f.id}: evidence is one of ${EVIDENCE.join(", ")}`);
    refs(`finding ${f.id}`, f.breaks, requirements, "requirement");
  }
  for (const [index, idea] of (review.ideas ?? []).entries())
    for (const field of ["title", "text"]) if (!text(idea[field])) errors.push(`idea ${index + 1} has no "${field}"`);

  (review.screens ?? []).forEach((screen, index) => {
    const name = `screen ${index + 1}`;
    if (!text(screen.name)) errors.push(`${name} has no "name"`);
    for (const shot of SHOTS) if (screen[shot] !== undefined && !pictureOf(screen[shot], directory))
      errors.push(`${name}: ${shot} "${screen[shot]}" is neither a picture file there (${Object.keys(PICTURE_TYPES).join(", ")}) nor an https link`);
    if (!SHOTS.some((shot) => screen[shot] !== undefined) && !text(screen.missing)) errors.push(`${name} has no picture and no "missing"`);
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
    if (!UNIT_VERDICTS.includes(u.verdict)) errors.push(`unit ${u.name}: verdict is one of ${UNIT_VERDICTS.join(", ")}`);
    refs(`unit ${u.name}`, u.findings, findings, "finding");
    if (u.verdict !== "keep" && !u.findings?.length) errors.push(`unit ${u.name} is to ${u.verdict} and names no finding`);
    if (!review.blocks.some((b) => b.unit === u.name)) errors.push(`unit ${u.name} has no block: give its blocks "unit": "${u.name}", or mark it "existing"`);
  }

  review.blocks.forEach((block, index) => {
    const name = `block ${index + 1}`, file = files.find((f) => f.path === block.path);
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
// them and the findings that break them; units with their blocks; screens with their pictures read. Nothing here is
// written by the reviewer twice.
export function modelOf(review, files, owner, directory) {
  const blocks = review.blocks.map((block, index) => ({ ...block, id: index + 1, serves: block.serves ?? [], findings: block.findings ?? [], added: [], removed: [] }));
  for (const file of files) for (const line of changedLines(file)) {
    const index = owner.get(`${file.path}\n${address(line)}`);
    if (index !== undefined) blocks[index][line.kind === "add" ? "added" : "removed"].push(numberOf(line));
  }
  for (const block of blocks) {
    block.size = block.added.length + block.removed.length;
    block.where = [block.added.length && `+${compact(block.added)}`, block.removed.length && `-${compact(block.removed)}`].filter(Boolean).join(" ");
  }
  const requirements = review.requirements.map((r) => ({ ...r, blocks: blocks.filter((b) => b.serves.includes(r.id)),
    broken: review.findings.filter((f) => f.breaks?.includes(r.id)).map((f) => f.id) }));
  const unit = (u) => ({ ...u, uses: u.uses ?? [], findings: u.findings ?? [], blocks: blocks.filter((b) => b.unit === u.name) });
  const screens = (review.screens ?? []).map((screen) => ({ ...screen, differences: screen.differences ?? [],
    ...Object.fromEntries(SHOTS.filter((shot) => screen[shot] !== undefined).map((shot) => [shot, pictureOf(screen[shot], directory)])) }));
  return { blocks, requirements, units: (review.units ?? []).map(unit), target: (review.target_units ?? []).map(unit), screens, owner };
}
