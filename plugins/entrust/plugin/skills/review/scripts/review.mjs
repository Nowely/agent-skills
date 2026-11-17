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
// Who raised a point against the draft, and what the review did with it.
export const CHALLENGERS = ["target", "critic", "verifier"];
export const OUTCOMES = ["accepted", "rejected", "owner"];
export const DIRECTIONS = ["behavior", "necessity", "design", "tests"];
export const EVIDENCE = ["ran", "read", "judgment"];
// Where a requirement comes from, and how the reviewer knows it is met: "judgment" is no way to know that.
export const SOURCES = ["task", "discussion", "project", "question", "assumption"];
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
export function compact(list) {
  const runs = [];
  for (const n of [...list].sort((a, b) => a - b)) {
    const last = runs.at(-1);
    if (last && n === last[1] + 1) last[1] = n; else runs.push([n, n]);
  }
  return runs.map(([a, b]) => a === b ? `${a}` : `${a}-${b}`).join(", ");
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
  errors.push(...labelFaults(review));
  if (errors.length) return { errors, warnings, owner };

  const known = (items, what, key) => {
    const seen = new Set();
    for (const item of items) { if (seen.has(item[key])) errors.push(`${what} ${item[key]} appears twice`); seen.add(item[key]); }
    return seen;
  };
  const refs = (who, ids, listed, what) => { for (const id of ids ?? []) if (!listed.has(id)) errors.push(`${who} names ${what} ${id}, which is not listed`); };
  // One source format everywhere: an internal ref the check resolves mechanically, or an external place.
  // An analytical claim without a source is a fault; a source that cannot travel with the record is a warning.
  const sourceFaults = (who, sources) => {
    if (!filled(sources)) { errors.push(`${who} names no source: an analytical claim needs one`); return; }
    for (const s of sources) {
      if (typeof s !== "object" || s === null || Array.isArray(s)) { errors.push(`${who}: a source is {ref} or {at, revision?, quote?}`); continue; }
      if (s.ref !== undefined) {
        const m = /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(s.ref)), list = m && review[m[1]];
        if (!m || !Array.isArray(list) || +m[2] >= list.length) errors.push(`${who}: source ref "${s.ref}" names nothing in the record`);
      } else if (text(s.at)) {
        if (s.revision !== undefined && !text(s.revision)) errors.push(`${who}: a source's revision is empty`);
        if (s.quote !== undefined && !text(s.quote)) errors.push(`${who}: a source's quote is empty`);
        if (!text(s.quote)) warnings.push(`${who}: source "${s.at}" has no quote; it does not travel without the file`);
        const place = /^(.+?):\d+(?:-\d+)?$/.exec(s.at);
        if (place && /[./]/.test(place[1]) && !fs.existsSync(path.resolve(directory, place[1]))) warnings.push(`${who}: source "${s.at}" is named but not beside the record`);
      } else errors.push(`${who}: a source needs "ref" or "at"`);
    }
  };
  const claims = (who, list, what) => {
    if (list === undefined) return;
    if (!Array.isArray(list)) { errors.push(`${who}: ${what} is not a list`); return; }
    list.forEach((c, i) => { const w = `${who} ${what} ${i + 1}`; if (!text(c?.text)) errors.push(`${w} has no text`); sourceFaults(w, c?.sources); });
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
  for (const r of review.requirements) {
    if (!text(r.text)) errors.push(`requirement ${r.id} has no text`);
    if (!SOURCES.includes(r.source)) errors.push(`requirement ${r.id}: source is one of ${SOURCES.join(", ")}`);
    if (r.met !== undefined && !MET.includes(r.met)) errors.push(`requirement ${r.id}: met is one of ${MET.join(", ")}, or left out when you did not check it`);
    const breaking = review.findings.filter((f) => f.breaks?.includes(r.id)).map((f) => f.id);
    if (r.met !== undefined && breaking.length) errors.push(`requirement ${r.id} is marked met, and finding ${breaking.join(", ")} breaks it`);
    if (r.not_checked !== undefined && !text(r.not_checked)) errors.push(`requirement ${r.id}: "not_checked" says what of it you did not check, or is left out`);
    // A permission allows; it does not oblige, so there is nothing to mark met.
    if (r.permission !== undefined && typeof r.permission !== "boolean") errors.push(`requirement ${r.id}: permission is true, or left out`);
    if (r.permission === true && r.met !== undefined) errors.push(`requirement ${r.id} is a permission, not an obligation: it cannot be marked met`);
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
  // A question is named by its place in the list, from 1. A question without a kind keeps the old shape:
  // its place and text, no invented variants, and no part in the owner's decision counters.
  const qList = review.questions ?? [];
  const questions = new Set(qList.map((_, index) => index + 1));
  qList.forEach((q, index) => {
    const who = `question ${index + 1}`;
    if (q.kind === undefined) return;
    if (!QUESTION_KINDS.includes(q.kind)) errors.push(`${who}: kind is one of ${QUESTION_KINDS.join(", ")}`);
    if (!text(q.at)) errors.push(`${who} has no "at"`);
    if (!text(q.text)) errors.push(`${who} has no "text"`);
    if (q.resolver !== undefined && !text(q.resolver)) errors.push(`${who}: resolver is a role name, or left out`);
    claims(who, q.context, "context");
    claims(who, q.zones, "zone");
    const variantIds = new Set();
    if (q.variants !== undefined) {
      if (!Array.isArray(q.variants)) errors.push(`${who}: variants is not a list`);
      else {
        if (!q.variants.length && q.kind === "decision") warnings.push(`${who} is a decision with no variants`);
        for (const v of q.variants) {
          const w = `${who} variant ${v?.id}`;
          if (!text(v?.id)) errors.push(`${who}: a variant has no id`);
          else if (variantIds.has(v.id)) errors.push(`${who}: variant id "${v.id}" appears twice`);
          else variantIds.add(v.id);
          if (!text(v?.text)) errors.push(`${w} has no text`);
          if (v?.consequences !== undefined && !Array.isArray(v.consequences)) errors.push(`${w}: consequences is not a list`);
          else if (!filled(v?.consequences)) warnings.push(`${w} lists no consequences`);
          else claims(w, v.consequences, "consequence");
        }
      }
    }
    if (q.recommendation !== undefined) {
      const w = `${who} recommendation`;
      if (!text(q.recommendation?.text)) errors.push(`${w} has no text`);
      if (q.recommendation?.variant !== undefined && !variantIds.has(q.recommendation.variant)) errors.push(`${w} names variant "${q.recommendation.variant}", which is not listed`);
      sourceFaults(w, q.recommendation?.sources);
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
        sourceFaults(name, screen.sources);
      }
    }
  });

  if (review.tradeoffs !== undefined) {
    if (!Array.isArray(review.tradeoffs)) errors.push('"tradeoffs" is not a list');
    else review.tradeoffs.forEach((x, index) => {
      const who = `tradeoff ${index + 1}`;
      if (!text(x?.text)) errors.push(`${who} has no text`);
      if (!text(x?.consequence)) errors.push(`${who} has no consequence`);
      sourceFaults(who, x?.sources);
    });
  }
  if (review.coverageStructured !== undefined) {
    if (!Array.isArray(review.coverageStructured)) errors.push('"coverageStructured" is not a list');
    else review.coverageStructured.forEach((c, index) => {
      const who = `coverageStructured ${index + 1}`;
      if (!COVERAGE_KINDS.includes(c?.kind)) errors.push(`${who}: kind is one of ${COVERAGE_KINDS.join(", ")}`);
      if (!text(c?.text)) errors.push(`${who} has no text`);
      if (c?.revision !== undefined && !text(c.revision)) errors.push(`${who}: revision is empty`);
      // A run is a claim about a checked version: an external source without a revision cannot travel to it.
      if (c?.kind === "ran" && !text(c.revision) && (Array.isArray(c.sources) ? c.sources : []).some((s) => s && typeof s === "object" && !Array.isArray(s) && s.ref === undefined && text(s.at)))
        warnings.push(`${who} claims a run on an external source without a revision: name the revision it ran at`);
      sourceFaults(who, c?.sources);
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
    // What a block does is written where it asks for something; a kept block's lines speak for themselves.
    if (block.verdict !== "keep" && !text(block.does)) errors.push(`${name} has no "does": say what a block not kept does`);
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

  for (const file of files) {
    const loose = changedLines(file).filter((l) => !blank(l) && !owner.has(`${file.path}\n${address(l)}`));
    const of = (kind) => compact(loose.filter((l) => l.kind === kind).map(numberOf));
    if (loose.length) errors.push(`${file.path}: no block covers ${[["added", of("add")], ["removed", of("del")]]
      .filter(([, lines]) => lines).map(([field, lines]) => `${field} ${lines}`).join("; ")}`);
  }
  return { errors, warnings, owner };
}

// A source as the words both renderings share: an internal ref resolves to the item it names, an external
// source to its place, revision and quote. The anchor is where the page links it; nothing here is invented.
export function sourceOf(source, review) {
  if (source?.ref !== undefined) {
    const m = /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(source.ref));
    if (!m) return { text: String(source.ref) };
    const [, field, at] = m, index = +at, item = Array.isArray(review[field]) ? review[field][index] : undefined;
    const anchors = { requirements: "#requirements", findings: `#f${item?.id}`, questions: `#q${index + 1}`, blocks: `#b${index + 1}`,
      mechanisms: `#m${index + 1}`, ideas: `#i${index + 1}`, checks: "#checks", scenarios: "#scenarios", screens: "#screens",
      challenges: "#challenges", units: "#structure", target_units: "#structure", tradeoffs: "#tradeoffs", coverageStructured: "#coverage" };
    const names = { requirements: `R${item?.id}`, findings: `F${item?.id}`, questions: `Q${index + 1}`, blocks: `B${index + 1}`, mechanisms: `M${index + 1}` };
    const anchor = anchors[field] && (item !== undefined || !["requirements", "findings"].includes(field)) ? anchors[field] : undefined;
    return { text: names[field] ?? `${field} ${index + 1}`, anchor };
  }
  if (source?.at !== undefined) return { text: [source.at, source.revision && `@ ${source.revision}`, source.quote && `“${source.quote}”`].filter(Boolean).join(" ") };
  return { text: "" };
}

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
  const requirements = review.requirements.map((r) => ({ ...r, blocks: blocks.filter((b) => b.serves.includes(r.id)),
    broken: naming("breaks", r.id), untested: naming("untested", r.id) }));
  const unit = (u) => ({ ...u, uses: u.uses ?? [], findings: u.findings ?? [], questions: u.questions ?? [], blocks: blocks.filter((b) => b.unit === u.name) });
  const screens = (review.screens ?? []).map((screen) => ({ ...screen, differences: screen.differences ?? [],
    ...Object.fromEntries(SHOTS.filter((shot) => screen[shot] !== undefined).map((shot) => [shot, pictureOf(screen[shot], directory)])) }));
  const { labels, ...content } = review;
  const scenarios = (review.scenarios ?? []).map((s) => ({ ...s, requirements: s.requirements ?? [], findings: naming("scenarios", s.id) }));
  const weighed = weighMechanisms(review.mechanisms ?? [], blocks);
  // Questions keep their place as their number; children are derived from parent, never stored twice.
  const questions = (review.questions ?? []).map((q, index) => ({ ...q, id: index + 1, children: [], blocks: 0 }));
  for (const q of questions) if (q.parent && questions[q.parent.question - 1]) questions[q.parent.question - 1].children.push(q.id);
  for (const b of blocks) for (const n of new Set(b.questions)) if (questions[n - 1]) questions[n - 1].blocks++;
  // The shortest suffix that names each file alone among the touched paths; the full path stays beside it.
  const paths = files.map((f) => f.path);
  const shortOf = (p) => {
    const parts = p.split("/");
    for (let n = 1; n < parts.length; n++) {
      const suffix = parts.slice(-n).join("/");
      if (paths.filter((other) => other === suffix || other.endsWith(`/${suffix}`)).length === 1) return suffix;
    }
    return p;
  };
  const fileMeta = files.map((f) => ({ path: f.path, status: f.status ?? "M", short: shortOf(f.path) }));
  // Counters over unique sets: a fragment naming two evidence questions is one fragment awaiting evidence.
  const evidenceIds = new Set(questions.filter((q) => q.kind === "evidence").map((q) => q.id));
  const lines = { added: 0, removed: 0 };
  for (const f of files) for (const l of changedLines(f)) lines[l.kind === "add" ? "added" : "removed"]++;
  const counters = {
    files: files.length, lines,
    addedFiles: fileMeta.filter((f) => f.status === "A").length, removedFiles: fileMeta.filter((f) => f.status === "D").length,
    modifiedFiles: fileMeta.filter((f) => f.status === "M").length,
    blocks: blocks.length, verdicts: Object.fromEntries(VERDICTS.map((v) => [v, blocks.filter((b) => b.verdict === v).length])),
    nonblank: { added: blocks.reduce((sum, b) => sum + b.weightLines.added, 0), removed: blocks.reduce((sum, b) => sum + b.weightLines.removed, 0) },
    evidenceBlocks: new Set(blocks.filter((b) => b.questions.some((n) => evidenceIds.has(n))).map((b) => b.id)).size,
    decisions: questions.filter((q) => q.kind === "decision").length,
  };
  return { blocks, scenarios, mechanisms: weighed, together: combinedWeight(weighed, blocks), requirements, units: (review.units ?? []).map(unit), target: (review.target_units ?? []).map(unit), screens, owner,
    questions, files: fileMeta, counters,
    key: createHash("sha256").update(JSON.stringify(content)).digest("hex").slice(0, 10) };
}
