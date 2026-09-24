# Writer report — round 03 (`03-routes.md`), G4, 2026-09-24

The verifier sent the round back once. The second build changes three sentences and the `asks` and checks of
four more, and adds one claim. The sections down to *Open* describe the build the verifier read; *Sent back*,
at the end, gives what changed and the counts now.

Run directory: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2`.
Code: `/Users/ruliny/Git/agent-skills`, HEAD `0dc7cf6`, which is research-only after `f97eb4a`
(`git diff --stat f97eb4a HEAD -- plugins/ .claude-plugin/` is empty). The one modified file in
`git status`, `research/2026-09-22-terse-process/rounds.md`, is the coordinator's; this round wrote nothing
in the checkout. Source: `reviews/02/routing.md` rows 1–2 and `reviews/02/lens6-fable-dedup.md`, read whole.

How the round was made:
- `edits/03.build.mjs` built the edits from 02's own bytes, and every check was dry-run first (all 17 match,
  every output under 2000 characters).
- `round.mjs 02-grafts.md 03-routes.md edits/03.json --ledger ledger.json` exited 0 (`probe-03/round-03.log`).
- The round file equals the build's preview (`probe-03/03-preview.md`).
- `03-routes.md` SHA-256 `36f1c9c4402c92ab445079f330e449a4def46cee735c18a9e8af5b1aed93d648`.
- `ledger.03.json` (the state before the round) is `f9f2b579…`. The ledger now holds 40 entries.

## The edits (17): 9 re-pins, 8 new claims, 0 drops, 3 with `qualifies`

| # | Finding | The sentence now | Claim | Level, check |
|---|---|---|---|---|
| 1 | L6.2-30, the coordinator's decision | opening: "…improving any text, in rounds of edits…" ("a README first" cut) | C01 re-pinned; `asks` without the README-first sources | 2, quotes of `purpose.md:5–6, 12–13, 32, 43`, `audit.md:21–22` and the pages |
| 2 | L6.2-03, the coordinator's decision | "You need: Node 22 or newer." | R02a re-pinned, `asks` narrowed to Node | 3, `probe-03/node.sh`: no node → exit 127; Node 24.11.0 → exit 0; audit and rewrite run node, rethink none; engines `>=22` |
| 3 | L6.2-18, 34 | "It asks which files and where your readers start, and waits for your answer." | R03a new | 3 by record, `probe-03/step1.sh`: c4-1's session stopped after the scope proposal, with no count or model said; step 1's exchange at `8c041b7` (the 0.1.1 the install fetched; GitHub main by `git ls-remote`, 2026-09-24) is this checkout's, word for word; `audit/SKILL.md:23–28, 86–89` |
| 4 | L6.2-34 | "Its report on this plugin's README, 2026-09-22:" | R02b re-pinned (its pattern starts here) | 3, `probe-02/excerpt.sh` |
| 5 | L6.2-20 | "If it does, run this and, when it asks, give it the folder the report names;" | R02c re-pinned | 2, `audit:166–171`, `rewrite:14, 37, 84` |
| 6 | L6.2-21 | "…in a folder of its own outside your repository." | R02d re-pinned | 3, `probe-02/rundir-rewrite.sh rewrite`, `record-run.sh`; `rewrite:76, 87–88, 221–223` |
| 7 | L6.2-18+19 | new: "Each skill says how many agents it will start and on which model, and waits until you say so." — at the end of Quick start's run, not under the route list (see *Departures*) | R03b new | 2, `audit:88–89`; `rethink:60, 96`; `rewrite:70–72, 150–151` |
| 8 | L6.2-04+28 | rethink's row: "…each with its purpose and size, to agree to before the text is written" | C10 re-pinned | 2, `rethink:4–6, 13–15, 17, 148–149` |
| 9 | L6.2-17 | rewrite's row, When: "After audit, once you say the shape stands; or from a skeleton you agreed to" | C11 re-pinned, `qualifies` | 3 by record, `probe-03/records.sh`: both routes, the gate `rewrite:14–16`, `audit:166–171` |
| 10 | L6.2-01, the regression | "- `/terse:rethink` → `/terse:rewrite` → `/terse:audit`" (line 52 stays) | C05 re-pinned; `asks` says the line claims nothing of that audit's questions | 2, `measure.md:106–109`; `audit:100–102, 170–171`; `rewrite:24–28`; `rethink:5–6` |
| 11 | L6.2-11, round 01's FALSE | "…checked by AI reviewers, each from its own angle." | R03c new | 2, `rewrite:66–68, 164–165, 197`; `bake-off.md:132`; `critic-briefs.md:110` |
| 12 | L6.2-29 | "The rules forbid filler, and cutting or weakening a condition, a limit or a warning where your readers decide;" | R03d new | 2, `writing-rules.md:6–7, 21`; `bake-off.md:114` |
| 13 | L6.2-12 | "rethink starts by reading documents like yours, with as many agents as you allow." | R03e new, `qualifies` | 2, `rethink:25–27, 55–61` |
| 14 | L6.2-09 | "Word count never selects a draft; cuts of twenty words or more carry reasons." | R03f new | 2, `bake-off.md:13–15`; `rewrite:235–236` |
| 15 | L6.2-13 | "A round that silently loses a sentence checked true, or brings back one found false, is refused before you see it." | R03g new, `qualifies` | 3, `probe-03/guard.sh`, five planted rounds (below); `rewrite:119–122, 143–144, 202–206` |
| 16 | L6.2-33 | "The same run: 2,725 words → 2,571." | C24 re-pinned | 3, `wc -w` 2725 and 2571; chain README:16, 20, 24 |
| 17 | L6.2-15 | "2026-09-22, this plugin's audit of its previous README: 5 of 7 right with the text, 0 of 7 without." | R03h new | 3, `probe-03/measured.sh`: the reader rows counted give docs 5 of 7 and no-doc 0 of 7; the README at `1a24018` = `00-original.md` (`cmp`) |

`probe-03/guard.sh`, the guard sentence's plants. Each case is a round made by `round.mjs` and judged by
`ledger.mjs`:

| Case | `ledger.mjs` exit | What it shows |
|---|---|---|
| a. pinned sentence cut, no drop | 1 | LOST: a silent loss is refused |
| b. retired phrasing back word for word | 1 | YES: the literal revival is refused |
| c. neither | 0 | the control |
| d. cut with its drop declared by name | 0 | the pin is removed and the drop is named: not silent |
| e. retired claim back in other words | 0 | not caught: the patterns are the retired phrasing, literally |

The `asks` states all five outcomes.

No edit adds a qualifying form from `round.mjs`'s list. Three give `qualifies`: C11, R03e and R03g, whose
clauses narrow their sentence to the page's own gate or size. No passage of twenty words or more was cut:
line 20's old sentence (28 tokens) lost its announcement to line 35 and kept its ask and wait.

## Departures from the coordinator's wording

Each departure was made for a rule of the agreed skeleton or a check.

- **The announcement sentence sits at line 35, the end of Quick start's run, not under the route list.**
  - §2.3 excludes "agents and cost" from Skills (`skeleton.md:126`).
  - Placed there verbatim, its "until you say so" puts the consent concept in three sections: Quick start
    (27, "say whether"), Skills and How it works. Rule 3 then fails; `probe-03/placement-trial.log` shows
    "1 concept(s) in three or more sections".
  - At 35 it names each skill after all three have appeared in Quick start. §2.2's device keeps the
    announcement in Quick start, and rethink's first mention stays at 27.
- **"each from its own angle" replaces "each with its own lens".** "lens" is on rule 7's must-not grep
  (`skeleton.md:260`), and terms row 45 drops it ("name what each reviewer checks"). The new phrase changes
  the must-use "AI reviewers, each checking one thing" (`skeleton.md:274–275`), which lens 1 showed false.
- **"with as many agents as you allow" replaces "as many as you allow".** The user sizes the survey's agents
  on the announcement (`rethink:60`), zero included on the audit way in (`:25–27`). No page lets the user set
  a count of documents.
- **"once you say the shape stands" replaces "once you say its shape stands".** "its" could be read as
  audit's; "shape" is defined at line 27.

## The coordinator's decisions applied

- L6.2-03: the sign-in clause is cut, over both judges' graft 1 and against l3 F2 CONFIRMED. `probe-02`
  still holds its level-3 evidence: signed out, each skill exits 1 "Not logged in". The decision rests on
  `stages.md` rule 4 and the owner's «мусорные детали». R02a keeps its ledger key; the key's sign-in half no
  longer describes the line.
- L6.2-30: "a README first" is cut, a departure from skeleton §2.1's purpose text (`skeleton.md:80–81`). It
  is least-sure #4, the owner's read.
- Not edited, as routed: 05 (the excerpt), 10 (the path told twice), 26 (the restart clause), 02 (the
  budget), 08 (two chains; the third route stays told at line 27), and the SUPERSEDED and SCOPE rows.

## Checks (`probe-03/checks-03.log`)

| Check | Result | Exit |
|---|---|---|
| `rule1.mjs 03-routes.md --cut "How it works" --except "Quick start"` | 0 violation(s) | 0 |
| the same without `--except` (the skeleton's rule 1) | 0 violation(s) | 0 |
| `dup.mjs 03-routes.md concepts.json` | 0 concept(s) in three or more sections | 0 |
| `sections.mjs 03-routes.md budgets.json` | 674 of 625, four over | 0 |
| `ledger.mjs ledger.json 00 01 02 03` | 0 failure(s) in 03-routes.md, 40 entries | 0 |
| rules 2, 5, 6.11, 7 | headings exact; 2 `bash` + 3 `text` fences; `/plugin` 0; qualifiers 0; must-not words 0; reader pairs 0; the first skeleton, shape and diff lines (27, 27, 33) hold outline, order and change; "fresh AI reader" first; terse only as the name | — |

`diff -u 00-original.md 03-routes.md > diff-03.patch`: 144 lines. No `saw` is clipped, and none is
provisional.

Words per section (`sections.mjs`):

| Section | 02 | 03 | Budget |
|---|---|---|---|
| (opening) | 68 | 65 | 70 |
| Quick start | 201 | 204 | 180 (+24) |
| Skills | 133 | 137 | 130 (+7) |
| How it works | 148 | 161 | 140 (+21) |
| What was measured | 111 | 107 | 105 (+2) |
| Total | 661 | 674 | 625 |

The +13 is +44 added and 31 cut. Added:
- the announcement sentence, +19 (it would add the same to Skills where the coordinator placed it);
- the rethink sizing, +8;
- the shape condition, +7;
- "when it asks", +3;
- filler, +2;
- +1 each in five places: "angle", "Word count", "silently", "the text", "a folder of its own".

Cut:
- line 20's first sentence, −14;
- the sign-in clause, −5;
- "for the first time", −4;
- the arrow at line 72, −4;
- "a README first", −3;
- "From its", −1.

## Open

- **Placement of the announcement.** Putting it under the route list needs two things from the owner: a
  decision on §2.3's exclusion of "agents and cost", and an answer to the consent concept reaching three
  sections.
- **The must-use list.** Rule 7's phrases "AI reviewers, each checking one thing" and "reads documents like
  yours first" are changed in the text but still stand in `skeleton.md`, which is not edited (its SHA-256 is
  the agreement's).
- **R03a rests on one recorded run.** It was one run, on main's 0.1.1, with Sonnet, on the signed-in profile
  through `--plugin-dir`. Its step-1 exchange is proven identical to HEAD's, but no run of HEAD's page was
  made here.
- **C11's audit route** ran under the pages at `2f29a8f`, before the shape gate. The condition itself stands
  at the page's level 2.
- **The third route is not in the list.** audit → rethink → rewrite → audit is told at line 27 only. Line 57
  claims nothing about its closing audit's questions.
- **Budget.** 674 of 625, with four sections over. That is the owner's question under rule 4.

## Sent back

`reviews/03/verifier-sol-v5.md` (Codex Sol V5, first read; detail in `verifier-codex-sol.md`): 17 claims,
10 HOLD, 3 REFUTED, 4 DOES NOT ANSWER, and one duty-1 sentence without a claim.

Regenerated by the page's recipe:
1. `03-routes.md` removed.
2. `ledger.03.json` copied back over `ledger.json`.
3. The first build kept as `edits/03.sent-back.json` and `edits/03.sent-back.build.mjs`, with its logs as
   `probe-03/round-03.sent-back.log` and `checks-03.sent-back.log`.
4. The build fixed, then `round.mjs` (exit 0), the four checks and `diff-03.patch`.

`03-routes.md` is now SHA-256 `ecec0360f1f53be9d20bd6afcfc1bed168be7d9e79402f20ed26dec5021119d5`. The first build
was `36f1c9c4…`. The second build has 18 edits and 18 claims (9 re-pinned, 9 new); 0 dropped; 4 with
`qualifies`; the ledger holds 41 entries.

**The three sentences changed**, verbatim:
- Line 35: "Before starting agents, audit says how many and on which model, and waits until you say so; rewrite
  does so before its writers and judges, and before a round's reviewers."
- Line 63: "By default three writers draft and two judges pick, then rounds of edits, checked by AI reviewers, each
  from its own angle."
- Line 66: "A round that silently loses a sentence checked true, or repeats one found false, is refused before
  you see it."

**REFUTED:**
- **R03b.** "Each skill … waits" was false for the adversarial read rewrite runs first on an existing
  document, which is unannounced (`rewrite/SKILL.md:64–66`). The sentence now names only what the pages
  announce: audit's agents (`audit:88–89`); rewrite's writers and judges (`rewrite:70–72`) and a round's
  reviewers (`150–151`). Its `asks` says it claims nothing about the adversarial read or rethink.
  - It is not your example sentence, which had two problems: "readers" alone fails rule 7's reader-pair grep
    (and "AI readers" at line 35 would come before the first "fresh AI reader"), and "writers, judges and
    reviewers" does not fit rethink, which has no judges.
  - rethink's wait now lives in R03e's clause, not here. "documents like yours" in Quick start would put
    that concept in three sections.
  - The edit no longer carries "You decide…" in its `new`: its `old` is `"\n\nUpdate:\n"`.
  - The claim is renamed to "R03b audit announces its agents and model and waits; rewrite does so before
    its writers, judges and a round's reviewers".
- **R03c.** Now reads "By default three writers draft and two judges pick", with `qualifies`. Its `asks`
  names both cases: the pool's defaults (three writers, and two judges with a third only on a split,
  `bake-off.md:19–22`), and the refusal (one candidate, comparison skipped, `rewrite:70–72`).
- **R03g.** Now reads "repeats one found false". Its `asks` says the check is over the phrasings the ledger
  records (`ledger.mjs:6–8`): the same false claim in other words is not a repeat and passes (`guard.sh`
  case e).

**DOES NOT ANSWER, with the text unchanged:**
- **C01.** The run now covers "best practices": the practices the plugin ships (`prior-art.md:299–304`,
  about forty ranked, all 271 in `practices-full.md:3–4`), rethink's first step and the survey's brief
  (`rethink:55`, `briefs.md:33–38`), and `stages.md:48–50` ("gathers the best practices").
- **R02a.** Its `asks` names the skills: audit and rewrite run Node scripts (`audit:163`; rewrite's seven
  lines), and rethink has no `scripts/` and no node command. The new `probe-03/node-pages.sh` lists each
  skill's directory and Node lines. "22" is the declared floor, not a tested one: only Node 24.11.0 ran,
  and no Node 22 is installed here.
- **C11.** Now in the page register at level 2: the row's routes as `rewrite:14–16, 24–28` and
  `audit:166–171` state them, and the hand-over at `221–223`. The record is the hand-over's level-3 part
  only. Its `asks` says the audit route under the shape gate has not been run to a hand-over.
- **R03e.** I kept the clause (option b); the other option was to cut it. The `asks` cites the user's word
  on the announced count (`rethink:60`), the survey the user may size smaller (`briefs.md:37–38`, the
  general route the verifier found unsaid), and the audit entry, zero included (`25–27`). I kept it because
  cutting it brings back "rethink starts by reading documents like yours" unconditionally, which is L6.2-12's
  overstatement: at size zero it reads none.

**Duty 1.** "You decide whether the draft replaces your document." has its own edit (`old` = `new`) and
claim, R03i, level 2 (`rewrite:221–223, 88–89`).

**Checks** (`probe-03/checks-03.log`):
- all 18 claim checks were dry-run first: all match, every output under 2000 characters, no NOT FOUND;
- `rule1.mjs`: 0 violations, exit 0, both forms;
- `dup.mjs`: 0 concepts in three or more sections, exit 0 ("writers, judges, reviewers" now in Quick start
  and How it works: 2 sections);
- `sections.mjs`: exit 0 (words below);
- `ledger.mjs` over 00–03: 0 failures, exit 0;
- the skeleton's rules 2, 5, 6.11 and 7: clean;
- `diff-03.patch`: 144 lines.

Words per section: opening 65/70; Quick start 215/180 (+35); Skills 137/130 (+7); How it works 163/140
(+23); What was measured 107/105 (+2); total 687/625. The +13 over the first build comes from line 35
(+11), "By default" (+3) and "repeats" (−1).

**Checkout.** An untracked `research/2026-09-22-terse-process/rewrite-2026-09-24/run/code-defects.md` and the
modified `research/2026-09-22-terse-process/rounds.md` are the coordinator's. This round wrote nothing in the
checkout.
