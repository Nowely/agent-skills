# Briefs, one per role

Every agent `rethink` starts gets one of these with its placeholders filled, and nothing else: `<R>` is
the run directory, `<DOC>` the document, and every file a brief names under `<R>` is there before the
agent starts. A Codex agent gets its brief the way
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
session, once where a forked or resumed session repeats it, and list the dropped hits with the reason;
the owner's words in reviews and issues go in the same way. The documents the owner named as good go at
the top, by URL: they are the survey's seventh slice.

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
body, verbatim; its devices, counted — tables, bullet lists, code blocks, badges, images; and its usage
signal with the number — stars, downloads, a marketplace listing.

WEIGHT BY USE, NOT BY TASTE. Rank by that signal. Where a much-used document does something badly, say
so, rather than ranking a pretty unknown above it.

For every document, also: after its first 150 words, what does the reader know — what it is, what it
does for them, what to type? And which device carries what: a table of commands, a code block for
install, a diagram for a process.

THE GENRE'S ORDER, as a table counted from the headings you saved: each place from the top, what the
genre puts there, and in N of M of your documents, named. For an exemplar of the owner's, its own order,
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
presentation devices decided, each with its count; the genre's order merged from the reports, with the
owner's exemplars' order beside it; the disagreements between reports, and every correction the fetch
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
