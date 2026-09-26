# Opus lens 2, round 03: the mechanical rules, the water, duplication and contradiction

Document: `$R/03-review.md` (126 lines, 1,078 words by `sections.mjs`). Original: `$R/00-original.md`.
Rules: `$R/skeleton.md` (no agreed skeleton; Open decisions (a)–(e) of round 03, skeleton.md:11-26),
`$R/budgets.json`, `$WR`. Checks: `rule1.mjs`, `dup.mjs`, `sections.mjs` as shipped.

    R=$TMPDIR/terse/runs/20260922-233021-terse-readme
    S=~/Git/agent-skills/plugins/terse/skills/rewrite/scripts
    WR=~/Git/agent-skills/plugins/terse/skills/rewrite/references/writing-rules.md
    T=$(mktemp -d)

Decisions applied where a writing rule and a round-03 decision collide (the decision governs):
(d) over "Also cut: editing history" (writing-rules.md:12) for l73-75; (a) over water for the l23 frame
and the attributions at l47, l79, l82, l83, l86, l91; (e) over water for l5-6; (b) for the content of
l109-111; (c) for l89-90.

Findings: 12 — rules 4 (R1–R4), water 2 (W1–W2), duplication 0, contradiction 6 (P1–P6).

---

## 1. The mechanical rules

Verdict: 4 violations (R1–R4). Clean: rule 1; capitals for emphasis; opening glossary; purpose once
at the top; editing history outside l73-75; decisions (b) and (c).

### Checks run, with output

**Rule 1.** `node $S/rule1.mjs $R/03-review.md --cut "Install" --except "Install"` →
`0 violation(s), 0 excused`, exit 0. Tested on a planted violation first (loop.md: "every check is
tested against a planted violation before its output is believed"):

    sed '55s/$/ Pass --keep-data, set $TMPDIR, see ~\/.claude\/x, exit 2, MCP, CLAUDE_CONFIG_DIR./' $R/03-review.md > $T/planted.md
    node $S/rule1.mjs $T/planted.md --cut "Install" --except "Install"   → 6 violation(s), exit 1
    (same tokens appended to l80, after the cut)                          → 0 violation(s), exit 0

One hole in the check, harmless this round: see *Notes on the checks*.

**Budgets.** `node $S/sections.mjs $R/03-review.md $R/budgets.json` (a report, not a gate:
skeleton.md:5-6, sections.mjs:4). Cross-checked with `sed -n "<range>p" | grep -v '^## ' | wc -w` per
section: identical. The budgets are the original's sizes: `node $S/sections.mjs $R/00-original.md
$R/budgets.json` → every section 0, TOTAL 909 (Where it writes: 120, set at round 02, skeleton.md:10).

| section | words | budget | diff |
|---|---|---|---|
| (opening) | 149 | 99 | +50 |
| What each one does | 361 | 324 | +37 |
| Install | 91 | 49 | +42 |
| Where it writes | 156 | 120 | +36 |
| What it will and will not do to your text | 116 | 127 | −11 |
| What was measured | 204 | 309 | −105 |
| Licence | 1 | 1 | 0 |
| TOTAL | 1078 | 1029 | +49; 4 sections over |

The opening's 149 include 34 diagram tokens and the 2 of `# terse`: 113 words of prose.

**Greps.**
- Editing history, `grep -n -i -E "previously|used to|moved|per PR|PR #|on this machine|formerly|no longer|\bstill\b|\bnow\b|renamed|earlier|originally"`
  → 2 hits, both false positives: l89 "re*moved*", l97 "moved 2,725 words" (a measurement). `\bstill\b` → 0.
- Capitals, `grep -n -o -E "\b[A-Z]{2,}[A-Z0-9_]*\b"` → ISSUES (in `ISSUES.md`), MIT, PATH, README, TMPDIR:
  names, not emphasis. Bold only on the three skill labels (l25, l36, l40); italic only *p* (l114).
- Glossary: l3 opens with the reader's two questions; no definitions block.
- Purpose: stated once, l3-5, in the reader's words ("Is my README any good? Does it even need rewriting?").
- Counts (writing-rules.md:25, not gates): 65 sentences; longest 35 words (l97, a dated measurement), 33 (l29),
  32 (l41), 31 (l111); no four-word phrase repeats.
- Decision (c), skeleton.md:20-21: l89 "the plugin's last installation"; `--scope` → 0 hits. Holds.
- Decision (b), skeleton.md:18-19: l109-111 "records its six readers before the rewrite one by one and holds
  no record of its readers after it". Holds (its wording collides with l111-112: P4).
- Decision (a), skeleton.md:13-17, as applied: the frame at l23 is verbatim skeleton.md:15; l49 is direct;
  the attributions at l79, l82, l83, l86, l91 are kept. Holds as applied; the rule itself: R3.
- Decision (d), skeleton.md:22-23: in Install ✓; `still` 0 ✓; the date 2026-09-22 ✓; `2f29a8f` and `8c041b7`
  ✓; the head of *Where it writes* (l79) carries no repeat ✓; branch name ✗ (R1).
- Decision (e), skeleton.md:24-25: "left as it is" is relative to round 02, which I did not open. Not checked.

### R1 — decision (d) "no branch name": l74 names the branch

l73-74: "At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`,
whose rewrite page wrote into the document repository without asking."

Rule: skeleton.md:22-23 "worded without editing history (lens 2 W2): no branch name, no "still", the date
and both commits kept".

Check: `grep -n '`main`' $R/03-review.md` → `74:marketplace's `main` at `8c041b7`, whose rewrite page …`

Same clause: "At the 2026-09-22 audit" names the document's own review event, the class writing-rules.md:12
cuts ("per PR #123"); the date the decision keeps does not need it.

A form that satisfies both: "On 2026-09-22 the install commands resolved to `8c041b7`, whose rewrite page
wrote into the document repository without asking." 23 → 18 words; the date and both commits kept.

### R2 — "A dated measurement keeps its date and its numbers" (writing-rules.md:22-23): the 2026-09-10 numbers changed

| | round 03 | original (00-original.md) | shipped writing-rules.md:37-40 |
|---|---|---|---|
| runs | l107 "Two experiments ran on 2026-09-10." | l64 "One run, on 2026-09-10" | "A run on 2026-09-10" |
| standards | l116 "four writing standards, one an unpublished draft"; l120 "the three published standards" | l76 "Five published writing standards" | "five writing standards"; "both published standards" |
| no change | l118 "five agents proposed no change, one changed punctuation only" | l78 "seven of ten agents proposed nothing" | "seven of the ten proposed nothing at all" |
| longer | l118 "three made it longer" | — | "two produced a longer text" |
| verdict | l119-120 "one judge put both controls above every entry …; ranking on verified findings, the other did not" | l77 "Both controls beat both entries of both standards" | "Both controls beat both entries of both published standards" |

Dropped with their numbers: 00-original.md:70-72 ("Two of the six failures were lies rather than
findability…"), 73-75 ("Two who reported no confusion answered wrong…"), 84 ("Two published benchmarks that
did run that arm found it large").

Check:

    grep -n -E "One run|seven|Five published|both entries" $R/00-original.md    → 64, 76, 77, 78
    grep -n -E "Two experiments|five agents|four writing|three published" $R/03-review.md   → 107, 116, 118, 120
    grep -n -E "A run on|five writing|seven of the ten|longer text" $WR          → 37, 39
    grep -c -E "lies rather|Two who reported|benchmarks that did" $R/03-review.md   → 0

Which numbers are true is a fact question outside this lens. If round 03's are a recorded correction, the
rule holds, and the plugin ships two texts that disagree on one measurement (the README and
writing-rules.md:37-40, which sits outside the SHA-pinned block). If they are not, the rule is broken. The
cut reasons for the three dropped findings are in `edits/`, which I did not open.

### R3 — decision (a)'s rule, read literally: page instructions stated as fact outside the l23 frame

Rule: skeleton.md:13-14 ""the instructions say" or "the page says" where the source is a page (level 2),
direct where a script does it (level 3)". The application note (skeleton.md:14-17) puts the frame at the head
of *What each one does* and keeps the attributions already elsewhere; it adds none.

Unattributed sentences outside the frame that state what a skill's page tells Claude to do:
- l7 "guarantee-shaped claims need a named source or weaker wording"
- l85-86 "Copying that defect into the repository's `ISSUES.md`, or applying the candidate to your document,
  requires your word." It follows l83's attributed sentence, and it is the page's only approval guarantee: the
  one l74 says an older page broke.
- l96 "Length does not select a candidate"
- l100 "the bake-off vetoes a candidate that cuts or weakens one" (the sentence attributes its first clause,
  "The writing rules forbid")
- l101-102 "A writer may reword one or correct it when it is false."

Neighbours that attribute: l79 "The `audit` instructions", l82 "The audit page", l83 "The `rewrite`
instructions", l86 "The `rethink` page", l91 "The `audit` and `rewrite` pages warn".

Check: `grep -n -E "instructions|page|rules forbid" $R/03-review.md` → 23, 34, 47, 73, 74, 79, 82, 83, 86, 91,
100, 111; none of l7, l85-86 (sentence), l96, l101-102 attribute. I did not check whether any of the five is
script-backed (level 3, direct allowed); that is a code question. For the coordinator this is UNSETTLED: the
application note may mean exactly this.

### R4 — "Define a term where the reader first needs it" (writing-rules.md:15): terms never defined

- "pinned sentence": l49, only occurrence.
- "wording retired as false": l49-50, only occurrence.
- "a four-pass rewrite chain" (l97) and "The chain" (l109): never tied to the rewrite l40-45 describes (an
  adversarial read, a bake-off, rounds), so a reader cannot tell whether the measured procedure is the one
  that ships.
- "run file": l15 (diagram), only occurrence; the prose says "an audit run" (l40), "the run" (l79).
- Lowest: "skeleton" used at l14 (diagram), defined at l37.

Check: `for t in pinned "retired as false" "run file" four-pass chain; do grep -n -i "$t" $R/03-review.md | cut -d: -f1 | tr '\n' ' '; echo; done`
→ `49`, `50`, `15`, `97`, `97 109`.

---

## 2. Water

Ranked. Two items, 13 words. The growth in the four sections over budget is conditions, prerequisites and
the version boundary: sentences skipped below for that reason.

**W1 — l75**, "The section below describes this commit, not that one." → cut. l73 "This page describes commit
`2f29a8f`." already scopes the whole page, the section below included; the warning itself, what `8c041b7`
did, stays in l73-74. It restates the warning in the same paragraph and is not the warning, so the
never-cut rule does not protect it. **9 words.** Check: `sed -n '73,75p' $R/03-review.md`.

**W2 — l36**, "**`/terse:rethink`** works before prose. It compares documents in the same genre, …" →
"**`/terse:rethink`** compares documents in the same genre, …". "Before prose" is already carried by l11
("when the document is missing or its shape is wrong") and l37 ("Its output is a skeleton"). **4 words.**
Check: `sed -n '11p;36,37p' $R/03-review.md`.

(R1's form saves another 5 words; counted under rules.)

Skipped because a younger decision governs:
- l23, the frame (15 words): decision (a).
- l47 "The instructions say to" (4 words; redundant under the l23 frame): decision (a) keeps the pinned
  sentences' words; pinning is in the ledger, which I did not open.
- l79, l82-83, l83, l86, l91, the attribution phrases: decision (a), "W9 not applied".
- l5-6 "whether or not the document is about software": decision (e).
- l73-74, the wording: decision (d) (R1 aside).

Skipped as a condition, a limit or a warning where a reader decides:
l7-8 (the unmeasured non-code pass); l10-11 (which skill to start with); l26 "may open only Markdown";
l33-34 (the ledger's exclusions); l41-44 (what is checked before a round reaches you); l50 "That guard is not
a promise that no regression can occur." (6 words would carry it; skipped); l52-53 (re-audit conditions);
l60-61 (prerequisites); l89-90 (lifetime); l91-92 (purge warning); l107 "Read them as pilots, not rates.";
l109 "The chain covered one README." (repeats l97's "one file" in a section read on its own); l109-115 (the
limits of the chain result); l122 "Not measured: …".

---

## 3. Duplication and contradiction

### Duplication: 0 facts in three or more sections

`node $S/dup.mjs $R/03-review.md $R/concepts.json` → `1 concept(s) in three or more sections`:
"rethink stops at a skeleton" (pattern `skeleton`) in (opening) | What each one does | Where it writes.
On reading, l14 and l37 say that rethink outputs a skeleton. l86-87, "The `rethink` page does not specify where
its skeleton is stored.", is a different fact (storage), in the section a reader opens to find where things
are. Not a finding.

Sweep beyond the list: content words (≥4 letters, stop-words removed) present in three or more sections →
25 words (rewrite, terse, claude, code, document, audit, candidate, repository, plugin, whether, readers,
answer, wording, pass, measured, rethink, skeleton, file, page, reader, without, section, bake-off, words,
writing). I read the hits for each. None carries one fact in three sections. The nearest is "bake-off":
What each one does (l41, what it is), What it will and will not do (l100, the veto), What was measured
(l116, the 2026-09-10 experiment; l122, unmeasured). That is three facts.

### Contradiction: scope-word claims and the sentence that says it can happen

Scope words present (`grep -n -i -E`): only (l26, l118), every (l47, l48, l119), each (l23, l25-26, l29, l37),
all (l55), forbid(s) (l82, l100), requires (l86), excludes (l33), without (l33, l74, l89), no/none/neither
(l50, l109-114, l118). `never|always|nothing|by default` → 0 hits.

Pairs, ranked:

**P1 — l85-86 ↔ l74.** "Copying that defect into the repository's `ISSUES.md`, or applying the candidate to
your document, requires your word." ↔ "the install commands resolved the marketplace's `main` at `8c041b7`,
whose rewrite page wrote into the document repository without asking." Only l73's "This page describes commit
`2f29a8f`." reconciles them. The install commands a reader runs (l66-67, l70-71) are the ones l74 says
resolved to `8c041b7`, and no line installs `2f29a8f`: `grep -n 2f29a8f $R/03-review.md` → l73 only;
`grep -n -E "plugin (marketplace add|install)" $R/03-review.md` → 66, 67, 70, 71.

**P2 — l100 ↔ l101-102.** "The writing rules forbid cutting a condition, limit, or warning where a reader
decides, and the bake-off vetoes a candidate that cuts or weakens one." ↔ "A writer may reword one or
correct it when it is false." Correcting a false limit cuts or weakens it, and the page does not say which rule
wins. Check: `sed -n '100,102p' $R/03-review.md`.

**P3 — l82, one sentence.** "The audit page forbids writing into the audited repository" ↔ "its reference on
measuring allows storing the score there on your word". The text reports two of the plugin's documents
disagreeing and leaves the operative rule to the reader: nothing is written except the score, and the score
only on your word. The defect is probably in the pages (CODE), not in the text. Check: `sed -n '82,83p' $R/03-review.md`.

**P4 — l110 ↔ l111-112.** "holds no record of its readers after it" ↔ "Its pages report six questions, one
trial per question, with 3/6 answers right before and 6/6 after, one reader leaving the documentation before
and none after". I applied decision (b) and do not dispute its content (no per-reader record of the
after-readers). But "no record" reads as no record of the after results, and the next sentence reports them.
Check: `sed -n '109,113p' $R/03-review.md`.

**P5 — l23 ↔ l49, l82-83.** "Each skill is a page of instructions for Claude; below is what each page says." ↔
"The shipped check rejects a new round that loses a pinned sentence or restores wording retired as false." (a
script, direct by decision (a), under a frame that calls everything below page content) and "its reference on
measuring allows storing the score there on your word" (the audit skill has a second document, with a
different rule). Check: `sed -n '23p;49,50p;82,83p' $R/03-review.md`.

**P6 — l47-48 ↔ l6-7.** "every declared behavioural claim its source and evidence" ↔ "guarantee-shaped
claims need a named source or weaker wording". The second lets a claim stand without a source. "Declared" may
exclude such a claim, but the page never defines "declared" (R4). Check: `sed -n '6,7p;47,49p' $R/03-review.md`.

None found for: l26 "may open only Markdown"; l29-30 "Each wrong answer gets a cause"; l33 "without
proposing wording"; l33-34 "excludes"; l37 "each section's title, purpose, exclusions, and word budget"; l47
"Every cut of twenty words or more must carry a reason"; l55-56 "All three skills announce … and wait for
your word"; l89-90 (lifetime); l96 "Length does not select a candidate"; l119-120 "every entry" (qualified
in the same sentence). Searched: this document.

---

## Notes on the checks (not counted; for the code-defects route)

- `rule1.mjs` misses `${TMPDIR:-/tmp}/terse` before the cut:
  `sed '55s|$| under `${TMPDIR:-/tmp}/terse` and `plugins/data/terse-nowely/runs/`.|' $R/03-review.md > $T/planted3.md; node $S/rule1.mjs $T/planted3.md --cut "Install" --except "Install"`
  → `0 violation(s)`. The env-var pattern (rule1.mjs:28) needs a capital right after `$`; the path pattern
  (rule1.mjs:26) needs two slash-separated segments starting with a letter. Harmless this round, because l80
  is after the cut. A "clean" verdict does not cover that form.
- `concepts.json` "conditions, limits, warnings kept": its first alternative, `condition, a limit or a
  warning`, matches 0 times, because the document says "condition, limit, or warning" (l100). The concept is
  found only through `repetition` (l102). Both are in the same section, so this round's count is right.
- `concepts.json` "rethink stops at a skeleton" is the bare word `skeleton`, so it flags the storage
  sentence (l86-87).

## Noted, not counted (outside the three lenses as briefed)

- "page" names three things: a skill's instructions (l23, l74, l82, l86, l91), this README (l73 "This page
  describes commit"), and the research record (l111 "Its pages report"). l73 and l74 use two of the senses
  in adjacent sentences.
- "the repository" names the audited repository (l34, l82, l85) and the plugin's (l109 "The repository
  records its six readers").
- "bake-off" names rewrite's step (l41 "three whole-file candidates and two judges") and the 2026-09-10
  experiment (l116 "ten agents in a 2 × 5 design").
- l25 "`/terse:audit` writes a reader profile, a claim ledger, and an answer key" ↔ l52 "use the same
  questions, answer key, entry file, and model": no line says how a re-audit reuses a key.

## Not opened

By instruction: `reviews/`, `rounds.md`, `grafts.md`, the ledgers, `edits/`. By choice, to stay on the named
inputs: `02-grafts.md`, `diff-0*.patch`, `03-codex-sol-verifier*.md`. What that leaves unchecked: whether l47
is pinned (decision a); the cut reasons for R2's dropped findings; decision (e)'s "left as it is". I checked no
fact against code.
