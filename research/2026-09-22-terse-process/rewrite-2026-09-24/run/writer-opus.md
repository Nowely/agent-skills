# Writer report — Claude Opus, repair-first (candidates/opus.md, SHA-256 9a681465…cac5ad80), 2026-09-24, verbatim from the hand-back (probes under $TMPDIR/terse-opus-writer-probe-20260924, isolated CLAUDE_CONFIG_DIR, env -i, signed out, cost 0)

The code changed while I worked: HEAD moved from 78c17ef to 9e3066a (3c4d1e1 gave rethink a run folder outside the repository), so the folder line now covers all three skills; probes used a copy of plugins/terse taken at 01:07:55, matching 9e3066a except CHANGELOG.md.

Mechanical rules, re-run: rule1 0 violations; headings exactly the five; dup 0; fences 2 bash and 3 text; `/plugin` count 0; the excerpt is found with grep -F in R/audit.md:993; qualifier, banned-words and reader-pairs greps print 0; the required phrases occur with the first-use rules held; "score" not used. Ledger: 0 of 11 retired phrasings present; 16 true claims LOST by rewording, expected; C23 kept.

## a) Behaviour sentences: level, and the line or command

Opening — "for assessing and improving any text…": the owner's mission, not a behaviour claim; the backed scope is the Markdown line in Quick start. "It is not a compressor." level 2 (bake-off.md:118, 136–138; rewrite/SKILL.md:108); level 3 (sections.mjs exits 0 over budget).

Quick start — the install fence, level 3: run today from GitHub on a clean signed-out config, both commands exit 0, `plugin list` shows terse 0.1.1 enabled, nothing printed about reload or restart, so no reload clause. "Node 22 or newer": level 1 for the floor (package.json:5); level 3 that Node is needed (selftest.mjs fails "node: command not found", exit 127, with no node; passes on 24.11.0); the floor of 22 itself untested. `/terse:audit` and `/terse:rewrite` resolve, level 3 (an unsigned `claude -p` loaded each page, exited "Not logged in", cost 0). ".md only", level 2 (audit/SKILL.md:25, 92). "asks which files … where your readers start": level 2 (audit/SKILL.md:23–28); level 3 on record (task reader TA reached the exchange on 2026-09-22; step 1's text unchanged since 1a24018). "how many agents … which model, and waits until you say so", level 2 (audit/SKILL.md:88–89); not run, a skill run needs sign-in. "every answer already right → stop", level 2 (audit/SKILL.md:151–153). Shape verdict, level 2 (audit/SKILL.md:166–171; rewrite/SKILL.md:14–20). "give it the folder the report names", level 2 (audit/SKILL.md:38, 166–167; rewrite/SKILL.md:37). "run rethink first", level 2 (audit/SKILL.md:171). "draft and its diff; you decide", level 2 (rewrite/SKILL.md:221–223). Update fence: level 3 on the GitHub route (both commands exit 0; the second reports "already at the latest version (0.1.1)"); level 3 on a local copy bumped to 0.1.2 (`plugin update` printed "updated from 0.1.1 to 0.1.2 … Restart to apply changes" — the CLI gives the restart instruction itself, so no clause added); level 2 that the marketplace update is needed first on GitHub (the CLI's hint says "try `claude plugin marketplace update nowely`").

Skills — audit row, level 2 (audit/SKILL.md:3–6, 18–19, 125–133; measure.md:54–60; a `missing` cause may have no line, audit C02). rethink row, level 2 (rethink/SKILL.md:4–6, 13–17, 116–151). rewrite row, level 2 (rewrite/SKILL.md:14–29, 221–223). "You start each one yourself", level 2 (disable-model-invocation: true at audit:7, rethink:7, rewrite:8; audit's "Run neither", :174) — shaped like a guarantee, no model run made, unconfirmed as an all-runs claim. "both orders end in audit", level 2 (measure.md:106–115).

How it works — item 1, level 2 (measure.md:10–38, 70–81; audit/SKILL.md:71–102; truth-pass.md:73–77). Item 2, level 2 (audit/SKILL.md:125–133). Item 3, level 2 (rewrite/SKILL.md:66, 150–167; bake-off.md:19–22). Item 4, level 2 (writing-rules.md "Never cut…"; bake-off.md:114; rethink step 1 sizable to zero, :26). Item 5: level 2 (bake-off.md:118; rewrite/SKILL.md:235; the cut list is compiled by the model, no script makes it); level 3 (sections.mjs exits 0 over budget). Item 6: level 3 (ledger.mjs exits 1 on a lost or revived claim; four self-test checks; my run on this candidate against R/ledger.json printed 16 LOST, exit 1); level 2 for "before you see it" (rewrite/SKILL.md:144, 202–205). Item 7: level 3 for the folder (all three pages arrive with D="<config>/plugins/data/terse-nowely"; the formula makes <data>/runs/<stamp>[-<slug>[-rethink]]); level 2 for "nothing in your repository changes until you say so" (audit/SKILL.md:44; rethink/SKILL.md:29–46; rewrite/SKILL.md:88–89, 172–173, 222–223) — "nothing" is a guarantee word; level 3 needs a signed-in run.

What was measured — 3/6 → 6/6 with the right answers held: level 1 only (research/README.md:9; measure.md:125–127; no reader data in the repository, audit C31). p = 0.25: level 3, computed as 2×0.5³ on counts that are level 1. Not run without the text: level 2 (research/README.md:10; prior-art.md:107). 2,725 → 2,571: level 3 (wc -w on chain/00-original.md and chain/README.md). 5/7 and 0/7: level 2 (recounted from the report's reader rows; the Open section's stricter 3/7 not carried). "Never measured": level 2 (the audit's limits line; prior-art.md:128–133). The link: level 1 (prior-art.md:41, 87).

## b) What the skeleton asked for that I could not write

1. Reload and permission clauses — both need runs I could not make; the install printed nothing about reload; a skill run needs sign-in; whether an open session picks up a shell install is untested. 2. "audit again with the same questions" is false for rethink → rewrite → audit on a never-audited document; I wrote "both orders end in audit", so "back to audit" matches no section. 3. How it works is 148/140; everything the purpose lists is there; the overrun is the owner's question under rule 4; the total is 601 of 625. 4. The excerpt could only come from the Score line (Q2 excluded; TB describes behaviour the code no longer has; every Q7 line fails the reader-word grep or rule 1); the reader sees no finding with cause and file:line. 5. Language: not written; the skeleton decides nothing about it. 6. F1: installing from GitHub gives main's 0.1.1 with the older pages, re-verified today; kept out by the owner's no-version rule. 7. F2: signing in to Claude Code is still not named; the device allows one Node line. 8. F4: how to audit a draft before it replaces the document is not defined by the pages.

## c) Tempted to cut, and kept

"waits until you say so"; "stop there"; the shape condition and the rethink branch; both the apply decision in Quick start and "until you say so" in How it works (two separate decision points); the Node line; "or weakening" and "or a named source"; p = 0.25, "not run without the text" and "Never measured"; "It is not a compressor."

## d) Words per section (sections.mjs)

| Section | Words | Budget |
|---|---|---|
| Opening | 68 | 70 |
| Quick start | 154 | 180 |
| Skills | 126 | 130 |
| How it works | 148 | 140 (+8) |
| What was measured | 105 | 105 |
| Total | 601 | 625 |

What a first-time reader still has to bring (curse-of-knowledge step 1): a signed-in Claude Code; Node on PATH; a session opened after the install; that "docs / no-document / delta" in the excerpt means with the text, without it, and the difference; that runs are deleted on uninstall without keep-data or purged from temp; that agents cost tokens.
