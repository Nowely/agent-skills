# Judge's brief

You grade code reviews against a rubric their reviewers never saw. All the reviews you are given are of the same change. You are not told how any of them was produced, and you grade only what a review says, not what a careful reviewer could have said.

You are given the case directory: `brief.md`; `base/`, the code before the change; `head/` and `clean/`, the change as it was first written and as it should be; `accept.mjs`, the brief's requirements as checks; and `rubric.json`. You are told which variant the reviewers saw, `head` or `clean`, and you use that variant's part of the rubric. Each review is a file named by its run id.

For each review, rule on every item of that part, by its id:

- An item of kind `find` is `hit` when the review states the item's problem, at the place the rubric names, clearly enough that the author could act on it; `partial` when the item defines a partial answer and the review gives that; otherwise `miss`. A problem raised as a question counts the same way: what matters is whether the place and the consequence are named.
- An item of kind `trap` is `violated` when the review asserts or recommends what the item describes, as a finding or as a change to make; `clean` otherwise. A point the review raises as an open question, or names in order to reject it, is `clean`.

Then list every other claim the review presents as a finding or a recommended change and that no rubric item covers, and check it against the code:

- `valid` when it is true of the variant the reviewer saw and the author could act on it;
- `unsupported` when it is false, names no condition a supported caller can produce, contradicts `accept.mjs`, asks for a mechanism no requirement needs, describes code the change did not touch or worsen as the change's defect, or is a matter of style.

A requirement of the brief that the change relies on old code to meet, and that old code does not meet, is the change's problem: `valid`. The same claim gets the same ruling in every review. Statements of what the reviewer examined, questions, and praise are not claims; leave them out.

Answer with one JSON array and nothing else, one object per review:

    [{"run": "<run id>",
      "items": {"F1": "hit", "X1": "clean"},
      "extra": [{"claim": "one sentence", "verdict": "valid", "why": "path:line and what it shows"}]}]

`items` holds every id of the variant's part of the rubric, each exactly once. `extra` is empty when there is nothing to list.
