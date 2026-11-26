// The owner's answers as data, independent of the page: the state, the applicability of conditional questions, the
// status of every item and the progress over them. Three layers stay apart: the review's verdicts in the record,
// these answers, and evidence obtained in a later revision of the record. The same runtime is handed to the page's
// script and imported by the tests; it touches no DOM, and every change returns a new state.
//
// One answer per item: a decision takes a variant — one or several, when its variants combine — or the owner's own words, a finding «fix it», «leave it» or own
// words, an idea «take it», «skip it» or own words, a fact or evidence request the owner's answer. Choosing one
// clears the other. Deferring takes a reason and keeps the answer it replaces as a draft, never in effect; so does
// a conditional question its parent retires, and neither answer returns silently. An answer to a fact or evidence
// request is the owner's input, never a verified result.
export function decisionRuntime() {
  // The export format's number: it tells a later reader how to read the export, and changes with the export alone.
  const schema = 8;
  // answers by item key; comments on a line of the saved diff (its path, side and number) and on a paragraph of the
  // report (an item or part of it, and a field). A comment made on a selection also keeps what was selected: in the
  // diff the lines it spans on one side (`line` to `end`), and in either the characters (`from` in its first line or
  // the paragraph, `to` in its last) and the selected words (`quote`). A comment never answers anything.
  const empty = () => ({ answers: {}, lines: [], paragraphs: [] });
  const OPTIONS = { finding: ["fix", "leave"], idea: ["take", "skip"] };
  const REQUESTS = ["fact", "evidence"];
  // The items of a record, each under the key the page and the export name it by: questions by number, findings by
  // id, ideas by their place in the list. A question names its parent's key and the variants it applies under.
  const itemsOf = ({ questions = [], findings = [], ideas = [] }) => [
    ...questions.map((q) => ({ key: `q${q.id}`, kind: q.kind, options: q.kind === "decision" ? (q.variants ?? []).map((v) => v.id) : [],
      multiple: q.kind === "decision" && q.multiple === true,
      variants: Object.fromEntries((q.variants ?? []).map((v) => [v.id, v.text])),
      parent: q.parent ? { key: `q${q.parent.question}`, variants: q.parent.variants } : null })),
    ...findings.map((f) => ({ key: `f${f.id}`, kind: "finding", options: OPTIONS.finding, parent: null })),
    ...ideas.map((_, index) => ({ key: `i${index + 1}`, kind: "idea", options: OPTIONS.idea, parent: null })),
  ];
  const normalize = (raw) => {
    const object = (v) => v && typeof v === "object" && !Array.isArray(v);
    const list = (v, ok) => Array.isArray(v) ? v.filter((c) => object(c) && has(c.text) && ok(c)) : [];
    if (!object(raw)) return empty();
    return { answers: object(raw.answers) ? { ...raw.answers } : {},
      lines: list(raw.lines, (c) => typeof c.path === "string" && ["head", "base"].includes(c.side) && Number.isInteger(c.line) && spanOk(c) && (c.end === undefined || (Number.isInteger(c.end) && c.end >= c.line))),
      paragraphs: list(raw.paragraphs, (c) => typeof c.item === "string" && typeof c.field === "string" && spanOk(c)) };
  };
  const entryOf = (state, key) => state.answers[key] ?? {};
  const byKeyOf = (items) => new Map(items.map((item) => [item.key, item]));
  const has = (text) => String(text ?? "").trim() !== "";
  // The variants chosen, as a list whether the question takes one or several.
  const chosen = (entry) => entry.choice === undefined ? [] : [].concat(entry.choice);
  // A conditional question applies while its parent applies and has no variant in effect, or has one it lists.
  const applicableIn = (item, state, byKey, seen = new Set()) => {
    if (!item.parent) return true;
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    const parent = byKey.get(item.parent.key);
    if (!parent || !applicableIn(parent, state, byKey, seen)) return false;
    const entry = entryOf(state, parent.key);
    return entry.deferred || entry.choice === undefined || chosen(entry).some((id) => item.parent.variants.includes(id));
  };
  const statusIn = (item, state, byKey) => {
    const entry = entryOf(state, item.key), draft = entry.draft ?? null;
    if (!applicableIn(item, state, byKey)) return { state: "not-applicable", draft };
    if (entry.deferred) return { state: "deferred", reason: entry.reason, draft };
    if (entry.choice !== undefined) return { state: "decided", choice: entry.choice, draft };
    if (has(entry.text)) return { state: REQUESTS.includes(item.kind) ? "answered" : "decided", text: entry.text, draft };
    return { state: "open", draft };
  };
  // A question its parent retires keeps its answer as a draft; one pass is stable, since applicability rests on the
  // parents' answers, which settling never touches.
  const settle = (items, state) => {
    const byKey = byKeyOf(items), answers = { ...state.answers };
    for (const item of items) {
      const entry = answers[item.key];
      if (!item.parent || !entry || entry.deferred || applicableIn(item, { answers }, byKey)) continue;
      if (entry.choice === undefined && !has(entry.text)) continue;
      const { choice, text, ...rest } = entry;
      answers[item.key] = { ...rest, draft: choice !== undefined ? { choice } : { text } };
    }
    return { ...state, answers };
  };
  const put = (items, state, key, entry) => {
    const answers = { ...state.answers };
    // Nothing empty is stored: a blank own answer is no answer.
    const kept = Object.fromEntries(Object.entries(entry).filter(([field, value]) => value !== undefined && value !== null && value !== false && (field === "text" ? has(value) : value !== "")));
    if (Object.keys(kept).length) answers[key] = kept; else delete answers[key];
    return settle(items, { ...state, answers });
  };
  const item = (items, key) => {
    const found = items.find((i) => i.key === key);
    if (!found) throw new Error(`no item ${key}`);
    return found;
  };
  // Every change answers one item; one that is not applicable keeps what it has until its parent lets it apply.
  const change = (fn) => (items, state, key, ...args) => {
    if (statusIn(item(items, key), state, byKeyOf(items)).state === "not-applicable") return state;
    return fn(items, state, key, entryOf(state, key), ...args);
  };
  // A question of several variants toggles the one named, in the variants' order, and none left is no answer.
  const choose = change((items, state, key, entry, option) => {
    const it = item(items, key);
    if (!it.options.includes(option)) throw new Error(`${key} has no option ${option}`);
    if (!it.multiple) return put(items, state, key, { zones: entry.zones, choice: option });
    const was = chosen(entry), next = it.options.filter((id) => was.includes(id) !== (id === option));
    return put(items, state, key, { zones: entry.zones, choice: next.length ? next : undefined });
  });
  const write = change((items, state, key, entry, text) => put(items, state, key, { zones: entry.zones, text: String(text ?? "") }));
  // A deferral without a reason is refused: the same state comes back.
  const defer = change((items, state, key, entry, reason) => {
    if (!has(reason)) return state;
    const draft = entry.choice !== undefined ? { choice: entry.choice } : has(entry.text) ? { text: entry.text } : entry.draft;
    return put(items, state, key, { zones: entry.zones, deferred: true, reason: String(reason).trim(), draft });
  });
  const undefer = change((items, state, key, entry) => put(items, state, key, { zones: entry.zones, draft: entry.draft }));
  const applyDraft = change((items, state, key, entry) => entry.draft ? put(items, state, key, { zones: entry.zones, ...entry.draft }) : state);
  const clear = change((items, state, key) => put(items, state, key, {}));
  // A zone mark is the owner's note on an evidence request, never evidence.
  const markZone = (items, state, key, zone, on) => {
    const entry = entryOf(state, key), zones = { ...entry.zones };
    if (on) zones[zone] = true; else delete zones[zone];
    return put(items, state, key, { ...entry, zones: Object.keys(zones).length ? zones : undefined });
  };
  // What counts as done, wherever the page counts or lists done items: a decided item, and an answered request, which
  // keeps its own state, since it is the owner's input, not a verified result.
  const DONE = ["decided", "answered"];
  // Progress over every applicable item: done as above, open, deferred. Within it the choices — decisions, findings
  // and ideas — and the requests are counted apart, since an answered request is the owner's input, never a decision:
  // «Decided N of M» is decided of choices, and the requests read answered of requests, not verified.
  const progress = (items, state) => {
    const byKey = byKeyOf(items), counts = { total: 0, done: 0, open: 0, deferred: 0, choices: 0, decided: 0, requests: 0, answered: 0 };
    for (const i of items) {
      const s = statusIn(i, state, byKey).state;
      if (s === "not-applicable") continue;
      counts.total++;
      if (DONE.includes(s)) counts.done++; else if (s === "open") counts.open++; else counts.deferred++;
      if (REQUESTS.includes(i.kind)) { counts.requests++; if (s === "answered") counts.answered++; }
      else { counts.choices++; if (s === "decided") counts.decided++; }
    }
    return counts;
  };
  // The nearest ancestor still open while the item applies: its answer holds only as long as that ancestor's answer
  // keeps it applicable.
  const waitingIn = (item, state, byKey) => {
    if (statusIn(item, state, byKey).state === "not-applicable") return null;
    for (let at = item, seen = new Set(); at.parent && !seen.has(at.key); at = byKey.get(at.parent.key)) {
      seen.add(at.key);
      if (!byKey.has(at.parent.key)) return null;
      if (statusIn(byKey.get(at.parent.key), state, byKey).state === "open") return at.parent.key;
    }
    return null;
  };
  // Undo of one action on `key`: the entries it changed go back to what they were, each only if nothing changed it
  // since, so a later answer to another item stays. `before` and `after` map keys to entries (undefined for none). An
  // action whose own item has changed since is superseded: the same state comes back.
  const undo = (items, state, key, before, after) => {
    if (JSON.stringify(state.answers[key]) !== JSON.stringify(after[key])) return state;
    const answers = { ...state.answers };
    for (const [key, entry] of Object.entries(before)) {
      if (JSON.stringify(answers[key]) !== JSON.stringify(after[key])) continue;
      if (entry === undefined) delete answers[key]; else answers[key] = entry;
    }
    return settle(items, { ...state, answers });
  };
  // What a selection kept, when there is one: whole numbers for the characters and a non-empty quote.
  const spanOk = (c) => ["from", "to"].every((k) => c[k] === undefined || (Number.isInteger(c[k]) && c[k] >= 0)) && (c.quote === undefined || has(c.quote));
  // One comment per anchor — a line comment's is its last line — : new text replaces it in place, empty text removes it.
  const comment = (list, anchor, text, same) => {
    const at = list.findIndex((c) => same(c, anchor)), next = [...list];
    if (!has(text)) { if (at >= 0) next.splice(at, 1); return next; }
    const entry = { ...Object.fromEntries(Object.entries(anchor).filter(([, v]) => v !== undefined)), text: String(text).trim() };
    if (at >= 0) next[at] = entry; else next.push(entry);
    return next;
  };
  const lineComment = (state, { path, side, line, end, from, to, quote }, text) =>
    ({ ...state, lines: comment(state.lines, { path, side, line, end: end > line ? end : undefined, from, to, quote }, text,
      (c, a) => c.path === a.path && c.side === a.side && (c.end ?? c.line) === (a.end ?? a.line)) });
  const paragraphComment = (state, { item, field, from, to, quote }, text) =>
    ({ ...state, paragraphs: comment(state.paragraphs, { item, field, from, to, quote }, text, (c, a) => c.item === a.item && c.field === a.field) });
  // The one payload behind the export's preview, its text and its JSON. Each item says its status and the answer in
  // effect; an answer not in effect travels as a draft; a request's answer is "answered", never verified; a zone mark is
  // the owner's mark. A conditional item whose parent is still open says so: its answer holds only while the parent
  // leaves it applicable. A line comment holds for the saved diff the digest names; a paragraph comment names the
  // item or part of the report and its field.
  const exportOf = (items, state, meta) => {
    const byKey = byKeyOf(items);
    const answerOf = (item, a) => a.choice !== undefined
      ? (item.kind !== "decision" ? { option: a.choice } : item.multiple ? { variants: chosen(a).map((id) => ({ id, text: item.variants[id] })) } : { variant: { id: a.choice, text: item.variants[a.choice] } })
      : has(a.text) ? { text: a.text } : {};
    return {
      schema_version: schema, record_sha256: meta.recordSha, diff_sha256: meta.diffSha, key: meta.key, title: meta.title, range: meta.range,
      progress: (({ total, done, open, deferred }) => ({ total, done, open, deferred }))(progress(items, state)),
      items: items.map((item) => {
        const s = statusIn(item, state, byKey), entry = entryOf(state, item.key), parent = waitingIn(item, state, byKey);
        const zones = Object.keys(entry.zones ?? {}).map(Number).sort((a, b) => a - b);
        return { item: item.key, kind: item.kind, status: s.state, ...answerOf(item, entry), ...(s.reason ? { reason: s.reason } : {}),
          ...(s.draft ? { draft: answerOf(item, s.draft) } : {}), ...(zones.length ? { zones } : {}), ...(parent ? { waiting_for_parent: parent } : {}) };
      }),
      lineComments: state.lines, paragraphComments: state.paragraphs,
    };
  };
  return { schema, empty, normalize, itemsOf, settle, choose, write, defer, undefer, applyDraft, clear, markZone, progress, undo, lineComment, paragraphComment, exportOf,
    waitingFor: (items, state, key) => waitingIn(item(items, key), state, byKeyOf(items)),
    done: (items, state, key) => DONE.includes(statusIn(item(items, key), state, byKeyOf(items)).state),
    status: (items, state, key) => statusIn(item(items, key), state, byKeyOf(items)),
    applicable: (items, state, key) => applicableIn(item(items, key), state, byKeyOf(items)) };
}

export const { schema, empty, normalize, itemsOf, settle, choose, write, defer, undefer, applyDraft, clear, markZone, progress, undo, lineComment,
  paragraphComment, exportOf, waitingFor, done, status, applicable } = decisionRuntime();
