// The user's decisions as data, independent of the page: state, the applicability of child questions, counters
// and the export. Three layers stay apart: the review's verdicts in the record, these decisions, and evidence
// obtained in a later revision of the record. The same runtime is embedded in the page's script and imported by
// the tests; it touches no DOM. A picked variant is the decision, reversible on every screen size; a deferral
// or an outside parent variant keeps the pick as a draft, never in effect. An answer entered on a fact card is
// not a checked result. Decisions are never carried between revisions by question number.
export function decisionRuntime() {
  // answers: fact answers entered on the surface, exported as factAnswers;
  // hiddenPurposes/treeHidden/treeWidth/treeMode: the code view's UI state, stored beside the decisions, never exported.
  const empty = () => ({ findings: {}, questions: {}, notes: {}, passages: [], zones: {}, answers: {}, hiddenPurposes: [], treeHidden: false, treeWidth: 0, treeMode: "folder" });
  const normalize = (raw) => {
    const state = empty();
    if (raw && typeof raw === "object" && !Array.isArray(raw))
      for (const key of Object.keys(state)) if (raw[key] !== undefined && raw[key] !== null) state[key] = raw[key];
    return state;
  };
  const entryOf = (state, id) => state.questions[id] || {};
  const noteOf = (state, id) => state.notes["q" + id] || "";
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
  const waitingParentIn = (q, state, byId) => {
    const seen = new Set();
    while (q?.parent && !seen.has(q.id)) {
      seen.add(q.id);
      const p = byId[q.parent.question];
      if (!p) return null;
      if (!validAccept(p, state) && !validDefer(p, state)) return p.id;
      q = p;
    }
    return null;
  };
  const matchesQuestion = (q, filter, state, questions) => {
    if (filter === "q") return q.kind === "decision";
    if (filter === "fact") return q.kind === "fact" || q.kind === "evidence";
    if (filter === "deferred") return q.kind === "decision" && applicableIn(q, state, byIdOf(questions)) && validDefer(q, state);
    return false;
  };
  const factAnswerStatuses = (questions, state) => {
    const byId = byIdOf(questions), statuses = {};
    for (const q of questions) {
      const id = "q" + q.id;
      if ((q.kind !== "fact" && q.kind !== "evidence") || !Object.hasOwn(state.answers, id) || !String(state.answers[id] || "").trim()) continue;
      const parent = waitingParentIn(q, state, byId);
      statuses[id] = !applicableIn(q, state, byId) ? { status: "not-applicable" }
        : parent ? { status: "waiting-parent", parent } : { status: "entered" };
    }
    return statuses;
  };
  // The ONE derivative behind every counter: the subtab badges, the global remainder, the settled rows and the
  // export's remainder all read this — never a DOM tally, so they cannot disagree after Q2=keep. A main decision
  // is open until it has a valid decision; its conditional children are actionable under it but never enter the
  // mandatory count (the parent's accepted variant may retire them), and the parent's unit stays unsettled until
  // every applicable child is accepted. A reasoned deferral is excluded from the remainder — not done, but not
  // open work either. Ideas are optional and never enter the
  // remainder. A fact/evidence request is open until an answer is entered; an entered answer is not a verified
  // check. `settled` maps the unit ids that move to compact rows (main Q roots, findings, ideas) to done/deferred.
  const choiceStats = (questions, state, findings, ideas = []) => {
    const byId = byIdOf(questions);
    const kidsOf = {};
    for (const q of questions) if (q.parent) (kidsOf[q.parent.question] ||= []).push(q.id);
    const kidsDone = (qid) => (kidsOf[qid] || []).every((k) => {
      const c = byId[k];
      return !c || !applicableIn(c, state, byId) || ((c.kind !== "decision" || validAccept(c, state)) && kidsDone(k));
    });
    const settled = {};
    let q = 0, dependent = 0, waiting = 0, f = 0, i = 0, fact = 0, deferred = 0, done = 0;
    for (const question of questions) {
      if (question.kind === "decision") {
        if (!applicableIn(question, state, byId)) continue;
        if (validDefer(question, state)) deferred++;
        if (question.parent) {
          if (!validAccept(question, state) && !validDefer(question, state)) { dependent++; if (waitingParentIn(question, state, byId)) waiting++; }
          continue;
        }
        if (validAccept(question, state)) { if (kidsDone(question.id)) { done++; settled["q" + question.id] = "done"; } }
        else if (validDefer(question, state)) { settled["q" + question.id] = "deferred"; }
        else q++;
      } else if (question.kind === "fact" || question.kind === "evidence") {
        if (applicableIn(question, state, byId) && !String(state.answers["q" + question.id] || "").trim()) { fact++; if (waitingParentIn(question, state, byId)) waiting++; }
      }
    }
    for (const finding of findings) { if (state.findings[finding.id]) { done++; settled[String(finding.id)] = "done"; } else f++; }
    for (const idea of ideas) { if (state.findings[idea.id]) { done++; settled[idea.id] = "done"; } else i++; }
    return { q, dependent, waiting, f, i, fact, deferred, done, remaining: q + f, settled };
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
      const parent = status === "accepted" ? waitingParentIn(q, state, byId) : null;
      return { question: q.id, status,
        variant: variant ? { id: variant.id, text: variant.text } : null,
        ...(entry.variant && status !== "accepted" ? { variant_draft: true } : {}),
        ...(parent ? { waiting_parent: parent } : {}),
        comment: noteOf(state, q.id) || null };
    });
    return {
      schema_version: 5, record_sha256: meta.recordSha, diff_sha256: meta.diffSha, key: meta.key, title: meta.title, range: meta.range,
      findings: state.findings,
      questions: entries,
      // A decision accepted by comment alone (no variants to pick): named, so a reader never mistakes it for a
      // missing variant.
      applyWithoutVariant: entries.filter((e) => e.status === "accepted" && !e.variant).map((e) => e.question),
      notes: state.notes, zones: state.zones, passages: state.passages,
      // An answer entered on a fact card travels apart from the comments: it is the owner's input, not a
      // verified check, and the export never promotes it to one.
      factAnswers: state.answers,
      factAnswerStatuses: factAnswerStatuses(questions, state),
      waitingForParent: questions.filter((q) => applicableIn(q, state, byId) && waitingParentIn(q, state, byId)
        && (q.kind === "decision" ? !validAccept(q, state) && !validDefer(q, state) : (q.kind === "fact" || q.kind === "evidence") && !String(state.answers["q" + q.id] || "").trim()))
        .map((q) => ({ question: q.id, parent: waitingParentIn(q, state, byId), kind: q.kind })),
    };
  };
  return { empty, normalize, entryOf, noteOf, settle, validAccept, validDefer, choiceStats, exportOf, matchesQuestion, factAnswerStatuses,
    applicable: (q, state, questions) => applicableIn(q, state, byIdOf(questions)),
    waitingParent: (q, state, questions) => waitingParentIn(q, state, byIdOf(questions)) };
}

const runtime = decisionRuntime();
export const { empty, normalize, entryOf, noteOf, settle, validAccept, validDefer, choiceStats, exportOf, applicable, factAnswerStatuses } = runtime;
