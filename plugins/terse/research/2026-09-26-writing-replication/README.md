# Writing-feedback replication — 2026-09-26

The study behind [#20](https://github.com/Nowely/agent-skills/issues/20) asked how one user reacts to the texts
the assistant writes and turned the answer into principles for a writing skill. This run repeats it on a second
machine's sessions with a stricter pipeline and compares the result with the first run. The full write-up is the
[comment on #20](https://github.com/Nowely/agent-skills/issues/20#issuecomment-5854752595); its text is
[`publication/issue-comment.md`](publication/issue-comment.md).

## Result

- 144 Claude Code sessions in five projects, 125 independent dialogues, 1,745 user messages (278 of them sent
  mid-turn), 323 feedback episodes from 51 dialogues.
- 29 principles (20 strong, 9 moderate) and one candidate. The judge kept 14, revised 15 and left one unknown;
  15 were at high risk of turning one successful solution into a mandatory template, and the revisions undo that.
- Against the first run's 23 principles: 9 confirmed, 12 partly confirmed, none contradicted, 2 not found; 15 new.
- The principles, their mechanisms and boundaries are the *Core families* and *Principles* sections of the comment.

## How it ran

Codex Sol built the corpus; Codex Astra critiqued the split before any extraction; Codex Luna agents, two per part
at high effort, extracted episodes after a pilot against an Opus reference fixed the effort level; Codex Sol
merged and verified the quotes; Opus analysed bottom-up, Codex Sol top-down (five readers over every user
message); Fable drafted the principles; 500 Codex Luna agents stress-tested them; Codex Astra judged each
principle; Codex Sol compared with the first run, proofread the publication and checked completeness. Every page
the extraction, reader and stress-test agents were asked to read was verified whole in the agent's own Codex log,
not taken from its report; one top-down agent whose log showed 419 of 1,745 messages was redone by the readers.

Every number is in [`measures/summary.md`](measures/summary.md) with the file it comes from: coverage per batch
(`measures/coverage/`), the pilot protocol written before the pilot and its amendment (`measures/pilot-*.md`),
tokens (`measures/tokens.md`, `measures/claude-tokens.md`), the split critique's dispositions and the
proofreader's fixes. The scripts that built the prompts, ran the batches and computed the measures are in
[`tools/`](tools/); they resolve this directory from their own location.

## What is not in the repository

The corpus, the episodes, the agents' answers, the analyses, the stress-test pages and the prompts quote
private sessions, work projects among them. They stay on the owner's machine, untracked (see `.gitignore`); the
committed files refer to them by name. The principles in the comment are paraphrased and carry no episode ids.

## Limits

One user. Five dialogues hold 148 of the 323 episodes, three of them about writing itself. Outcomes are mostly
silent: the user moved on in 163 episodes and accepted explicitly in 35. The Claude agents started with the
user's global instructions and memory index loaded; the Codex agents did not.

## What carries over

The principles became terse's `clarity` skill, which Claude may choose while writing an everyday text, with its
genre notes, and the edits to the other skills' pages, all on the branch `terse-writing-replication`. A first
official trigger run behaved as intended in 8 of 9 runs — it chose `clarity` in 5 of 6 runs where it should and in
none of 3 where it should not
([`measures/clarity-trigger-official-2026-09-27.json`](measures/clarity-trigger-official-2026-09-27.json)): three
cases, three runs each; the counts over real sessions and the live set are still to run.
