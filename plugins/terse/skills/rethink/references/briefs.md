# Briefs, one per role

Every agent `rethink` starts gets one of these with its placeholders filled, and nothing else: `<R>` is
the absolute path of [the run directory](../SKILL.md#the-run-directory), `<DOC>` the document, and every
file a brief names under `<R>` is there before the agent starts. A Codex agent gets its brief the way
[critic-briefs.md](../../rewrite/references/critic-briefs.md) sends one to a critic; a Claude agent gets
the same body through the Agent tool. Every brief ends by asking for a path and a few lines back: the
report is the file.

## 0. The owner's calibration file

Before the survey, once: the owner's own words on this genre — what they asked for, praised and
rejected — collected verbatim into `<R>/owner-words.md`, which the surveyors, the structure writers and
the critics all read. It is the calibration, not folklore: what this owner has already accepted and
refused in documents like this one, and when. It is never counted as a document of the genre.

To make it, grep the owner's sessions for the genre's words — for Claude Code, the `*.jsonl` files under
`~/.claude/projects/<project>/` — and keep a line only if the owner typed it: `type: "user"` with
`origin.kind: "human"`. The first field alone also matches skill text loaded into a session, task
notices, compaction summaries and subagent hand-backs. Keep each message verbatim with its timestamp and
session, once where a forked or resumed session repeats it, and list the dropped hits with the reason.
The owner's words in reviews and issues would go in the same way, but the file of 2026-09-23 drew on
sessions alone, so that part is untried. The documents the owner named as good go at the top, by URL:
they are the survey's seventh slice.

Measured on 2026-09-23, on this plugin's README
(`research/2026-09-22-terse-process/owner-readme-words.md` in this repository): 27 sessions searched; of
the 39 messages the owner typed that matched the genre's words, 23 kept and 16 dropped with the reason.
The structure writers and the critics rested sections and rulings on its lines, the owner-calibration
critic its whole ruler. The one exemplar the owner had named, on 2026-09-12, sat in it as a URL inside a
quote; no survey fetched it and no structure named it.

## 1. The survey

The slices are the six of [stages.md](stages.md#stage-1-what-comparable-documents-already-solved), and a
seventh, **the documents the owner names as good**, asked for before anyone is spawned. The seventh is
read whole and set beside the genre, never counted in it. One surveyor per slice, or two slices per
surveyor when the user sizes the survey smaller.

```
You survey stage 1 of rethink for <DOC>, on these slices: <SLICES>. The run directory is <R>.

Read first, in <R>: purpose.md, the owner's purpose statement, where there is one by now — the document
is judged against it; owner-words.md, the owner's own words on this genre; <DOC> as it stands, and any
draft of it the owner rejected, with the verdict; and, where there is an audit, the Reader profile in
audit.md. Do not read the source of what <DOC> describes.

FETCH, DO NOT RECALL. Every document you report, you fetched in this run as its markdown source — the
raw file (raw.githubusercontent.com/OWNER/REPO/HEAD/README.md) or the GitHub contents API, a page's
HTML only where there is no markdown — saved under <R>/survey/fetched/ and counted from the saved bytes.
Never a rendering, never a summarising tool: a summary comes back with headings the file does not have.
For every document: its URL; its headings in order; its word count; the first hundred words of its
body, verbatim; its devices, counted — tables, bullet lists, code blocks, badges, images; its sub-blocks —
what each section is split into and what marks the split, a `###` heading, a bold lead-in or a fence
standing alone — counted the same way; and its usage signal with the number — stars, downloads, a marketplace listing, forks: whatever the source shows.

WEIGHT BY USE, NOT BY TASTE. Rank by that signal. Where a much-used document does something badly, say
so, rather than ranking a pretty unknown above it.

For every document, also: after its first 150 words, what does the reader know — what it is, what it
does for them, what to type? And which device carries what: a table of commands, a code block for
install, a diagram for a process.

THE GENRE'S ORDER, as a table counted from the headings you saved: each place from the top, what the
genre puts there, and in N of M of your documents, named; at each place, the sub-blocks the genre
splits it into and what marks them, in N of M. For an exemplar of the owner's, its own order,
heading by heading.

GAPS, as SECTIONS WITH A PURPOSE AND A PLACE, never adjectives: "a section titled X, whose purpose is Y,
placed after Z, that N of M surveyed documents have", measured against <DOC> and the purpose. What NOT
to copy, the same way, with the harm named and the URL where it does harm.

Write your report to <R>/survey/<FILE>: a header — your slices, the date, documents fetched, failures
and why; a section per document with the fields above; the genre's order; per slice, "What they
solved", ranked by use, each item a section with a purpose and a place; "Gaps in <DOC>", the same way;
and, where your slice asks, "Not to copy". Cite nothing you did not fetch. Do not modify the repository
<DOC> lives in; write only under <R> and $TMPDIR; never `cd` inside a compound command. Return only:
the report's path, the documents fetched per slice, and the three gaps you rank highest.
```

For the seventh slice, `<SLICES>` is "the documents the owner named as good", with their URLs; the rest
stands.

Measured on 2026-09-23, on this plugin's README: three surveyors, two slices each (Sonnet, Sonnet,
Codex Terra), 39 distinct documents, none left unfetched. For four of one surveyor's ten, the larger
files, WebFetch returned a paraphrase dressed as the source — headings the files do not have, no code
block, no link; the surveyor caught it by that shape before citing anything and fetched all ten again
with `curl`. No survey fetched the owner's exemplar. And the genre's order was counted only after the
owner asked for it, at his read of the skeleton: «нужно на уровне смыслов и идей понимать, предметную
область, какие в ней порядки, предпослыки, типовые правила для структуры» — the domain has to be
understood at the level of meanings and ideas: its orders, its premises, its typical rules for structure.
Nor were the sub-blocks: reading round 03 on 2026-09-24, the owner asked for Quick start's install,
workflow and update to be marked as the genre marks them — «Тут опять же можно посмотреть, а как
делают. … Возможно использовать ## заголовки, либо через bold выделить три смысловых блока» — and the
count was made afterwards, for skeleton 03: 4 of 8 plugin READMEs and 4 of 5 agent READMEs head the
blocks inside their start section.

## 2. The synthesis

```
You are the synthesis of stage 1 of rethink for <DOC>. The survey reports are in <R>/survey/: <FILES>.
Read them, then purpose.md, owner-words.md and <DOC>. Fetch again, into <R>/survey/synthesis-sources/,
every source a verdict of yours rests on: a survey's count can be wrong, and the file settles it.

Merge every item a report solved or named as a gap into ONE table, a row each:
  the section, its purpose and its place;
  the reports and the fetched sources behind it;
  N of M, saying what was counted out of what — never a percentage pooled across slices of different
    kinds — and the usage weight, the top usage signal among the documents that have it;
  a verdict: TAKE; TAKE WITH CHANGE, and the change; ALREADY PRESENT; DO NOT TAKE; or CONTRADICTS, with
    the owner's words or the clause of the purpose it contradicts, quoted;
  for a TAKE or a TAKE WITH CHANGE, what it displaces in <DOC>, by line, or the growth it admits, in
    words.
Then: the count by verdict; the not-to-copy items merged, each with its harm and its verdict; the
presentation devices decided, each with its count; the genre's order merged from the reports, each place
with its sub-blocks and their marks, with the owner's exemplars' order beside it; the disagreements between reports, and every correction the fetch
made to their evidence; what the purpose needs that no survey covered; and the owner's requirements
that no surveyed document matches.

A decision record: no prose for the document and no skeleton. Write <R>/survey/synthesis.md. Do not
modify the repository <DOC> lives in; write only under <R> and $TMPDIR; never `cd` inside a compound
command. Return only: the file's path, the count by verdict, and the devices decided.
```

Measured on 2026-09-23 (Codex Astra): 25 rows — TAKE 3, TAKE WITH CHANGE 10, ALREADY PRESENT 3, DO NOT
TAKE 6, CONTRADICTS 3 — over 29 sources fetched again, every one answered, and the fetch corrected the
surveys' own counts in several rows. It is an edit plan for the current document, not an inventory of
the genre: 12 of its 13 TAKE and TAKE WITH CHANGE rows name the line they replace.

## 3. The structures

**First, the owner's decisions.** An unknown the structures would have to plan around, and that is the
owner's to decide rather than a fact to check, is put to the owner before any structure is written;
every writer gets the answer as a fact, and until it comes a structure reserves the section and plans no
sentence of it. Measured on 2026-09-23: the section answering "can it change my files?" rested on a
boundary true of the branch and false of the shipped version, which only the owner could settle. The
brief passed it down to ten writers: all ten planned the section around it and hedged, and three planned
the very reassurance the audit had scored wrong.

**The readings**, one per writer. The default ten are those of 2026-09-23; the ten angles of 2026-09-12
are in [stages.md](stages.md#stage-3-the-structure-decided-before-any-prose).

1. **Decide in thirty seconds** — the first screen: what it is, what it does, why one would want it.
2. **What do I type** — built around the reader's first action and what comes back from it.
3. **What it will not do** — for a reader who fears the tool: what it reads, writes, where, when it asks.
4. **Against the alternatives** — for a reader who uses something else: what this is not, what it adds.
5. **Change without harm** — for a reader burned by changes that made things worse: how one is proven.
6. **Outside the field** — for a reader who knows none of its jargon: every command in one block to copy.
7. **The genre's shape** — the order the vendor and the most-used documents converged on, with N of M.
8. **The process as the spine** — one picture of it, and each section a stage, in the order they run.
9. **Claims with their evidence** — for the sceptic: each claim beside how it was measured, its limit.
10. **The shortest that serves** — the fewest words that meet the purpose: at most 400 on 2026-09-23.

```
You write ONE structure for <DOC>, from this reading of its purpose: <READING>. A structure, not
prose: the section titles in order; for each section one sentence of purpose, what it deliberately
excludes, a word budget, and the device that carries it — a table, a code block, a list, a diagram,
plain paragraphs; the total budget; and at the top the owner's purpose statement, quoted verbatim from
<R>/purpose.md. One page at most; no sentence of the document itself.

Read first, in <R>: purpose.md, the purpose the structure serves; owner-words.md; the survey reports in
survey/ — their heading inventories and the genre's order — and survey/synthesis.md, which records what
to take into <DOC>, not what the genre has; the owner's exemplars, fetched in survey/fetched/; terms.md,
the words decided, which you use; <DOC> as it stands; and, where there is an audit, the Reader profile
and the Questions and answer key in audit.md. Do not read the source of what <DOC> describes: a
structure written from the mechanism describes the mechanism.

Your reading is the lens; the purpose statement is the judge. Under the title, in three lines: what your
reading takes as the reader's first need, and what it therefore leaves out that another reading would
keep.

Account for what you keep and for what you drop. Every section you keep rests on a row of the synthesis,
a place in the genre's order or a clause of the purpose, named — or says "new" and why the purpose needs
it. For every kind of section the genre carries — in at least 2 of the exact-genre documents, or in the
most used one — that your structure does not: its name, its count and top usage weight, what the reader
loses without it, and why that is cheaper than its words.

Write only <R>/structures/<NN>-<slug>.md. Do not modify the repository <DOC> lives in; never `cd` inside
a compound command. Return only: the file's path, the section titles in order with their budgets, and
the total.
```

Measured on 2026-09-23: ten writers (Sonnet ×4, Opus ×2, Codex Luna ×2, Sol, Terra) planned 300 to 778
words against the current document's 933. Their brief gave them the synthesis and not the surveys, and
asked what each kept section rested on, never what a structure dropped. The ten came out as one
inventory in ten orders, no structure said what it left out, and none had Troubleshooting, which 3 of 9
exact-genre READMEs carry, the most used among them. Skeleton 01 kept it at that weight and the owner
cut it at his read: the drop was his to make, once it was visible.

## 4. The critics

Three lenses by default, one critic each. Each critic reads its lens's own file beside the common ones,
and writes its own report.

| Lens | Its own file | What it asks | On 2026-09-23 |
|---|---|---|---|
| the owner's calibration | `owner-words.md`, and any draft the owner rejected, with the verdict | would the owner send a document written from this structure, and which of their words it keeps or breaks | Claude Fable |
| the reader's task | the audit's Reader profile, Questions and answer key and task readers' tasks; with no audit, what the purpose says the reader must be able to do | where each answer lives, and whether each task can be done in order without a guess | Codex Astra |
| the genre and the evidence | the survey reports, the synthesis and the fetched documents | whether each section rests on a row, a count or the purpose; what the genre has that it drops, at what weight and what cost | Claude Opus |

```
You are a critic of stage 3 of rethink for <DOC>, on one lens: <LENS>. You see ALL the structures in
<R>/structures/ at once — the numbered files, not the brief — because ranking is the judgement asked for
and it cannot be made from isolated reviews. Read first, in <R>: purpose.md, the statement every
structure is judged against; owner-words.md; survey/synthesis.md; terms.md; <DOC>; and your lens's own
file, <LENS-FILE>.

Return, in <R>/critics/<FILE>:
1. A ranking of all of them, each with one line of why it sits there under your lens.
2. For EVERY structure, the one you rank first included, its fatal flaw: the one thing that would make
   the owner reject a document written from it, with the owner's words or the purpose clause it fails,
   quoted.
3. What all of them got wrong: the failure every structure shares, which is a failure of the brief
   rather than of a writer, and what the brief should have said.
4. The grafts: for the structure you rank first, the two or three sections or devices from the others it
   should take, named by file and section, and what each displaces.
No rewrites and no prose for the document. Do not modify the repository <DOC> lives in; write only
under <R> and $TMPDIR; never `cd` inside a compound command. Return only: your file's path, your top
three in order, and the shared failure in one sentence.
```

Measured on 2026-09-23: the three firsts split — 07, 09 and 01 — and each critic named a different
failure all ten shared, each the brief's: the files section planned on a boundary only the owner could
settle (the owner's calibration); no structure carrying the reader's whole path from an audit report to
a reviewed draft without writing into their tree (the reader's task); and sections of the genre dropped
without a word (the genre). Section 3 answers the first and the third; the skeleton carried the second,
the path from a report to a draft inside Quick start.

## 5. The base

Disqualify first: a structure from which, the reader's-task critic shows, a reader cannot reach an answer
— no section holds it — is out, whatever its ranks. Among the rest, the owner-calibration critic's first
is the base if it is still in; otherwise the one whose average rank across the three critics is best.
Averaging ranks picks one structure to start from; it never averages the structures, which
[stages.md](stages.md#stage-3-the-structure-decided-before-any-prose) warns against. Grafts come only
from the critics' lists, each with what it displaces, and the failure each critic found in all the
structures is repaired in the skeleton or named there with its cost.

This is the rule the 2026-09-23/24 run applied once, with one change: the run applied the disqualifier
to the owner-calibration critic's first alone, and the weakness that left is recorded below. In this
form the rule has not been run.

Measured on 2026-09-23: 07 fell — two of the audit's questions had no home in it, and one task needed
backtracking — and 01 became the base at ranks 2, 3 and 1, a mean of 2.0 against 09's 3.3, 05's 3.7 and
07's 4.7. Read strictly, the run's rule retired 07 for two missing homes that 01 lacks as well; asked,
the owner left the reading to the coordinator: «ничего не скажу, так как вне контекста. Решай сам.» — I
will say nothing, it is outside my context; decide yourself. Applied to every structure, as above, the
same critiques keep only 09: nine of the ten had no home for Q7, the planted question the audit's key
calls unanswerable, and 01 had none for Q5 either. With the planted question left out, six are left, and
09 still has the best average.

## 6. The skeleton, and what the owner reads

```
You write skeleton <NN> for <DOC>. The base is <R>/structures/<BASE>.md, and the grafts, each from the
critics' lists with what it displaces, are: <GRAFTS>. Read first, in <R>: purpose.md; owner-words.md;
the reports in critics/; the survey reports and survey/synthesis.md; terms.md; <DOC>; and, from the
second skeleton on, the last one and the owner's read of it, skeleton-read-<NN-1>.md, whose every
answer you apply or put back to the owner as a question.

Seven parts, in order:
1. Every statement of the owner's in purpose.md that governs the document, verbatim, each with its
   rendering; the base, with its ranks; the genre's order as a table — place, what the genre puts
   there, N of M, where the owner's exemplars put it — with, at each place, whether this skeleton
   follows or departs, and why.
2. Each section: its heading and budget; its purpose; what it excludes; the device that carries it and,
   where the genre splits the section, its sub-blocks with what marks each; and what it rests on — a row, a count, a clause of the purpose, the owner's words.
3. The mechanical rules, each a command and the output that passes.
4. The terminology decisions, with the words rejected and why.
5. What is deleted outright from <DOC>, with the cost of each deletion.
6. The edits this structure needs in files that are not the document.
7. The decisions: those the owner's last read settled, each with where in the read; those still the
   owner's, each with your default; anything kept against the owner's word, with its evidence; anything
   routed outside the document, and where to; and the five you are least sure of, each with what would
   settle it.
Each failure a critic found in all the structures is repaired here or named with its cost. The skeleton
describes the document and never argues for itself: no section is introduced by who asked for it.

Write <R>/skeleton.<NN>.md, and copy it to <R>/skeleton.md. Do not modify the repository <DOC> lives in;
never `cd` inside a compound command. Return only: the path, the sections in order with their budgets,
and the total.
```

The message to the owner, which the coordinator writes from the file:

```
<R>/skeleton.<NN>.md, SHA-256 <hash>. What is asked of you: your word on this file, or the numbers of
the sections that are wrong, a few words each. Each default below stands unless you name it.

| Section | Budget | Device |
|---|---|---|
<a row per section of part 2>

Where it departs from the genre's order: <place — what N of M documents do — what this does — why>.
Kept against your word: <what — its evidence>.
Your decisions, each with my default: <decision — default>.
Least sure, each with what would settle it: <point — what settles it>.
```

The answer goes verbatim into `<R>/skeleton-read-<NN>.md`, each point beside the decision it settles; the
next skeleton is `skeleton.<NN+1>.md`, and none is overwritten. The owner's word of agreement names the
file, and `rewrite` writes it, with the file's path and SHA-256, as the first line of its `rounds.md`.

Measured on 2026-09-23/24: skeleton 01, 447 lines, went to the owner with a table of its ten sections and
seven questions, and he asked what exactly was required of him
([step 4](../SKILL.md#step-4-what-you-hand-over)). Told which parts were his, that each question had a
default, and that one word or the numbers of the sections would do, he answered twenty minutes later,
point by point. The message for skeleton 02 held the table of sections with what each carries, the
departures from the genre, one line kept against his word with its evidence and two questions with
defaults, and no least-sure points; sixteen minutes after his read he agreed: «согласен, стало гораздо
лучше» — agreed, it has become much better.
