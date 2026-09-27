# Critical-thinking candidates for terse 0.4.0 — 2026-09-28

The owner asked for traits of critical thinking that would make the agent's texts and conclusions more useful
for every terse user, not only through their own instructions, and singled out one: in a report or
recommendation, name what would change the conclusion. This run turns that into candidates for 0.4.0. Nothing
here ships; each candidate still has to pass the tests its entry describes.

## Result

Four candidates, each a check with a visible result rather than an instruction to be careful, in
[`candidates-02.md`](candidates-02.md):

- **K1**: when a recommendation depends on an unsettled assumption, name the observation that would change it,
  check it, and narrow the recommendation to what the check establishes.
- **K2**: recheck a disputed factual conclusion at its source, and correct it, keep it or leave it unresolved by
  what the check shows, not by the pressure of the objection.
- **K3**: an investigative brief asks for the conclusion the evidence supports, without a preferred verdict,
  and keeps established facts and decided scope as inputs.
- **K4**: check a factual premise the answer relies on against the evidence at hand.

Rejected: generic caution, risk lists, confidence numbers, and same-context self-correction as verification.
The traits that belong to process rather than writing, such as a critic in a fresh context, point at
entrust. The test plan starts with a
harness the current trigger runners lack and a baseline of `clarity` as it is.

## How it ran

- A Claude session in which the owner asked what critical thinking is and whether Claude has it supplied the
  traits; the owner did not react to the answer, so it is a source of hypotheses, not evidence.
- Opus L1 collected the measured evidence on LLMs and people, opening every source it cites:
  [`literature.md`](literature.md).
- Codex Sol CT1 read the 323 feedback episodes of the
  [writing-feedback replication](../2026-09-26-writing-replication/README.md) for each trait, with the owner's
  counter-reactions; its log confirms the whole file was read.
- Fable D2 wrote [`candidates-01.md`](candidates-01.md); Codex Astra C7 critiqued it; D2 revised it into
  [`candidates-02.md`](candidates-02.md); C7 checked the revision. Findings and regressions per round are in
  [`rounds.md`](rounds.md).

## What is not in the repository

The session excerpt (`source/`) and the agents' reports (`agents/`) quote private sessions and stay on the
owner's machine, untracked (see `.gitignore`). The candidates cite episodes by id and paraphrase them.
