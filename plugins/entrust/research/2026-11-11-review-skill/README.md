# Review skill: experiment and evaluation

The goal is a review that catches behavior errors and unnecessary mechanisms while giving actionable, grounded feedback about boundaries, readability and tests. The skill supports one reviewer or independent reviewers by direction.

A first experiment used one non-public change as a fixed target, with a fresh reviewer per round and no execution. Ten reviews were run while the instructions changed; independent reviewers assessed results and earlier instructions were retained. The per-round classification is in [rounds.md](rounds.md). This is formative evidence, not a controlled before/after result: the target, model family, and evaluator were not varied, and only one review was run for most revisions. The original task, code, logs, and identifying details are not included.

[fixtures](fixtures/) are new fictional examples, not redactions of the original code. Their prompts and hidden rubrics are separate. They are a portable protocol, not completed measurements: no before/after scores for these fixtures are claimed here.

## Before/after protocol

1. Compare the [earlier draft](drafts/00-baseline.md) with the committed [review skill](../../plugin/skills/review/SKILL.md). Record exact file digests, model and effort, environment, and execution limits.
2. Give a fresh independent reviewer only the selected skill and each case's `brief.md` and `change.js`; do not give it `rubric.md`, prior outcomes, or expected findings. Run each skill/case pair repeatedly in a randomized order under the same conditions. No code execution is required.
3. A separate evaluator checks cited evidence against each hidden rubric. Record useful findings, missed supported findings, unsupported findings, and reasonable decisions not to refactor. Track correctness, necessity, structure, and test reasoning separately.
4. Report every attempted run, failures, exclusions, and limitations. Do not infer effectiveness from finding counts alone; do not treat the original private experiment as a measured result for these fictional fixtures.

This protocol is manual; repository page and package checks verify packaging, not review quality.
