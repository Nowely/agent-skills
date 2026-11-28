# rnd research route: moving the research method into `rnd`

**Question.** Can `rnd` research and evaluate skills when the request carries no edit, choosing for each question
the evidence it needs (a practical run, an evaluation against requirements, a comparison between variants), without
letting an unsuitable control stop a check that is useful on its own?

**Approved direction.** The owner's [direction comment](https://github.com/Nowely/agent-skills/pull/120#issuecomment-7238644242)
([messages.md](messages.md)): move the shared research method into the installed `rnd` skill, make it discoverable
from the repository, add a read-only Research route, record what was available, selected and delivered, keep failed
and unknown outcomes visible, keep a mandatory requirement even when every variant fails it, report quality, harm,
time and cost separately, reuse a baseline only under comparable conditions, and say how an approved plan reaches a
child agent.

**What PR 120 changes.** The method moves to `plugins/entrust/plugin/skills/rnd/references/research.md`; `AGENTS.md`
points to `rnd`; `rnd` gains a Research route; the evaluation pages gain the marks above. The review of `c435d99`
added fixes: the rename of `AGENT.md` to `AGENTS.md`, this record, the check-cost rules, and the Research route's plan
step, result form and reader.

**Decisions.** The owner delegated these to the review of `c435d99`:

- (a) every session of a check gets its own copy of the working tree; a practical run on the user's real task, with
  their authorization, is a use and runs where the task is;
- (b) `unknown` stays a mark, and the plan says beforehand how it counts toward the verdict; unsaid, it counts as
  `false` for a mandatory statement;
- (c) a statement no session could pass on that setup is fixed before the rest start;
- (d) the method stays in `rnd`, which may not link outside its installed files;
- (e) the review protocol still stops to agree on a next step.

**Unverified.** The transcript of the Codex pilot that declined the practical check was not read, so the cause of
its refusal is an inference. Selection of the Research route, against near-miss requests, is unmeasured.

**Not comparable.** Until the rename, no session received the repository's rules on its own, since the rules sat in
`AGENT.md`, which no host reads. Since the rename every session does. A baseline recorded before the rename is not
comparable with a run after it.
