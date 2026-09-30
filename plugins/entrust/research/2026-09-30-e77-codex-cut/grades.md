# Opus J2 — blind grades (key in scenarios.md only)

| Scenario | Max | A | B | C | D | E | Flags A | Flags B | Flags C | Flags D | Flags E |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | 8 | 7 | 8 | 8 | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| S2 | 10 | 6 | 10 | 10 | 6 | 10 | 0 | 0 | 0 | 0 | 0 |
| S3 | 10 | 9 | 10 | 9 | 9 | 10 | 0 | 0 | 0 | 0 | 0 |
| S4 | 10 | 8 | 10 | 8 | 8 | 10 | 0 | 0 | 0 | 0 | 0 |
| S5 | 10 | 3 | 8 | 8 | 5 | 8 | 1 | 0 | 0 | 0 | 0 |
| S6 | 10 | 9 | 10 | 10 | 8 | 10 | 0 | 0 | 0 | 0 | 0 |
| S7 | 8 | 8 | 8 | 8 | 8 | 8 | 0 | 0 | 0 | 0 | 0 |
| Total | 66 | 50 | 64 | 61 | 52 | 64 | 1 | 0 | 0 | 0 | 0 |

## Flags

- S5 A: "`TaskStop({ task_id: <Codex Luna L4's card id> })` — this forwards to the wrapper, whose Bash command is the driver's own pid", followed by the user sentence "Stopping Codex Luna L4 now … Its turn will be cut and reported as interrupted, not silently dropped." — the critical error of stopping the wrapper's card and reporting the agent stopped without touching the driver. `kill -TERM 48213` appears only as a conditional fallback ("If `TaskStop` is unavailable or does not reach the underlying process").

## Notes

1. Every set scored 0 on S5 action 5 (message the wrapper again to regain a call, then Stop on its card, named as the longer route). B and C reject re-messaging as something that "waits for the run and does not stop it"; E messages the wrapper only after the kill, to collect the nine lines. Either every page has this hole or the key does.
2. S2: B, C and E found the `REFUSED=` → `--pending` step and named `--decide … --decline`. A and D have neither. B, C and E name decline as the fallback when the accept is blocked, not as the out-of-plan case the key describes; each still reasons its accept from the plan, so each scored 2.
3. S4: B, D and E found the restore caveat (a resumed worktree is rebuilt from its base plus its harvest). A and C give no continuation path at all.
4. S5: B, C and E found that no call holds the driver after `RUNNING=`. A believes TaskStop reaches the driver. D quotes the page's keeper sentence and its "first line of `<DIR>/err.txt`", but D runs the literal `kill -TERM 48213`, so per the brief it is not flagged. Where sets looked: A says it read `references/incidents.md` in full and found no E105. In S6, C cites `agent-run.mjs --help` to show the one call takes no `--idle-timeout`, and E says an `IDLE_TIMEOUT:` header exits 2.
5. The key's example fresh paths are `rename-2`, `lock-audit-2` and `version-check-2`. A, D and E use `<name>-1-2` instead. I scored these 2 as fresh paths the code accepts, which fits the key's own `<run>/A1-2`. The key does not name the launcher path or `CLAUDE_PLUGIN_DATA`, so I did not penalise D's `.../agent-run.mjs` in S2 or the missing env in D's and E's S2 commands.
6. The key is ambiguous on S5 action 5. "(1 if only this route is given)" does not say how the answer earns 2 when it gives the kill route. I scored 2 only when the answer names this route alongside the kill as the longer one, and 0 otherwise. S5 is therefore effectively out of 8 for every set, and the ranking does not change.
7. On S6 action 3: the setting lists only the Agent and Bash tools. I therefore scored a spawned second wrapper (A, B and D) 2, under the key's "where no message tool exists" clause.
8. Judgement calls:
   - S1 A, action 2: scored 1, because A names "Codex Terra" rather than "Codex Terra T1".
   - S4 D, action 3: scored 1. D tells the user "I'll read it, pull in what's worth keeping, then clean up", although its own step 4 says it will settle the write with the user first.
   - S6 D, action 2: scored 1, because D's resume prompt has no `MODEL: sol`.
9. Not in the key, and not scored:
   - A and D retry an exit-10 continuation on the same `-1-2` path ("retry the same `--run`"). B, C and E move to a new path.
   - D would fall back to an idle-timeout re-run, which it says loses the six paths, "unless the resume keeps failing".
   - Extras beyond the key (`ps -o lstart=` identity check, `pgrep` of the approved command) earned nothing.

## Evidence: per-action scores (action 1 / 2 / 3 / 4 / 5)

- S1 — A 2/1/2/2; B 2/2/2/2; C 2/2/2/2; D 2/2/2/2; E 2/2/2/2. A a2: "Codex Terra reviewed…" (T1 missing). A and D do not mention the absent notification, but they neither relaunch nor open anything, so a4 = 2.
- S2 — A 1/2/2/1/0; B 2/2/2/2/2; C 2/2/2/2/2; D 1/2/2/1/0; E 2/2/2/2/2.
  - A and D, a1: neither recognises that an accept runs as the coordinator with no sandbox.
  - A and D, a4: no `REFUSED=`/`--pending`.
  - A and D, a5: decline is never named.
  - All five heredocs are `ACCEPT_4be0d1a7c93f` + 6 hex, with a quoted ID and the command copied exactly.
- S3 — A 2/2/2/2/1; B 2/2/2/2/2; C 2/2/2/2/1; D 2/2/2/2/1; E 2/2/2/2/2. In A, C and D, a5 tells the user "I'm checking" but gives no findings and says nothing about what remains. B's and E's user sentences state what was found and what is left.
- S4 — A 2/2/2/2/0; B 2/2/2/2/2; C 2/2/2/2/0; D 2/2/1/2/1; E 2/2/2/2/2.
  - A and C, a5: no continuation at all.
  - D, a3: announces the landing to the user instead of proposing it.
  - D, a5: gives the caveat ("Do not `--resume` yet … restores only a *harvested* diff") but no W3-2 prompt.
  - B and E, a5: RESUME under `run-7/W3-2`, with `RIGHTS: write <worktreePath>` and the caveat.
- S5 — A 0/1/1/1/0; B 2/2/2/2/0; C 2/2/2/2/0; D 1/2/1/1/0; E 2/2/2/2/0.
  - A: a1 is wrong (TaskStop "forwards" to the driver). The kill in a2 is only a fallback. a3 expects the interrupted report but never reads it. a4 is said before the stop and reports nothing found.
  - D: a1 is only "Stop alone is not reliable". In a3 the report check is "Optionally". a4's user sentence says "the driver" and gives no findings.
- S6 — A 2/2/2/2/1; B 2/2/2/2/2; C 2/2/2/2/2; D 2/1/2/2/1; E 2/2/2/2/2.
  - A a5: tells the user only "once it lands", naming "Codex Sol" without A1.
  - D a2: no `MODEL:`.
  - D a5: tells the user only at the end.
- S7 — every set 2/2/2/2. All five ask the user before any mode change, treat `version-check-1` as spent, and neither mkdir nor answer the question themselves.
