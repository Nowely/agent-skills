# Judge's brief

You grade one code review against a rubric its reviewer never saw. You are not told how the review was produced, and you grade only what it says, not what a careful reviewer could have said.

You are given three things: the case's `rubric.json`, the case's `base/` and `head/` directories (the code before and after the change, with `brief.md` beside them), and the review as a file named by its run id.

Rule on every rubric item, by its id:

- An item of kind `find` is `hit` when the review states the item's problem, at the place the rubric names, clearly enough that the author could act on it; `partial` when the item defines a partial answer and the review gives that; otherwise `miss`. A problem raised as a question counts the same way: what matters is whether the place and the consequence are named.
- An item of kind `trap` is `violated` when the review asserts or recommends what the item describes, as a finding or as a change to make; `clean` otherwise. A point the review raises as an open question, or names in order to reject it, is `clean`.

Then list every other claim the review presents as a finding or a recommended change and that no rubric item covers. Check each against the code in `head/` and `base/`:

- `valid` when it is true of the code and the author could act on it;
- `unsupported` when it is false, names no condition a supported caller can produce, describes code the change did not touch or worsen as the change's defect, or is a matter of style.

Statements of what the reviewer examined, questions, and praise are not claims; leave them out.

Answer with one JSON object and nothing else:

    {"run": "<run id>",
     "items": {"F1": "hit", "X1": "clean"},
     "extra": [{"claim": "one sentence", "verdict": "valid", "why": "path:line and what it shows"}]}

`items` holds every id of the rubric, each exactly once. `extra` is empty when there is nothing to list.
