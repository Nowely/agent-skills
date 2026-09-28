# Critical-thinking candidates for terse 0.4.0 — 2026-09-28

The owner asked for traits of critical thinking that would make the agent's texts and conclusions more useful
for every terse user, not only through their own instructions, and singled out one: in a report or
recommendation, name what would change the conclusion. This run turns that into candidates for 0.4.0. Nothing
here ships; each candidate still has to pass the tests its entry describes.

## Result

Four candidates, each a check with a visible result rather than an instruction to be careful, reached draft 3,
[`candidates-03.md`](candidates-03.md), with exact page edits and a decision table:

- **K1**: when a recommendation depends on an unsettled assumption, name the observation that would change it,
  check it, and narrow the recommendation to what the check establishes.
- **K2**: recheck a disputed factual conclusion at its source, and correct it, keep it or leave it unresolved by
  what the check shows, not by the pressure of the objection.
- **K3**: an investigative brief asks for the conclusion the evidence supports, without a preferred verdict,
  and keeps established facts and decided scope as inputs.
- **K4**: check a factual premise the answer relies on against the evidence at hand.

**None passed its pilot, so none is in terse's pages** ([pilots.md](pilots.md)). On short, clean tasks the
current `clarity` already did what K1 and K2 ask in every run; K3 and K4 moved a little in both directions. A
repeat of the unchanged pages produced results in the same range, so the pilot could not have detected an effect
of this size: no effect was found, not harm. The test cases, the page edits, the frozen rules and the decision
script are kept for a better-powered round.

## How it ran

- A Claude session in which the owner asked what critical thinking is and whether Claude has it supplied the
  traits; the owner did not react to the answer, so it is a source of hypotheses, not evidence.
- Opus L1 collected the measured evidence on LLMs and people, opening every source it cites:
  [`literature.md`](literature.md).
- Codex Sol CT1 read the 323 feedback episodes of the
  [writing-feedback replication](../2026-09-26-writing-replication/README.md) for each trait, with the owner's
  counter-reactions; its log confirms the whole file was read.
- Fable D2 wrote three drafts; Codex Astra C7 critiqued each. Findings and regressions per round are in
  [`rounds.md`](rounds.md).
- Four Codex Sol agents wrote 100 test cases blind to the candidate texts, another checked them, and a third
  built the content eval harness (`plugins/terse/evals/content.*`). The pilots ran on Claude Opus 5.5 with a
  Sonnet judge under [decision-rules.md](decision-rules.md), frozen before any variant ran, and were decided by
  [`tools/decide.py`](tools/decide.py).

## What is not in the repository

The session excerpt (`source/`) and the agents' reports (`agents/`) quote private sessions and stay on the
owner's machine, untracked (see `.gitignore`). The candidates cite episodes by id and paraphrase them.
