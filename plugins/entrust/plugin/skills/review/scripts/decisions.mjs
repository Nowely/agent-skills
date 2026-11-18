// The user's decisions as data, independent of the page: state, the applicability of child questions, counters
// and the export. Three layers stay apart: the review's verdicts in the record, these decisions, and evidence
// obtained in a later revision of the record. The same runtime is embedded in the page's script and imported by
// the tests; it touches no DOM. A picked variant is the decision, reversible on every screen size; a deferral
// or an outside parent variant keeps the pick as a draft, never in effect. An answer entered on a fact card is
// not a checked result. Decisions are never carried between revisions by question number.
export function decisionRuntime() {
  // answers: fact answers entered on the surface (additive, schema 4 exports them as factAnswers);
  // hiddenPurposes/treeHidden: the code view's UI state, stored beside the decisions, never exported.
  const empty = () => ({ findings: {}, questions: {}, notes: {}, passages: [], zones: {}, answers: {}, hiddenPurposes: [], treeHidden: false });
  const normalize = (raw) => {
    const state = empty();
    if (raw && typeof raw === "object" && !Array.isArray(raw))
      for (const key of Object.keys(state)) if (raw[key] !== undefined && raw[key] !== null) state[key] = raw[key];
    return state;
  };
  const entryOf = (state, id) => state.questions[id] || {};
  const noteOf = (state, id) => entryOf(state, id).note || state.notes["q" + id] || "";
  const byIdOf = (questions) => Object.fromEntries(questions.map((q) => [q.id, q]));
  // A child applies while its parent has no valid acceptance, and while the parent's accepted variant is one the
  // child listed. A selected radio alone never suppresses a child, and neither does an acceptance without its
  // variant or comment; a valid acceptance of a variant outside the list does, and a parent that is itself not
  // applicable takes its children with it.
  const applicableIn = (q, state, byId, seen = new Set()) => {
    if (!q.parent) return true;
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    const parent = byId[q.parent.question];
    if (!parent || !applicableIn(parent, state, byId, seen)) return false;
    if (!validAccept(parent, state)) return true;
    return (q.parent.variants || []).includes(entryOf(state, parent.id).variant);
  };
  // Settle drops the answers of children that became not applicable, so an old answer never returns silently
  // when the parent changes again; the picked variant stays as a DRAFT (marked in the export, never shown as
  // an active choice), and the comment stays. Applicability rests on the parent's accepted variant, not on
  // the child's own answer, so one pass is stable even down a chain.
  const settle = (questions, state) => {
    const byId = byIdOf(questions), next = { ...state, questions: { ...state.questions } };
    for (const q of questions) {
      if (!q.parent || applicableIn(q, next, byId)) continue;
      const entry = next.questions[q.id];
      if (entry && (entry.choice !== undefined || entry.variant !== undefined)) {
        const { choice, ...rest } = entry;
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
  // The one quantity the page counts: the main decisions still open (the roots, not their conditional
  // children) plus the findings not processed. Ideas are optional and never enter it; an invalid acceptance
  // or a reasonless deferral leaves its question open.
  const remainingCount = (questions, state, findings) => {
    const byId = byIdOf(questions);
    let n = 0;
    for (const q of questions) {
      if (q.kind !== "decision" || q.parent) continue;
      if (applicableIn(q, state, byId) && !validAccept(q, state) && !validDefer(q, state)) n++;
    }
    for (const f of findings) if (!state.findings[f.id]) n++;
    return n;
  };
  const exportOf = (questions, state, meta) => {
    const byId = byIdOf(questions);
    const entries = questions.filter((q) => q.kind === "decision").map((q) => {
      const entry = entryOf(state, q.id), variant = (q.variants ?? []).find((v) => v.id === entry.variant);
      // The export states the valid decision, never a bare click: an acceptance without its variant or comment
      // and a deferral without a reason stay "remaining". A variant saved under a deferral, an outside parent
      // variant or an unconfirmed pick travels as a DRAFT, never as an accepted decision.
      const status = !applicableIn(q, state, byId) ? "not-applicable"
        : validAccept(q, state) ? "accepted" : validDefer(q, state) ? "deferred" : "remaining";
      return { question: q.id, status,
        variant: variant ? { id: variant.id, text: variant.text } : null,
        ...(entry.variant && status !== "accepted" ? { variant_draft: true } : {}),
        comment: noteOf(state, q.id) || null };
    });
    return {
      schema_version: 4, record_sha256: meta.recordSha, diff_sha256: meta.diffSha, key: meta.key, title: meta.title, range: meta.range,
      findings: state.findings,
      questions: entries,
      // A decision accepted by comment alone (no variants to pick): named, so a reader never mistakes it for a
      // missing variant.
      applyWithoutVariant: entries.filter((e) => e.status === "accepted" && !e.variant).map((e) => e.question),
      notes: state.notes, zones: state.zones, passages: state.passages,
      // An answer entered on a fact card travels apart from the comments: it is the owner's input, not a
      // verified check, and the export never promotes it to one.
      factAnswers: state.answers,
    };
  };
  return { empty, normalize, entryOf, noteOf, settle, validAccept, validDefer, counters, remainingCount, exportOf,
    applicable: (q, state, questions) => applicableIn(q, state, byIdOf(questions)) };
}

const runtime = decisionRuntime();
export const { empty, normalize, entryOf, noteOf, settle, validAccept, validDefer, counters, remainingCount, exportOf, applicable } = runtime;