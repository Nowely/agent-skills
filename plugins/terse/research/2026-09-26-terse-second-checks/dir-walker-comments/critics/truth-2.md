<!-- truth-2; 3.2 min; 305220 tokens; exit 0 -->

Codex Sol T2: complete — 5 sentences refuted or overstated.

- Line 310 — refuted: “Directory nodes arrive later through `finalize_chain`.”
  Evidence (level 2): child tasks are spawned during parallel entry processing (`dir_walker.rs:365-380`) and can publish through `finalize_chain` before the parent finishes `collect` and performs its file-node `extend` (`dir_walker.rs:323-335`).
  True: “Directory nodes are published separately through `finalize_chain`.”

- Line 341 — refuted: “Return file nodes to the caller’s batch.”
  Evidence (level 2): every unignored entry not handled by the directory branch reaches `build_node`, including an unfollowed symlink or other non-directory entry; `data.is_file()` is only passed as an argument (`dir_walker.rs:361-398`), and `build_node` can return a `Node` when that argument is false (`node.rs:49-90`).
  True: “Return leaf nodes to the caller’s batch.”

- Line 396 — overstated: “The task that sees zero takes the children, builds the directory outside the lock, and continues with its parent.”
  Evidence (level 2): when the synthetic outer node reaches zero, `parent` is `None` and the function returns before taking its children or building a node (`dir_walker.rs:430-452`).
  True: “When a real directory reaches zero, that task takes its children, builds the directory outside the lock, and continues with its parent; the synthetic outer node returns instead.”

- Line 399 — refuted: “`parent: None` marks the synthetic outer node; by then its children contain the finished real root.”
  Evidence (level 2): `build_node` returns `Option<Node>` and returns `None` when metadata lookup fails (`node.rs:49-90`). The missing-root route reaches finalization (`dir_walker.rs:339-345`) but cannot build a root node, so the outer node reaches zero with no root in `children`.
  True: “`parent: None` marks the synthetic outer node; any successfully built root Node has been pushed into its children by then.”

- Line 620 — refuted: “Root plus DEPTH descendants, each holding exactly one child.”
  Evidence (level 2): the fixture is a chain of `DEPTH` nested directories (`01-draft.rs:606-611`); its deepest descendant is a leaf and therefore has no child.
  True: “The chain contains the root plus DEPTH descendants; every node except the deepest has exactly one child.”
