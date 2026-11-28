# Messages

The owner's direction comment on PR 120, verbatim. It is public.

- URL: https://github.com/Nowely/agent-skills/pull/120#issuecomment-7238644242
- Date: 2026-11-28, 11:34 UTC

---

## Direction for the next iteration

`rnd` should be able to research and evaluate skills even when the request does not include an edit. A practical run, an evaluation against requirements, and a comparison between variants answer different questions; the workflow should choose the evidence each question needs.

The 0.49.0 work showed two related failure modes. An earlier comparison used a contaminated control, limiting its conclusion. In our later Codex pilot, uncertainty about the control was turned into a reason not to run even a useful practical check. The next iteration should preserve the distinction: an unsuitable control limits the comparison, while an independently useful authorized check can still run.

This PR will move the shared research method into the installed `rnd` skill, make it discoverable from the repository, and add a read-only Research route. Existing live references will move with the method; historical references will retain their original source.

The evaluation workflow should record what was actually available, selected and delivered; keep failed and unknown outcomes visible; retain mandatory requirements even when every variant fails them; and report quality, harm, time and available cost separately. Reusing a baseline requires comparable conditions. A single exploratory run is useful evidence about that run, not proof of a stable advantage.

We will also clarify how an already approved plan is handed to a child agent. A research-only request does not authorize changing the skill. Validation will include practical Codex use, a comparison with an uncertain control, and a nearby ordinary-review request that should not be routed to Research.
