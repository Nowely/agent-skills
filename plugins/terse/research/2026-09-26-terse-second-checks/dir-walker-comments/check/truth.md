<!-- truth; 3.2 min; 200493 tokens; exit 0 -->

Codex Sol CT1: complete — 3 sentences refuted or overstated.

- Lines 3–5, overstated: “Each [`PendingDir`] counts one obligation for its own `walk_dir` task and one for every child task it spawns.” Evidence: `src/dir_walker.rs:93–99` creates the sentinel with a count of one, but no `walk_dir` task runs for it; that count represents the root. Plainest true sentence: “Each real directory’s [`PendingDir`] starts with one obligation for its own `walk_dir` task and adds one for each child `walk_dir` task; the sentinel’s obligation represents the root.”

- Line 8, refuted: “The directory algorithm makes no recursive calls.” Evidence: `src/dir_walker.rs:365–380` reaches `walk_dir` again through `process_entry` and a `scope.spawn` closure. The calls are task-scheduled rather than inline, but the call graph is recursive. Plainest true sentence: “Directory discovery schedules descendant `walk_dir` calls with `scope.spawn` rather than calling them inline.”

- Line 83, overstated: “Walk each input root and return every `Node` tree that was built.” Evidence: `src/dir_walker.rs:135–139` can discard an already-built root whose inode/device pair was seen earlier, and lines 123–127 return a root only when `clean_inodes` returns `Some`. Plainest true sentence: “Walk each input root and return the root trees that remain after inode deduplication.”
