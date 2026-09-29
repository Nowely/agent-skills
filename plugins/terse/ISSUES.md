# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E106. `CLAUDE.md`'s "one owner and one place" is read as one occurrence for a page an agent reads and as one owner for a text a person acts on, and the bullet does not say which (tension)

**Evidence, level 1.** `CLAUDE.md:48`: "clean architecture — each fact has one owner and one place, and a page says what
the code does", in a bullet scoped to "every plugin's code and pages". On 2026-09-29 the entrust options round applied
the words as one occurrence to pages a model reads (`plugins/entrust/research/2026-09-29-ledger-options/02-options.md`,
E52: a link line on `orchestrate` rejected as a duplicate of the sibling's reference; E83: a second list of
requirements in `codex/SKILL.md` rejected as "один факт в двух местах"; E89: a role classification held beside
`roles.md` rejected). terse's rules keep the definition in one place and repeat the condition where a reader decides:
`plugins/terse/plugin/references/writing-rules.md:9-10` "Give the instruction; the case for it lives in one place.";
`writing-rules.md:21-22` "Never cut a condition, a limit or a warning where a reader decides. Repetition at an
independently read decision point is not redundancy."; `plugins/terse/plugin/skills/audit/SKILL.md:135-139` "Placement
is repaired by repetition as often as by relocation. … Do not move a fact away from where it is currently read
correctly in order to put it where it is also needed — put it in both places."; `plugins/terse/plugin/references/rules.md:29`
"Keep a fact when it changes a decision. Versions, prerequisites, paths, protocol names and machine fields need space
when compatibility, reproduction or the next action depends on them."; the measured instance,
`plugins/terse/plugin/references/truth.md:58-61`. Neither reading is wrong: for a model the whole page set is one
context and a second occurrence is a second place to maintain; for a person each decision point is read on its own,
and the repeated condition has one owner still. The same day, an analysis of whether the principles apply to terse
called the principle "reversed" for text, and an outside critic corrected it to the owner-against-occurrence
distinction: the words admit both readings, and the one file every agent loads does not say which holds where.

**Check.** `sed -n 48p CLAUDE.md` and `sed -n '21,22p' plugins/terse/plugin/references/writing-rules.md`: the first
forbids a second place, the second requires one at a decision point, and no line joins them.

**Issue text.** The principle's "one owner and one place" means one owning place, where a fact is defined and changed;
terse's rules mean the same and, for a text a person acts on, repeat the condition at each decision point without
moving its owner. Read as one occurrence, the words would have an agent cut a repeated warning from a README or a
changelog, which terse's measured rule keeps. The fix is at the source and two words long: "each fact has one owner and
is defined in one place". A scope clause about text or decision points would be a qualification on the rule, and a
second statement of the rule in terse's pages a second place for it. The entrust verdicts stand under the reword: E52
rested on the compaction budget and on `orchestrate`'s own rule not to restate the sibling, E89 on a definition held
twice. The owner's wording, so the owner's word.

## E107. The Node floor is written in three places, and the two numbers drift when `engines` changes (draft)

**Evidence, level 1.** `plugins/terse/plugin/package.json:4-5` `"engines": { "node": ">=22" }` is the floor's owner.
`plugins/terse/plugin/README.md:14` "You need: Node 22 or newer." and `plugins/terse/plugin/skills/rewrite/SKILL.md:95`
"Run the script on it too, with Node 22 or newer, from this skill's `scripts/`" carry the number. `plugins/terse/evals/pages.test.mjs`
reads the README for its skill rows (`:262-265`) and nothing for the floor; no file under `evals/` mentions `engines`
or a Node version. `plugins/terse/plugin/skills/audit/references/ledgers.md:61` names `engines.node` as an example
inside a sample ledger, not as a fourth statement. The repository's rule for terse (`CLAUDE.md`, "terse's shared
pages") puts a definition two skills use in one place; terse's `rules.md:29` keeps a version where "compatibility,
reproduction or the next action depends on" it. For entrust the README names no number: `plugins/entrust/plugin/README.md:67`
"Node at or above the floor `package.json` declares (`engines`)".

**Check.** `grep -rn 'Node 22\|">=22"' plugins/terse/plugin` prints the three lines; a change to `engines` changes
one of them and no test notices.

**Issue text.** The floor has one owner, `engines`, and two copies that nothing keeps true. The README's copy is the
reader's install decision and stays: a person choosing whether to install needs the number on the page, not a file to
open. The rewrite page's copy changes no decision of its reader: the model that runs `scripts/sections.mjs` cannot
change the machine's Node, and a run on an older one fails on its own; drop the clause "with Node 22 or newer" from
`:95`. Let `pages.test.mjs` compare the README's number with `engines` so the one kept copy cannot drift, as it already
does for the README's skill rows.
