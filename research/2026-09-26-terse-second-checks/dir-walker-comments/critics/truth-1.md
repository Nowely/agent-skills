<!-- truth-1; 4.3 min; 202028 tokens; exit 0 -->

Codex Sol T1: complete — 6 sentences found refuted or overstated.

- Lines 3–5 — Refuted (level 2): “...a directory is built only after its own listing is complete...” On a non-retryable `read_dir` error, [`walk_dir`](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-trial-dust/dust/src/dir_walker.rs:275) breaks without a complete listing, then calls `finalize_chain` at line 345, which can build the directory.  
  True: “Directory discovery fans out through Rayon tasks. A directory is built after its scan task and all spawned descendant tasks have finished.”

- Lines 5–7 — Overstated (level 2): “...`clean_inodes` is a later recursive pass that deduplicates filesystem identities and aggregates each tree.” Deduplication is conditional on `!walk_data.use_apparent_size` at [`src/dir_walker.rs:135`](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-trial-dust/dust/src/dir_walker.rs:135).  
  True: “Directory discovery is non-recursive; the later recursive `clean_inodes` pass removes repeated inode/device pairs unless apparent-size mode is enabled, then aggregates the surviving nodes.”

- Lines 70–71 — Refuted (level 2): “...plus one for every spawned child directory.” With link following enabled, [`process_entry`](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-trial-dust/dust/src/dir_walker.rs:364) spawns a task for any symlink entry, including a symlink to a file or a broken symlink.  
  True: “Outstanding completions: one for this `walk_dir` task, plus one for each child task it spawns.”

- Line 135 — Overstated (level 2): “Apparent-size mode deliberately counts every directory entry instead.” Entries may already have been removed by ignore, filesystem, time, hidden-file, or regex filters, and metadata failure can prevent `build_node` from producing a node. Apparent-size mode only bypasses the identity check at [`src/dir_walker.rs:135`](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-trial-dust/dust/src/dir_walker.rs:135).  
  True: “Apparent-size mode skips this identity deduplication.”

- Line 154 — Refuted in a rare case (level 2): “In file-time mode, `size` carries the newest selected timestamp.” [`build_node`](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-trial-dust/dust/src/node.rs:72) stores `timestamp.unsigned_abs()`, and `clean_inodes` selects the maximum. For pre-epoch values, an older `-100` becomes `100` and defeats a newer `-50`, which becomes `50`.  
  True: “In file-time mode, a directory’s `size` is the maximum of its own stored file-time value and those of its retained children.”

- Line 200 — Overstated (level 2): “`main` canonicalizes absolute ignore paths.” `main` calls `canonicalize_absolute_path`, but [`src/utils.rs:75–78`](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-trial-dust/dust/src/utils.rs:75) retains the original absolute path when canonicalization fails.  
  True: “`main` attempts to canonicalize absolute ignore paths and keeps the original path if that fails.”
