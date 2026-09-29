# prepare-feedback: design of a skill that turns sessions into a plugin report — 2026-09-28/29

The question: what should the skill of [#21](https://github.com/Nowely/agent-skills/issues/21) look like, now that the
owner has reframed it as the repeatable form of the manual runs behind #1, #15, #16, #20 and #22? It reads the
sessions where terse or entrust loaded, analyses them under a focus, and hands back an issue title and body when it
runs outside this repository, or a research run when it runs inside.

## Result

- The design stands in three iterations: [01](01-design.md) by Fable F1; [05](05-design.md), F1's revision after
  Opus O1's critique and a claim check by Codex Luna; [07](07-design.md), 05 with the owner's decisions of 2026-09-29
  applied by the coordinator: the name `prepare-feedback`, no line in terse's README, and #22's bulk-row rules landing
  in orchestrate and swarm together with the skill.
- It is not final. O1's second critique ([08](08-critique.md)) finds 10 of its 17 first findings closed, 6 closed in
  part, 1 closed wrongly, and 11 new ones. The heaviest: the page's first line reads orchestrate by path, which the
  host tells a model not to do for a user-only skill the user did not type (E82).
- What holds across the critiques: three focuses (a version, one run, feedback on a topic) or one in the user's
  words; sessions found by the skill-load marker in transcripts; the focus picks how agents read (readers with a
  question, or exhaustive extraction) and the corpus size only how many; the place of the run picks the output;
  privacy as a principle, checked by a model that did not write the text; no flags.
- One ledger entry came out of the run: E89, a cause in `foreman.md:24` broader than what was observed.

## How it ran

Fable F1 designed the skill and listed the design's factual claims ([01](01-design.md), [02](02-claims.md)). Twenty
Codex Luna agents checked one claim each ([03](03-claims-check.md)) while Opus O1 critiqued the design
([04](04-critique.md)). F1 revised it ([05](05-design.md), [06](06-claims.md)); the coordinator applied the owner's
decisions ([07](07-design.md)); O1 critiqued the revision ([08](08-critique.md)). Opus C1 read the coordinator's
answers to the owner for completeness. Opus P1, who wrote none of these files, read every one of them for privacy
before the commit; its eleven replacements are applied. Codex offered only Luna at the time, so every judgement role went to Claude,
and the panel shares one model's bias. The findings per round are in [rounds.md](rounds.md).

## Cost

By the harness's count per invocation: Fable F1 200.6k and 242.6k; Opus O1 211.1k and 267.2k; Opus C1 90.1k, 112.2k
and 116.1k; Opus P1 165.0k. The twenty Luna reports hold 1.09M tokens, 837k of them cached input. The coordinator's own session was
not counted.

## What stayed private

The transcripts, the measurement scripts O1 wrote over them, and the agents' reports stay on the machine that ran
them. The counts quoted here come from one machine's transcripts.
