# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

## E84. `rewrite` reaches `writing-rules.md`, `curse-of-knowledge.md` and `truth.md` only through a second page

**Evidence, level 2.** `plugins/terse/plugin/skills/rewrite/SKILL.md:16-17` links `rules.md` and `roles.md`, and no
SKILL.md links `writing-rules.md` or `curse-of-knowledge.md`: they are linked from `README.md`, `references/rules.md`,
`references/roles.md` and `references/practices-full.md`. The writer and the sentences critic receive them as
`<SENTENCES>`, which the coordinator fills after reading `roles.md:10`; `truth.md` fills `<TRUTH>` the same way and
`rewrite/SKILL.md` never links it, while `audit/SKILL.md:28` and `clarity/SKILL.md:40` do. Anthropic's skill authoring
page: keep references one level deep from SKILL.md, because a model may read a nested file partially. From
`plugins/terse/research/2026-09-28-vendor-guides/m1-map.md`, finding 4.1.

**Check.** `grep -rl 'writing-rules.md' plugins/terse/plugin` lists no SKILL.md.

**Issue text.** The fixed sentence rules, the one text the pages say to pass as written, are two links away from the
page that runs the writer, where a model may paraphrase or half-read them. `rewrite/SKILL.md` should link
`writing-rules.md`, `curse-of-knowledge.md` and `truth.md` directly where its briefs use them.

## E85. `measurements.md` is 168 lines and opens with ranges, not a list of its entries

**Evidence, level 2.** `plugins/terse/plugin/references/measurements.md:3-8` gives the entries as ranges ("M1–M23 concern
…; M24–M25 …; M26–M33 …"); every skill page links it by anchor, and a `head -100` preview ends inside M17, before the
entries the current pages cite most. Anthropic's skill authoring page: a reference file over 100 lines opens with its
contents. Finding 4.2 of the same map.

**Issue text.** A model that previews `measurements.md` to find an entry sees neither the entry nor a list saying where
it is. The file should open with one line per entry.

## E86. `clarity`'s description carries two sentences of instructions that load on every turn (tension)

**Evidence, level 1.** `plugins/terse/plugin/skills/clarity/SKILL.md:3-12`: "Apply the checks silently when asked for only
the finished text; keep the requested format." sits in the description, which Claude Code keeps in context for every
turn of every session, since `clarity` is the one terse skill Claude may choose itself. Anthropic's skill authoring page
puts what the skill does and when to use it in the description and the instructions in the body. House side: the
description was tuned against `plugins/terse/evals/clarity-trigger.*`, and a change to it changes that measurement.
Finding 4.3 of the same map.

**Issue text.** The description spends tokens on every turn on how to apply the checks, which the body could say. Moving
it needs a new trigger measurement.

## E87. `rewrite` runs a Node script and no skill page says Node must be installed (tension)

**Evidence, level 1.** `plugins/terse/plugin/skills/rewrite/SKILL.md:96-97` runs `node
"${CLAUDE_SKILL_DIR}/scripts/sections.mjs"`; Node is named in `plugins/terse/plugin/README.md:14` "You need: Node 22 or
newer." and on no SKILL.md. Anthropic's skill authoring page lists required packages in SKILL.md. House side: the README
owns installation, by the genre note `readme-tools.md`. Finding 4.10 of the same map.

**Issue text.** A coordinator on a machine without Node meets a shell error the page does not explain. The page should
name the dependency where it runs the script.

## E88. `audit`'s eight steps have no checklist the model can copy and tick off (tension)

**Evidence, level 1.** `plugins/terse/plugin/skills/audit/SKILL.md:22-158` gives eight numbered steps and no checklist.
Anthropic's skill authoring page offers, for a complex workflow, a checklist the model copies into its response and
checks off. House side: the owner's rule keeps machinery out of what the person reads, and the audit reports to the user
in prose (`audit/SKILL.md:149-158`); the order is kept by the steps' dependence. Finding 4.12 of the same map.

**Issue text.** A long audit could skip a step with nothing tracking the order. Decide whether a checklist is worth what it
puts in front of the person, or can be kept out of the visible reply.
