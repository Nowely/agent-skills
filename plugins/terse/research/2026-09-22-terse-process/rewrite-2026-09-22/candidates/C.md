# terse

A Claude Code plugin that measures whether your documentation gives readers the right answer, and then
repairs what it measured. It sends fresh readers through your `.md` files and checks the sentences that
say what your software does against its code, so a failure arrives with a line number and a cause rather
than an opinion. The readers get the same brief whatever language your files are in. Text with no code
behind it is audited too, with a weaker check that has not been measured.

Three skills. You invoke all three; none starts on its own.

```
/terse:rethink  →  skeleton  →  /terse:rewrite  →  candidate + diff  →  /terse:audit
/terse:audit    →  run file  →  /terse:rewrite  →  candidate + diff  →  /terse:audit again
   what broke                    what to write                          did it hold
```

## What each one does

**`/terse:audit`** builds a profile of who reads this project, derives the correct answers from the
code, then sends one fresh reader per question through the documentation — `.md` only, starting where a
real reader starts. It returns a score, the questions that failed, and why each failed: the text lied,
the answer was nowhere, the true sentence sat where it misleads, it was there and unfindable, or every
sentence was true and the sequence left the reader worse off. It never suggests
wording. Its run file goes into a run directory outside your repository, and the report names that
directory, which `/terse:rewrite` asks you for.

**`/terse:rethink`** decides what a document should be before a sentence of it is written: what
comparable documents in the same genre already solved, what things should be called, and what is said in
what order. It returns a skeleton — section titles, what each is for, what each leaves out, a word budget
— and stops there for your word. It exists because, on 2026-09-11, a draft written at ordinary quality
was abandoned by its reader at the third section, and nine of his nine objections were about what the
document contained, where it sat and how much of it there was. None was about phrasing.

**`/terse:rewrite`** takes a skeleton or an audit's run file and writes against it. Three writers produce
candidates and two judges score them on the audit's failures, or against the skeleton, rather than on
taste; the winner is then edited in rounds, each read by the critics you agree to, on lenses that differ
— the code, the rules, an adversarial reader, a task, a reader's questions. Every round is its own file,
and a round that loses a verified sentence, or brings back one found false, is made again before its
critics read it.

The loop stops when you read a round and say whether you would send it as it is. You get that round, the
diff, a list of every cut of twenty words or more with its reason, and the file, line and evidence level
behind each claim it checked. It writes into its own run directory. Like `audit`'s, it is outside your
repository, and the report names it; putting the text into your files, or a code defect it found into
your `ISSUES.md`, needs your word. Run `/terse:audit` again once the text stands where the original
stood: its readers start at your entry file and follow the links from there.

All three skills announce how many agents they are about to spawn, on which model, and wait.

## Install

```
/plugin marketplace add Nowely/agent-skills
/plugin install terse@nowely
```

The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then
`claude plugin install terse@nowely`. `audit` and `rewrite` run Node scripts, so Node must be on your
PATH whether you install the plugin or run it from a checkout; the package declares Node 22 or newer.
Claude Code must be logged in for the skills to run. The plugin needs no npm packages, no configuration
file and no other account.

## What it will and will not do to your text

It makes documentation truer and easier to answer from. It is not a compressor. On the one file
measured, the chain moved 2,725 words to 2,571 — six percent — while the second pass cut 105 words and
the third added 105 back as missing framing. If your text is long because it is wrong, this shortens it.
If it is long because it explains something hard, it will stay long and start being right.

Three of its rules override the rest wherever they collide: never cut a condition, a limit or a warning
where a reader decides; a repetition that sits at a decision a reader reaches independently is not
redundancy; a dated measurement keeps its date and its numbers, including ones the code has since
changed.

## What was measured

Two experiments on 2026-09-10, in one repository: a four-pass chain that rewrote its README, and a
bake-off of writing standards over its prose and comments. The chain had no arm that asked its readers
the same questions without the document, so what the text taught and what they already knew are not
separated. Read the size of each before the numbers:

- The four-pass chain took six reader questions from three right answers to six, took readers leaving
  the documentation from one to zero, and broke neither control question. **Six questions, one trial
  each.** Three improvements and no reversals over six paired items gives an exact two-sided McNemar
  *p* = 0.25, so this result is not distinguishable from chance. It is a pilot, not a rate.
- Two of the six failures were lies rather than findability. A reader repeated two guarantees from
  `README.md:5-9` that the code does not make. A structural rewrite would have carried both forward in
  better prose.
- A reader's own sense of clarity ran against the truth. Two who reported no confusion answered wrong;
  the one who called a section scattered and confusing answered right. Neither skill asks a reader
  whether the text was clear.
- Four writing standards — Diataxis, a house style, verification against the implementation, and an
  unpublished draft of rules — and a control with no standard were each given to two agents: ten
  agents, models hidden from the two judges. The judge who ranked for readability put both controls
  above all four Diataxis and house-style entries, and counted, on the first 116 words, five agents
  proposing nothing, one changing only punctuation, three lengthening the passage and one shortening
  it: a control. The other judge ranked a verification entry first. **Ten agents, one run, one
  passage** — one observation per cell, not a rate.

Not measured: which of the four passes produced the gain, and whether a bake-off beats one careful pass.
Also not measured, and worth knowing before you trust any of the above: there was no arm that ran the
same questions with no document at all, so none of this separates what the text taught a reader from what
the reader already knew. The reference files say so where it matters. Of two published benchmarks that
did run that arm, Code-QA-Bench scored 0.56 to 0.68 with no document on tasks built to need one, and
SWD-Bench's no-document arm sat at chance; [references/prior-art.md](references/prior-art.md) records
both, and summarises what an adversarial review found against these numbers.

## Licence

MIT.
