# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E107. The Node floor is written in three places, and the two numbers drift when `engines` changes

**Evidence, level 1.** `plugins/terse/plugin/package.json:4-5` `"engines": { "node": ">=22" }` is the floor's owner.
`plugins/terse/plugin/README.md:14` "You need: Node 22 or newer." and `plugins/terse/plugin/skills/rewrite/SKILL.md:95`
"Run the script on it too, with Node 22 or newer, from this skill's `scripts/`" carry the number. `plugins/terse/evals/pages.test.mjs`
reads the README for its skill rows (`:262-265`) and nothing for the floor; no file under `evals/` mentions `engines`
or a Node version. `plugins/terse/plugin/skills/audit/references/ledgers.md:61` names `engines.node` as an example
inside a sample ledger, not as a fourth statement. The repository's rule for terse (`AGENT.md`, "terse's shared
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
