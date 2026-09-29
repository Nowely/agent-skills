# Defects found in passing: terse

Recorded per the repository rule: evidence at file:line, an evidence level (1: the line resolves; 2: an
independent reader of the code would say the same; 3: the behaviour was made to happen), and wording that
can become an issue unchanged. An entry leaves when its fix lands and the changelog names it. Ids are
shared with entrust's ledger, `plugins/entrust/ISSUES.md`, so one id names one entry in both. A path
pinned to a commit is that commit's address, with today's beside it.

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

## E99. On a machine where terse is installed, the trigger suite's control arm cannot be isolated

**Evidence, level 3.** `plugins/terse/evals/clarity-trigger.live.md:51-52`: "Both arms use the ordinary owner profile,
including neighboring skills and user-level `CLAUDE.md`. They differ only in the explicit `--plugin-dir` flag." The
control arm counts only when the skill is absent: `plugins/terse/evals/clarity-trigger.live.mjs:184-185` sets its
isolation to `controlSkillAbsent === true`, and :207 keeps only isolated records. On 2026-09-29 the `ticket-check` case
ran both arms on a machine with terse 0.5.0 installed: all three control sessions loaded the installed terse
(`tersePluginVisible: true`, `controlSkillAbsent: false`, `isolationConfirmed: false`), so the arm counted nothing.

**Check.** On a machine with terse installed, `node evals/clarity-trigger.live.mjs --run --without-plugin --cases
ticket-check --repeat 1 --out "$TMPDIR/blind.jsonl"` records `isolationConfirmed: false`. This spends Claude tokens.

**Issue text.** The control arm runs on the owner's ordinary profile, so wherever terse is installed it loads there
too and every control record fails isolation. The owner's machine, where the suite is run, is such a machine. The
control arm needs the installed terse turned off for its sessions, or the page should say it needs a profile without
terse.
