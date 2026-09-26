# terse

Is my README any good? Does it even need rewriting? `terse` is a Claude Code plugin that measures whether
readers get the right answer and whether a document's claims agree with the code behind it. The intended
scope is Markdown in any language, whether or not the document is about software. Where no code backs the
text, guarantee-shaped claims need a named source or weaker wording; this weaker truth pass has not been
measured.

Start with `/terse:audit` when you have a document and do not know whether to touch it. Start with
`/terse:rethink` when the document is missing or its shape is wrong. Both feed `/terse:rewrite`; audit the
candidate again to see whether it held up.

```
/terse:rethink  →  skeleton  →  /terse:rewrite  →  candidate + diff  →  /terse:audit
/terse:audit    →  run file  →  /terse:rewrite  →  candidate + diff  →  /terse:audit again
   what broke                    what to write                          did it hold
```

The plugin ships three user-invoked skills.

## What each one does

**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh
reader to each question. Readers start at the entry file and may open only Markdown. A baseline asks the
same questions with no documentation, while task readers try workflows from the documentation alone.

It returns the profile, ledger, score against the no-document baseline, and failures. A wrong answer is
classified as refuted, missing, placement, findability, or harmful. Audit states what a repair must achieve
without proposing wording. Its behaviour ledger excludes voice and ordering, illustrative examples,
arguments for instructions, and recipes for tools the repository does not ship.

**`/terse:rethink`** works before prose. It compares documents in the same genre, settles terms, and
explores structures. Its output is a skeleton: each section's title, purpose, exclusions, and word budget.
It then waits for your word.

**`/terse:rewrite`** starts from that skeleton or an audit run. For an existing document, an adversarial
read precedes three whole-file candidates and two judges. Later rounds edit the selected candidate and
check its ledger, task outcomes, and reader questions. You decide when a round is ready to send.

The instructions say to hand over a candidate and its diff from the original. The return contract calls
for every cut of twenty words or more to have a reason, and for declared behavioural claims to record their
source and evidence. The shipped check rejects a new round that loses a pinned sentence or restores wording
retired as false. That guard is not a promise that no regression can occur.

When you re-audit a temporary candidate, keep it at the same relative location in a copy of its Markdown
tree so its links still resolve. Use the same questions, answer key, entry file, and model; changing one
makes it a new measurement rather than a comparison.

## Where it writes

The `audit` instructions create the run under the plugin data directory when installed, or under
`$TMPDIR/terse` from a checkout, and forbid writing into the audited repository. The `rewrite`
instructions create their run there too. They instruct the agent to record a code defect in
`code-defects.md` in the run and offer it to you. Copying that defect into the repository's `ISSUES.md`,
or applying the candidate to your document, requires your word. The `rethink` page does not specify where
its skeleton is stored.

## Install

Before the two install commands, install Claude Code, sign in to it, and put Node 22 or newer on `PATH`.
Node is required for an installed plugin and for a source checkout.

Inside Claude Code:

```
/plugin marketplace add Nowely/agent-skills
/plugin install terse@nowely
```

The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then
`claude plugin install terse@nowely`.

Version boundary: this page describes commit `2f29a8f` on branch `terse-process-2026-09-22`. At the
2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`, whose rewrite page
still wrote into the document repository without asking. The outside-repository write boundary above
therefore describes this checkout, not that published revision.

## What it will and will not do to your text

It is not a compressor. Length does not select a candidate, and section budgets are reports rather than
gates. On one file measured on 2026-09-10, the chain moved 2,725 words to 2,571 — six percent — while the
second pass cut 105 words and the third added 105 back as missing framing.

A candidate that cuts or weakens a condition, limit, or warning where a reader decides is vetoed. A writer
may reword one or correct it when it is false. Repetition at an independently reached decision point is
not redundancy. A dated measurement keeps its date and numbers, including ones the code has since changed.

## What was measured

Two experiments ran on 2026-09-10. Read them as pilots, not rates.

- The chain covered one README. The experiment had no no-document arm, and the repository has no
  individual reader records for it. Its pages report six questions, one trial per question, with 3/6
  answers right before and 6/6 after. From those reported counts, three improvements and no reversals give
  exact two-sided McNemar *p* = 0.25. The result neither clears a significance threshold nor separates
  what the text taught from prior knowledge.
- A separate bake-off used ten agents in a 2 × 5 design: four writing standards, one an unpublished draft,
  and one unguided control condition with two agents. Models were hidden from the judges. On the first 116
  words, five agents proposed no change, one changed punctuation only, three made it longer, and one
  control shortened it to 97 words. One judge put both controls above both entries for the two published
  standards; the other did not.

Not measured: which pass produced the reported answer gain, or whether a bake-off beats one careful pass.

## Licence

MIT.
