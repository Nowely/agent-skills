<!-- terms; 12.9 min; 14 tool uses -->

Read $TMPDIR/terse/runs/20260926-142621-dust-readme/01-draft.md as the reader in .../context.md (terminal, disk space missing/a directory grew, wants "what is taking the space?", knows shell + package managers, doesn't need Rust/traversal/config internals). 8 findings, grouped as asked.

**Words this reader would parse differently from what the text means**

- Line 82, "full paths" (a bare list of config-key categories; same issue at line 65, "Keep only paths that match a regular expression"): by this point the reader has fixed "paths" as the scan-target arguments (line 45 "Pass one or more paths," line 48 `dust <path> [<path> ...]`, context.md "scans one or more paths"). Reused here for a per-entry display/filter setting, with no sentence marking the switch. → **names** (line 82: "full names"; line 65: "names that match a regular expression").

- Line 7, "the large entries": every other statement of dust's point calls it "the largest entries" — a ranked top-N pick (line 43, line 57, and context.md's "drawing attention to the largest entries"). "Large" without the superlative reads as a size-threshold filter, a different feature. → **largest entries**.

**Internal names where the reader has a word of their own**

- Line 63 and line 82, "apparent size": context.md already gives this reader's word for it — "'Disk usage' means allocated space by default; --apparent-size switches to file length." Every other row of the "Choose what to see" table states a flag's plain effect; this row alone leaves the flag's own name untranslated, and it recurs untranslated at line 82. → **file length**.

**One term, two names**

- Line 7, "subdirectories" vs. line 60 and line 69, "directories" (context.md itself: "the largest files and directories"): same referent, line 7 is the one outlier. → **directories**.

- Line 7, "line count" vs. lines 43, 57, 64, "entries" (and the config key at line 76, `number-of-lines`): the thing being counted is "entries" everywhere except the opening sentence. → **entries**.

- Line 45, "roots" vs. "paths" earlier in the same sentence (line 48, line 65; context.md: "scans one or more paths"): elegant variation, not a second concept. → **paths**.

- Line 66, "depth" vs. line 58 and line 69, "levels": one tree-nesting axis named two ways. "Depth" matches the config key (line 77, `depth = 3`) and context.md's "how deep the tree goes," so the two "levels" are the outliers. → **depth**.

- Line 55 (and line 23), "Command" vs. line 69, "controls": both point at the rows of the "Choose what to see" table. Weakest of the eight — "Command" heads a full invocation, "controls" the flags inside it — kept because no third word competes for either sense. → **commands**.

Scope respected: read only context.md and 01-draft.md in the named run, plus plugins/terse/ reference files in the repo (not under research/) to confirm this brief's exact wording against roles.md's "Terms" role — nothing under research/, no other path under terse-trial-dust/, no other run under T/terse/runs/. No repository file modified, nothing written under $TMPDIR (not needed — report returned as this message), no `cd` used in any command.
