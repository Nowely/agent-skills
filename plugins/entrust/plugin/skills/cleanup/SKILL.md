---
name: cleanup
description: >-
  Lists files left by entrust, suggests what to remove, and deletes the
  user's selection after approval.
disable-model-invocation: true
metadata:
  version: "0.23.0"
license: MIT
---

Run the script, show its listing as it is, propose a set, and wait for the
user's word. Speak in short sentences when proposing, when clarifying, after
deleting, and on every refusal or error. Read the JSON yourself for the
numbers; never read it, paths or exit codes to the user, and never retell the
listing in your own words.

Every sentence quoted below is a model of what to say, not text to copy out.
Say it in the user's own language, keeping the names, counts and reasons the
command gave and inventing none; a listing block is the one thing shown
exactly as the command printed it.

## The cycle

1. Run the listing with the Bash description "List files left by
   entrust."

       F="$(node "${CLAUDE_SKILL_DIR}/../orchestrate/scripts/temp-dir.mjs" cleanup)" && CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/../codex/scripts/cleanup.mjs" --list --json >"$F" && cat "$F" && echo "snapshot: $F"

   The helper gives each listing its own file under `<temp>/entrust/_global/cleanup/`.
   Cleanup keeps these snapshots because approval may still refer to one. A name built from the shell's
   `$$` does not: two listings in one shell would share it, and a number from
   the first would then be read against the second. Keep the snapshot path
   from the last line; step 3 needs that exact path. Show the `text`
   field to the user in one code block, unchanged. It is the listing: numbered
   items, their sizes, when they last changed, whether each is suggested,
   selectable by its number or kept, and why. Say nothing about the items
   yourself. When it says the agent scan used Node's fallback temporary
   directory, keep that warning in the block so the user sees that agent scratch
   elsewhere may not have been found. An empty inventory is "I found no items
   covered by this cleanup."
2. Propose in one sentence exactly what `proposed` holds, by those rows' names
   and their total size: "I suggest deleting the temporary files for agent
   u1-astra and 172 temporary directories from the lock tests, about 11 MB;
   shall I?" When `selectable` holds numbers that are not in `proposed`, add
   one sentence naming them: "Item 1, the 9 September 2026 cleanup, item 7,
   the standalone report from run 42, and item 18, 43 saved conversations from
   the tests, can go too if you say their numbers." Then wait. With nothing
   suggested and nothing else selectable,
   say "I have no cleanup to suggest; the listed items are being kept for the
   reasons shown."
3. Map the answer to numbers yourself. "Yes", "yes please", "go", "go ahead",
   "apply it" or "да" is exactly the numbers in `proposed`. Digits are those
   numbers; an affirmative with digits adds them to the suggestion; "only" or
   "instead" restricts to the digits alone. "All" or "everything": ask "Do you
   mean the items I suggested, or the runs, standalone reports, saved
   conversations and abandoned locks as well?" and wait. "No": "I'll leave the listed items in
   place." A question: answer
   it, delete nothing. Silence: wait. A number that is not in `selectable` is
   not yours to send — say "<name> is being kept; the listing says why." and
   leave it out. Then run, with the description "Delete the cleanup items the
   user selected.":

       CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_SKILL_DIR}/../codex/scripts/cleanup.mjs" --delete --from "<SNAPSHOT>" <numbers>

   Do not run the listing again between the user's word and this call: the
   snapshot is what binds each number to what was shown, and an item that
   changed since then is left in place and reported.
4. The command prints one paragraph per outcome, then the fresh listing.
   Report every outcome it printed in your own message, keeping its names and
   reasons and adding none —
   "I deleted the temporary files for agent u1-astra and 172 temporary
   directories from the lock tests, and left the 9 September 2026 cleanup in
   place because it changed since it was listed." Then show the fresh listing
   in a code block when anything remains, and say "I have no further cleanup
   to suggest." only when its last lines say nothing is suggested and nothing
   else is selectable.

## Reading the result

Read the whole output even on exit 10: deletions and refusals occur together.
Use the listing's names; omit outcomes that did not occur.

| Result | What to say and do |
| --- | --- |
| 0 | every deletion the command reported, then the fresh listing |
| 1 | "I could not remove <name> because <reason>; check it by hand." beside the confirmed deletions |
| 2, no data directory | "Cleanup could not start because this session has no plugin data directory configured; nothing was deleted." |
| 2, relative `TMPDIR` | "Cleanup could not start because `TMPDIR` is not absolute; nothing was deleted." |
| 2, a stale or unreadable snapshot | "The list I showed you is no longer usable, so nothing was deleted; here is the current list." Then start again at step 1 |
| 2, invalid command | "Cleanup could not start because the command was invalid; nothing was deleted." Correct the call |
| 10 | each refusal in its own sentence, carrying the command's own reason: it changed since it was listed; it is being kept and cannot be chosen; it changed while it was being removed |
| no readable result | "Cleanup did not return a readable result, so I cannot yet confirm what was deleted." Establish the outcome first |

## What it never touches

Answers, managed worktrees and their ledger, write locks still held or in the
older single-file shape, and the shared Codex home are listed and never
removed: the driver prunes answers and reconciles the next two itself, and the
last is shared by every agent. A write lock is a link and the record it names.
A normal release removes both; a release that cannot take the lock's reclaim
marker, a crashed run and an older driver leave the link, and a release whose owner file is not its own leaves both. A link that
names nothing is proposed, and so is a record no link names once the run that
wrote it is gone. A lock whose run stopped without releasing it goes
with its record by its number; the driver reclaims it anyway on its next run
in that directory. The data directory
of another copy of this plugin is the user's own to remove — when they ask
how, say "This command removes it." and show that row's `command` from
`manual` in its own block. The one directory this does not cover is the plugin's own under its previous
name, `codex-delegate-<marketplace>`: listed as such, proposed, removed by number like scratch, unless a
plugin of that name is still installed. The `notCovered` commands apply only to other
entries in the coordinator's temporary directory. Say "To list those entries
without removing them, run this command." and show `notCovered.listCommand`;
for removal, `notCovered.removeCommand`. An agent started under another
temporary root is outside the agent scan; its report is kept while
`report.json` is absent. A legacy run or standalone report the cleanup removes
takes its temporary folder with it, `<tmp>/entrust/<rel>` for the report at
`<state>/<rel>/report.json`, on the same row and number and under the run's
own rule, so a run still going keeps both. New scratch under
`<tmp>/entrust/<project>/<run>/{agents,checks,swarm,evals}` is listed per invocation,
kept while its owner or a recorded child is running, and removed only by its own number.
Project and run parents are never selected; approval snapshots under `_global/cleanup` are kept.
A legacy folder under `<tmp>/entrust`
whose run is no longer in the state directory, or a `runs/<startedAtMs>-<pid>`
folder whose process has ended, is a row of its own, suggested for deletion;
one whose process is alive, or whose run is still there, is kept. What an
earlier driver left in `<state>/tmp` is one row, suggested once no
`owner.json` in it names a live process. `<tmp>` is the temporary directory as
the cleanup sees it: a non-empty `TMPDIR`, else Node's `os.tmpdir()`.

Forward `CLAUDE_PLUGIN_DATA` as shown. The script uses
`ENTRUST_STATE_DIR` first, then `CLAUDE_PLUGIN_DATA`; setup follows the
sibling's [One call](../codex/SKILL.md#one-call).
