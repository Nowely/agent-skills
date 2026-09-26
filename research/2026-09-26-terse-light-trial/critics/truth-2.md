<!-- truth-2; 4.5 min; 346156 tokens; exit 0 -->

Codex Sol T2: complete, level 2 source-only — 7 sentences refuted or overstated.

- Line 41 — overstated: “Shows only files.” Evidence: `src/filter.rs:81-95` treats every leaf node—including empty directories—as a file and preserves the root. Shorter true sentence: “Flattens leaves.”

- Line 42 — overstated: “Shows only directories.” Evidence: `src/filter.rs:124-130` filters only child candidates; `src/filter.rs:50-54,92-95` preserves the root, even when it is a file or synthetic total. Shorter true sentence: “Keeps directories.”

- Line 43 — overstated: “Includes only matching paths.” Evidence: `src/dir_walker.rs:248-253` applies the inclusion regex only to files; directories are still traversed and may appear without matching. Shorter true sentence: “Includes matching files.”

- Line 44 — refuted: “Excludes matching paths.” Evidence: `src/dir_walker.rs:256-260` excludes matching file entries only; matching directories remain traversable, while `src/node.rs:57-80` merely zeros their own contribution. Shorter true sentence: “Filters matched files.”

- Line 47 — overstated: “Stays on the starting filesystem.” Evidence: `src/utils.rs:37-57` collects one device set for all starting paths, and `src/dir_walker.rs:219-225` permits every device in that set beneath every root; undetected devices also disable the restriction. Shorter true sentence: “Limits detected devices.”

- Line 48 — refuted: “Uses file length instead of allocated blocks.” Evidence: Unix does this (`src/platform.rs:38-45`), but the Windows expensive path uses `size_on_disk()` when apparent size is enabled and file length otherwise (`src/platform.rs:142-170`). Shorter true sentence: “Uses file length on Unix.”

- Line 63 — overstated: “By default on Unix, it measures allocated space and avoids counting the same inode and device twice; `--apparent-size` switches to file length and includes duplicate inodes.” Evidence: `src/platform.rs:45-64` replaces anomalously large block reports with a length-derived value, so the default is not always allocated space; deduplication behavior is in `src/dir_walker.rs:133-160`. Shorter true sentence: “On Unix, Dust uses capped block counts and deduplicates inode-device pairs; `--apparent-size` uses file length without deduplication.”
