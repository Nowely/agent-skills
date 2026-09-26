# terse

Is my README any good? Does it even need rewriting? `terse` is a Claude Code plugin that measures whether
readers get the right answer and whether a document's claims agree with the code behind it, and
proposes a rewrite. The intended
scope is Markdown in any language, whether or not the document is about software. Where no code backs the
text, guarantee-shaped claims need a named source or weaker wording; this weaker truth pass has not been
measured.

Start with `/terse:audit` when you have a document and do not know whether to touch it. Start with
`/terse:rethink` when the document is missing or its shape is wrong.

```
/terse:rethink  →  skeleton  →  /terse:rewrite  →  candidate + diff  →  /terse:audit
/terse:audit    →  run file  →  /terse:rewrite  →  candidate + diff  →  /terse:audit again
   what broke                    what to write                          did it hold
```

The plugin ships three user-invoked skills.

## What each one does

Each skill is a page of instructions for Claude; below is what each page and its references say.

**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh
reader, a model agent, to each question. Readers start at the entry file and may open only Markdown. A baseline asks the
same questions with no documentation, while task readers try workflows from the documentation alone.

It returns the profile, claim ledger, score against the no-document baseline, and failures. Each wrong
answer gets a cause: a false sentence, no answer anywhere, a true sentence where it misleads, a
well-placed answer not found, or true sentences whose sequence leaves the reader
worse off. Audit states what a repair must achieve
without proposing wording. The claim ledger excludes voice and ordering, illustrative examples,
arguments for instructions, and recipes for tools the repository does not ship.

**`/terse:rethink`** surveys documents in and beyond the genre, settles terms, and explores
structures. Its output is a skeleton: each section's title, purpose, exclusions, and word budget, and the
rules the writing must pass. It then waits for your word.

**`/terse:rewrite`** starts from that skeleton or an audit's run file, or resumes a run of its own that
already holds rounds. For an existing document, an adversarial
read precedes a bake-off: three whole-file candidates and two judges. Later rounds edit
the selected candidate and are checked against the claim ledger, the audit's when rewrite starts from
one; task outcomes and reader questions are checked before a round
reaches you. The loop stops when you read a round and say
whether you would send it as it is.

A round is handed over as a candidate and its diff from the original. Every cut of twenty words or
more must carry a reason, and every behavioural claim a round declares must carry its source and
evidence. The shipped check rejects a new round that loses a sentence an earlier round
verified, or brings back wording one retired as false. That guard is not a promise that no regression can occur.

When you re-audit after a rewrite, use the same questions, answer key, entry file, and model; changing one
makes it a new measurement rather than a comparison.

All three skills announce how many agents they are about to spawn, on which model, and wait for your
word.

## Install

Install Claude Code first. Running a skill needs you signed in to it; for `audit` and `rewrite`, also put
Node 22 or newer on `PATH`.

Inside Claude Code:

```
/plugin marketplace add Nowely/agent-skills
/plugin install terse@nowely
```

The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then
`claude plugin install terse@nowely`.

This README describes commit `2f29a8f`. To install that commit, run
`claude plugin marketplace add` with the path of a local clone checked out at it in place of
`Nowely/agent-skills`, then `claude plugin install terse@nowely`.
On 2026-09-22 the install commands with `Nowely/agent-skills` resolved to `8c041b7`, whose audit and
rewrite pages differ from the ones described here; its rewrite page wrote into the document repository
without asking.

## Where it writes

The `audit` instructions create the run in the plugin's data directory when Claude Code supplies
one, and otherwise under `${TMPDIR:-/tmp}/terse`. Installed, the runs land in
`plugins/data/terse-nowely/runs/` inside Claude Code's configuration directory.
The audit page forbids writing into the audited repository; its reference on measuring allows storing
the score there on your word. The `rewrite` instructions place their run by the same rule,
with a code defect recorded in its `code-defects.md` and offered to
you. Copying that defect into the repository's `ISSUES.md`,
or applying the candidate to your document, requires your word. The `rethink` page does not specify where
its skeleton is stored.

When the plugin's last installation is removed, by `claude plugin uninstall` without `--keep-data` or by
`claude plugin marketplace remove`, its data directory and the runs in it are deleted.
The `audit` and `rewrite` pages warn that the operating system may purge a run in the temporary directory;
copy a run you want to keep.

## What it will and will not do to your text

It is not a compressor. Length does not select a candidate, and section budgets are reports rather than
gates. On one file measured on 2026-09-10, a four-pass rewrite chain moved 2,725 words to
2,571 — six percent — while the second pass cut 105 words and the third added 105 back as missing framing.

The writing rules forbid cutting a condition, limit, or warning where a reader decides, and the bake-off
vetoes a candidate that cuts or weakens one. Repetition at an independently reached decision point is
not redundancy. A dated measurement keeps its date and numbers, including ones the code has since changed.

## What was measured

Two experiments ran on 2026-09-10. Read them as pilots, not rates.

- The chain, four passes that preceded the plugin's bake-off and rounds,
  covered one README. The experiment had no no-document arm. The plugin's repository
  records each of the experiment's six readers before the rewrite, and only the totals after
  it. Its pages report six questions, one trial per question, with 3/6
  answers right before and 6/6 after, one reader leaving the documentation before and none after, and
  neither control question broken. Three improvements and no reversals give
  exact two-sided McNemar *p* = 0.25. The result neither clears a significance threshold nor separates
  what the text taught from prior knowledge, nor says whether a human reader improved.
- A separate experiment used ten agents in a 2 × 5 design: four writing standards, one of them a
  draft, and one unguided control condition with two agents. Models were hidden from the judges. On the first 116
  words, five agents proposed no change, one changed punctuation only, three made it longer, and one
  control shortened it to 97 words. Ranking on wording, one judge put both controls above every entry of the
  three published standards; ranking on verified findings, the other did not.

Not measured: which pass produced the reported answer gain, or whether a bake-off beats one careful pass.

## Licence

MIT.
