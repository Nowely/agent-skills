# Round 9: responsibility diagnosis and actionable target

Judge four static reviews against the identical task, base/head source and frozen contact-import-v2 rubric.
Reviewer IDs carry no arm labels. The reviewer saw only task/source and one full skill package, not this rubric,
prior reviews, a reference solution or expected design. Judge semantic claims against source, not keywords.
No project execution, new model calls, network or edits. No implementation exists to grade.

## Primary outcomes: keep D1 and D2 separate

- D1 is a specific diagnosis of reading/change burden from coupled parsing, row selection, counts and effects.
  Require a concrete dependency or change difficulty and the relevant data/code path. A runtime defect, long
  function, phase list, or the words 'mixed responsibilities' alone do not establish a full hit.
- D2 is an actionable target: existing parsing/validation, normalized-email selection, rejection reporting,
  last-valid-row choice, distinct counting, and the decision/effect ordering fit together coherently. A fresh
  implementer should know the data crossing the boundary and the required order. Naming parse/validate/plan/
  write or helpers alone is partial. Local blocks are acceptable; helper names/counts do not decide quality.
- A statement useful only after supplying unstated implementation choices is not automatically actionable.
  Explain any material missing choice. Do not demand an entire patch when the boundary is already clear.

Assess every rubric head item independently: D1/D2 and F2–F8 as hit/partial/miss, X1–X3 as triggered/
not_triggered/unresolved. Provide review location, source evidence and a concise reason. Do not fold bug,
reuse or test scores into D1/D2. Additional valid findings and unsupported recommendations stay separate.
Do not require the reviewer to copy a reference implementation or split a cohesive helper.

Then assess four dimensions as supported/partial/unsupported/unresolved/not_assessed/not_applicable:
1. Mechanism identification: trace the relevant mechanism and dependent code, not a mechanism count.
2. Necessity and cost: distinguish task requirements, optional convenience and unsupported machinery;
   justify reuse/removal/keep or a concrete owner tradeoff. Merely listing a cost is not a decision.
3. Responsibility boundaries: is the diagnosis and proposed arrangement tied to a demonstrated reasoning or
   change burden? Record concrete evidence for any split/merge/keep decision, not cosmetic preferences.
4. Behavior preservation: would the proposed target preserve parse-before-write, last-valid normalized-email
   selection, unique counts and rejection reporting? Missing evidence stays unresolved; do not treat a static
   recommendation as applied-code success. If not described, do not silently fill it in from the rubric.

A correct bug fix does not automatically pass the design dimensions. Not_assessed means missing review
assessment; not_applicable means the fixture does not exercise the dimension. D1/D2 are applicable here,
but their recognition is the measured question, not an assumed success. Do not invent defects in cohesive
nearby helpers to satisfy a quota. Preserve materially harmful suggestions even if most findings are good.

Group substantively equivalent reviews with useful differences. Retain disagreements and incomplete evidence;
no fixed numeric threshold or overall architectural-recovery percentage. The coordinator intersects judge
support, inspects disagreements and distinguishes the method, fixture, model execution and measurement.
This small familiar/formative case has no architecture probes or implementation stage; even fully supported
D1/D2 show a proposed improvement, not recovered locality in working code or general reliability.
