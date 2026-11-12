// Every word the report shows that the reviewer did not write. A review may carry "labels" with any of these keys
// in the language of its reader; a key it leaves out keeps the wording here. `{n}` is filled in where it stands.
export const LABELS = {
  "kind": "Code review",
  "change": "Change", "task": "Task", "sources": "Sources", "requirements": "Requirements",
  "verdict": "Verdict", "now": "How it works now", "target": "Target solution", "recommendation": "Recommendations",
  "findings": "Findings", "ideas": "Ideas", "ideas-note": "Not needed for the change to be accepted.",
  "screens": "Screens", "structure": "Structure", "map": "Change map", "questions": "Questions and oddities",
  "coverage": "Coverage", "decisions": "Decisions", "summary": "Summary", "files": "Files",
  "checks": "Check by hand", "checks-note": "Scenarios for a person to run. The review did not run them.",
  "from": "Starting from", "do": "Do", "expect": "Expect",
  "none": "none", "nothing": "nothing", "shown-by": "Shown by", "fix": "Fix", "idea": "idea", "finding": "finding", "reason": "Reason",
  "requirement": "Requirement", "source": "Source", "status": "Status", "blocks": "Blocks", "lines": "Lines",
  "unit": "Unit", "jobs": "Jobs", "uses": "Uses", "in-unit": "in",
  "verdict.keep": "keep", "verdict.fix": "fix", "verdict.remove": "remove", "verdict.split": "split", "verdict.merge": "merge",
  "direction.behavior": "behavior", "direction.necessity": "necessity", "direction.design": "design", "direction.tests": "tests",
  "evidence.ran": "run and seen", "evidence.read": "read in the code, not run", "evidence.judgment": "judgment",
  "source.task": "task", "source.discussion": "discussion", "source.question": "open question", "source.assumption": "assumption",
  "met": "met", "fails": "fails", "not-checked": "not checked", "no-test": "no test", "reconsider": "To reconsider",
  "breaks": "Breaks requirement", "untested": "Leaves without a test: requirement", "serves": "Serves requirement", "serves-nothing": "Serves nothing",
  "no-block": "no block", "idle": "No requirement would fail without these",
  "share": "Lines of the change by what the reviewer would do with them",
  "existing": "existing", "existing-code": "existing code", "from-change": "from the change", "to-write": "to write",
  "as-written": "As written", "units": "units",
  "diagram-note": "An arrow runs from a unit to what it uses. A dashed outline is code the change did not touch; the bar along a unit's foot is the share of its lines to keep, fix and remove.",
  "mockup": "Mockup", "before": "Before", "after": "After", "no-pictures": "no pictures",
  "matches": "Matches the mockup.", "not-compared": "Not compared", "overlay": "Lay the result over the mockup", "result": "Result",
  "show": "Show", "all": "all", "continued": "continued", "kept-by-you": "kept by you",
  "apply": "Apply", "skip": "Skip", "copy": "Copy", "copied": "Copied", "apply-all": "Apply all", "clear": "Clear",
  "note-block": "Your note on this block", "note-finding": "Your note on this finding", "note-idea": "Your note on this idea",
  "decisions-note": "Mark each finding Apply or Skip, add notes where you disagree, select any text of the page to comment on it, then hand this text back to whoever makes the change.",
  "comment": "Comment on the selection", "passages": "Comments on passages", "note-passage": "Your comment on this passage", "remove": "Remove",
  "decisions-text": "Your decisions as text", "decided": "Findings decided: {n}",
  "out.title": "Decisions on the review of", "out.apply": "Apply:", "out.skip": "Do not apply:", "out.ideas": "Ideas to take:",
  "out.open": "Not decided:", "out.idea-notes": "Notes on ideas not taken:", "out.blocks": "Notes on blocks:", "out.passages": "Comments on passages:",
  "page": "Interactive report",
};

// The wording for one review: `t(key)`, or `t(key, n)` where the label has a place for a number.
export function labelsOf(review) {
  const own = review.labels ?? {};
  return (key, n) => String(own[key] ?? LABELS[key]).replace("{n}", n);
}

export function labelFaults(review) {
  if (review.labels === undefined) return [];
  if (typeof review.labels !== "object" || review.labels === null || Array.isArray(review.labels)) return ['"labels" is not an object of label to wording'];
  return Object.entries(review.labels).flatMap(([key, value]) =>
    !(key in LABELS) ? [`"labels" has "${key}", which is no label of the report`]
      : typeof value !== "string" || !value.trim() ? [`label "${key}" has no wording`]
        : LABELS[key].includes("{n}") && !value.includes("{n}") ? [`label "${key}" has lost its {n}`] : []);
}
