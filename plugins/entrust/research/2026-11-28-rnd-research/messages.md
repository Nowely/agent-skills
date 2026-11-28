# Messages

The owner's direction comment on PR 120, verbatim, and below it the owner's later acceptance. Both are public.

- URL: https://github.com/Nowely/agent-skills/pull/120#issuecomment-7238644242
- Date: 2026-11-28, 11:34 UTC

---

## Direction for the next iteration

`rnd` should be able to research and evaluate skills even when the request does not include an edit. A practical run, an evaluation against requirements, and a comparison between variants answer different questions; the workflow should choose the evidence each question needs.

The 0.49.0 work showed two related failure modes. An earlier comparison used a contaminated control, limiting its conclusion. In our later Codex pilot, uncertainty about the control was turned into a reason not to run even a useful practical check. The next iteration should preserve the distinction: an unsuitable control limits the comparison, while an independently useful authorized check can still run.

This PR will move the shared research method into the installed `rnd` skill, make it discoverable from the repository, and add a read-only Research route. Existing live references will move with the method; historical references will retain their original source.

The evaluation workflow should record what was actually available, selected and delivered; keep failed and unknown outcomes visible; retain mandatory requirements even when every variant fails them; and report quality, harm, time and available cost separately. Reusing a baseline requires comparable conditions. A single exploratory run is useful evidence about that run, not proof of a stable advantage.

We will also clarify how an already approved plan is handed to a child agent. A research-only request does not authorize changing the skill. Validation will include practical Codex use, a comparison with an uncertain control, and a nearby ordinary-review request that should not be routed to Research.

---

## Acceptance of changes the direction does not name

On 2026-11-28 the owner accepted, in the review session, seven changes of value that PR 120's first commit made and that the direction comment above does not name:

1. answers the floor reaches now count; a floor pass the candidate misses is a regression (checks.md, transfer test);
2. `not needed` also requires no regression (checks.md, transfer test);
3. a statement every run passes stays in the absolute assessment and leaves only the relative difference (test cases item 5);
4. an unobserved selection is `unknown`, not a confirmed miss (selection check);
5. with no user, a child carries out a passed scope when it holds the paths of the plan and of the user's saved word; otherwise it returns its plan (SKILL.md standing rules);
6. readers of sources with no user follow the parent-approved scope (analysis.md);
7. the description no longer excludes reviewing a skill, which is now Research.

The owner also delegated to the review decision (b), that `unknown` stays a mark and the plan says beforehand how it counts toward the verdict; it covers critics.md's line on a mark that is not confirmed.
