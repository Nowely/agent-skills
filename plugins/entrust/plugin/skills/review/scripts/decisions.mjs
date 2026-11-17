// The user's decisions as data, independent of the page: state, the applicability of child questions, counters
// and the export. Three layers stay apart: the review's verdicts in the record, these decisions, and evidence
// obtained in a later revision of the record. The same runtime is embedded in the page's script and imported by
// the tests; it touches no DOM. Decisions are never carried between revisions by question number.
export function decisionRuntime() {
  const empty = () => ({ findings: {}, questions: {}, notes: {}, passages: [], zones: {} });
  const normalize = (raw) => {
    const state = empty();
    if (raw && typeof raw === "object" && !Array.isArray(raw))
      for (const key of Object.keys(state)) if (raw[key] !== undefined && raw[key] !== null) state[key] = raw[key];
    return state;
  };
  const entryOf = (state, id) => state.questions[id] || {};
  const noteOf = (state, id) => entryOf(state, id).note || state.notes["q" + id] || "";
  const byIdOf = (questions) => Object.fromEntries(questions.map((q) => [q.id, q]));
  // A child applies while its parent is undecided, and while the parent's accepted variant is one the child
  // listed. A selected radio alone never suppresses a child; an accepted variant outside the list does, and a
  // parent that is itself not applicable takes its children with it.
  const applicableIn = (q, state, byId, seen = new Set()) => {
    if (!q.parent) return true;
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    const parent = byId[q.parent.question];
    if (!parent || !applicableIn(parent, state, byId, seen)) return false;
    const entry = entryOf(state, parent.id);
    if (entry.choice !== "accepted") return true;
    return (q.parent.variants || []).includes(entry.variant);
  };
  // Settle drops the answers of children that became not applicable, so an old answer never returns silently
  // when the parent changes again; the comment stays. Applicability rests on the parent's accepted variant, not
  // on the child's own answer, so one pass is stable even down a chain.
  const settle = (questions, state) => {
    const byId = byIdOf(questions), next = { ...state, questions: { ...state.questions } };
    for (const q of questions) {
      if (!q.parent || applicableIn(q, next, byId)) continue;
      const entry = next.questions[q.id];
      if (entry && (entry.choice !== undefined || entry.variant !== undefined)) {
        const { choice, variant, ...rest } = entry;
        if (Object.keys(rest).length) next.questions[q.id] = rest; else delete next.questions[q.id];
      }
    }
    return next;
  };
  // Accepting a decision takes a chosen variant, or — where there are no variants — a substantive comment;
  // deferring takes a reason. An evidence question has no accept control at all.
  const validAccept = (q, state) => {
    const entry = entryOf(state, q.id);
    if (entry.choice !== "accepted") return false;
    return q.variants?.length ? !!entry.variant : noteOf(state, q.id).trim() !== "";
  };
  const validDefer = (q, state) => entryOf(state, q.id).choice === "deferred" && noteOf(state, q.id).trim() !== "";
  const counters = (questions, state) => {
    const byId = byIdOf(questions);
    let accepted = 0, deferred = 0, notApplicable = 0, total = 0;
    for (const q of questions) {
      if (q.kind !== "decision") continue;
      total++;
      if (!applicableIn(q, state, byId)) { notApplicable++; continue; }
      if (validAccept(q, state)) accepted++;
      else if (validDefer(q, state)) deferred++;
    }
    return { accepted, deferred, notApplicable, remaining: total - accepted - deferred - notApplicable };
  };
  const exportOf = (questions, state, meta) => {
    const byId = byIdOf(questions);
    return {
      schema_version: 3, record_sha256: meta.recordSha, diff_sha256: meta.diffSha, key: meta.key, title: meta.title, range: meta.range,
      findings: state.findings,
      questions: questions.filter((q) => q.kind === "decision").map((q) => {
        const entry = entryOf(state, q.id), variant = (q.variants ?? []).find((v) => v.id === entry.variant);
        return { question: q.id, status: applicableIn(q, state, byId) ? (entry.choice ?? "remaining") : "not-applicable",
          variant: variant ? { id: variant.id, text: variant.text } : null, comment: noteOf(state, q.id) || null };
      }),
      notes: state.notes, zones: state.zones, passages: state.passages,
    };
  };
  return { empty, normalize, entryOf, noteOf, settle, validAccept, validDefer, counters, exportOf,
    applicable: (q, state, questions) => applicableIn(q, state, byIdOf(questions)) };
}

const runtime = decisionRuntime();
export const { empty, normalize, entryOf, noteOf, settle, validAccept, validDefer, counters, exportOf, applicable } = runtime;