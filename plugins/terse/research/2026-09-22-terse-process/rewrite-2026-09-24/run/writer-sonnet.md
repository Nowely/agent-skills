# Writer report — Claude Sonnet, path-first (candidates/sonnet.md), 2026-09-24, verbatim from the hand-back

Angle: PATH-FIRST — rebuilt the reader's route (install → prerequisite → first run → branch on the result → second run → diff decision → update) as the section skeleton, then fitted every required fact and every "what broke" repair onto that route rather than treating the route and the repairs as separate passes.

## a) Evidence level per behavioural claim

Level 3 (made it happen, this session): the two install commands, run verbatim in an isolated CLAUDE_CONFIG_DIR under $TMPDIR with env -i, never signed in — `claude plugin marketplace add Nowely/agent-skills` → exit 0 (cloned via HTTPS from GitHub); `claude plugin install terse@nowely` → exit 0, installed terse 0.1.1 at commit 8c041b76d7f30196441285d77985b81ae9c9e59f. Scratch dir removed after.

Level 3 (prior executed run, read directly): "You need: Node 22 or newer" for the fact that Node is required at all — research/2026-09-22-terse-process/rewrite-2026-09-22/run/probe-03/install-probe.log: self-test exits 127 with no node on PATH, exits 0 with Node 24.11.0; corroborated by the run's own audit.md C20 (level 3 verdict). The specific floor "22" is level 1 only — package.json's "engines":{"node":">=22"}; no script checks the version and only 24.11.0 was ever run (C21, same file).

Level 2 (I read the source directly): the opening's "assesses and improves... in rounds of edits by several AI agents... rules and best practices" — .claude-plugin/plugin.json, .claude-plugin/marketplace.json, and all three skills/*/SKILL.md read whole; "not a compressor" — corroborated in research/2026-09-10-chain/README.md and skills/rewrite/references/measurements.md; `/terse:audit` "asks which files... where your readers start, announces how many agents... and on which model, then waits" — audit/SKILL.md Step 1 and Step 5; the shape-verdict branch — audit/SKILL.md Step 6; `/terse:rewrite` returns "a whole new draft... and a diff... applying needs your word" — rewrite/SKILL.md Step 5; the Skills table + "you start each one yourself" — disable-model-invocation: true in all three; "two chains end in audit again" — audit/SKILL.md Step 6 routing; How it works' four bullets — audit/SKILL.md Steps 3–6, truth-pass.md, rewrite/SKILL.md Step 3, Step 4 item 4 and Step 5, Step 4 (run directory outside the repository; nothing written to it without the user's word) — this supersedes the stale Q2/Task-TB claims in brief part 5; "AI readers... only whether a model does" — audit.md's own "Limits beside it" line; the 2026-09-10 numbers — measure.md, measurements.md (M19), prior-art.md, the raw research/2026-09-10-chain/ artifacts; not level 3.

Level 1: the excerpt — verified with grep -F against this run's audit.md (line 993); prior-art.md's "Findings against this plugin's own claims" heading (line 87). Level 1 (documented, not executed): the update commands — the vendor's documented form; no probe log runs them.

## b) What I could not write

- How it works' "starting where the reader's own readers start" — cut under the 140-word cap; the protected condition/limit/warning clause and the five-cause list took the space.
- A legible narrative "What broke" excerpt for Quick start — grep -F matches within one physical line only; the wrapped entries do not survive it; Q2 and Task TB are the stale ones. The Score-line notation was the only clean option: authentic, not success-only (it includes a failed planted question), but dense.
- Nothing stating the method covers "any text in any language, code or not" — the owner's intent and part 5 names its absence a `missing` finding, but no section purpose in this skeleton calls for it.

## c) Tempted to cut, kept anyway

"rules protecting a condition, a limit or a warning where your reader decides" (How it works); "or a named source" (Judging bullet); every dated number (p = 0.25, 2,725 → 2,571, 3/6, 5/7, 0/7); "no rewording" in the Skills table's audit row.

## d) Word counts (sections.mjs)

    70 / 70   0   (opening)
   173 / 180  -7   Quick start
   130 / 130  0   Skills
   140 / 140  0   How it works
    89 / 105  -16  What was measured
   602 TOTAL, 0 section(s) over budget

Also self-checked: rule1.mjs 0 violations; dup.mjs 0 concepts in 3+ sections; heading sequence exact; exactly 2 bash + 3 text fences; `/plugin` count 0; the rule-7 forbidden-word grep and the qualifying-word grep print nothing; the excerpt is a verbatim substring of this run's audit.md.
