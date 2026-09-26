<!-- terms; 12.0 min; 2 tool uses -->

Reviewed `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260926-130310-dust-readme/01-draft.md` as the named reader (terminal user who wants to install and see disk usage at once). No files modified; only this one file was read.

**A. Words this reader would parse differently (hypothesis about reader cognition — not directly checkable without a live reader)**
- Line 35: "Combine the other controls as the question changes." — "question" reads as an interrogative; the text never poses one. Use: task.
- Line 65: "progress and errors go to standard error. The finished tree goes to standard output" — "standard" reads as "common/typical [error]," not as the name of an I/O stream. Use: stderr / stdout.

**B. Internal names where this reader has a plainer word**
- Line 63: "avoids counting the same inode and device twice" — "inode" is filesystem-internal. Use: file.
- Line 63, same clause — "device" reads as "gadget" to this reader, not "block device/partition." Use: drive.

**C. Same thing under two names (checkable directly from the text)**
- Line 7 "the largest files and directories" vs. lines 9/27/39/46 "entries" — one concept, two names. Use: entries (fix line 7).
- Line 42 "without file rows" vs. line 41 "individual files"/"files" (adjacent table row, same concept) — Use: files (fix line 42).
- Line 63 "totals the children beneath each directory" vs. the dominant "entries" (9/27/39/46, and later in the same sentence: "selects the largest entries") — Use: entries (fix line 63).
- Line 39 "Limits the selection to the largest entries" vs. that same row's third column "The default view is too short or too long" and lines 11/40 "the view" — Use: view (fix line 39).
- Line 35 "the other controls" and line 55 "See every flag" vs. the heading (line 33 "Useful options") and table header (line 37 "Option") — three names for one thing. Use: options (fix lines 35 and 55).
- Line 48, third column "Logical file size" vs. second column "file length" (same row) and line 63 "file length" — Use: file length (fix line 48, third column).
- Line 48 "allocated blocks" vs. line 63 "allocated space" (and line 48's own third column "disk use," the plainest of the three) — Use: disk space (fix lines 48 and 63).
- Line 53 "Loads settings from a chosen config file" vs. that row's third column "a reusable set of defaults" — same row, weaker case (arguably two facets of one thing). Use: defaults (fix line 53, second column).

