<!-- writer-repair-notes; 9.1 min; 5424183 tokens; exit 0 -->

Codex Sol W1: complete — 79 findings applied, 1 declined.

Repaired text: [02-repaired.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/02-repaired.rs>). Repair ledger: [02-repairs.md](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/02-repairs.md>).

- truth-1 — module claim required a complete listing — applied — non-retryable reads can finalize without one, so the comment now uses task obligations and the zero transition.
- truth-1 — module claim made inode deduplication unconditional — applied — the recursive pass now says apparent-size mode bypasses identity deduplication.
- truth-1 — `pending` described only spawned child directories — applied — link following can spawn other symlink entries, so the unit is now any spawned child task.
- truth-1 — apparent size claimed to count every directory entry — applied — filters and metadata failures can remove entries, so the comment now states only that identity deduplication is skipped.
- truth-1 — file-time `size` called the newest timestamp — applied — the code compares stored unsigned values, so the comment now states the actual maximum reduction.
- truth-1 — absolute ignore paths called unconditionally canonicalized — applied — the comment now records the attempted canonicalization and failure fallback.
- truth-2 — directory nodes said to arrive later than the file batch — applied — child tasks may finish earlier, so they are now described as published separately.
- truth-2 — `process_entry` said to return only file nodes — applied — unfollowed symlinks and other leaves can also produce nodes, and the redundant return narration was cut.
- truth-2 — every zero transition said to build a directory — applied — the comment now distinguishes entries with a parent from the sentinel and says `build_node` is called.
- truth-2 — sentinel said always to contain a finished root — applied — the comment now limits this to successfully built roots.
- truth-2 — every node in the deep fixture said to have one child — applied — the arithmetic-restating comment was removed; the deepest node is a leaf.
- rationalizer — keep the module result sentence — applied — a maintainer opening the file needs to know that its result is a `Node` tree.
- rationalizer — keep the module fork/join model — applied — it carries the concurrency shape before the reader reaches implementation detail.
- rationalizer — keep the discovery/post-pass recursion contrast — applied — the distinction is needed to assess stack behavior and the deprecated stack option.
- rationalizer — keep the `PendingDir` ownership explanation — applied — upward publication through retained parent state is not obvious from the fields alone.
- rationalizer — keep the counter definition — applied — confusing obligations with a child count is the reader’s identified failure point.
- rationalizer — keep the FxHash boundary — applied — it explains why this hasher is confined to filesystem-number keys.
- rationalizer — keep the synthetic-parent explanation — applied — the sentinel otherwise looks like an unnecessary empty path.
- rationalizer — keep the root’s initial-count explanation — applied — the initial obligation prevents premature finalization.
- rationalizer — keep the single-scope explanation — applied — it distinguishes task fan-out from recursive calls.
- rationalizer — keep reduction order and apparent-size exception — applied — maintainers need to know deduplication precedes aggregation and is mode-dependent.
- rationalizer — keep the pre-deduplication sort reason — applied — parallel completion otherwise hides why survivor selection needs a stable sequence.
- rationalizer — keep the file-time branch meaning — applied — `Node::size` is overloaded and the maximum reduction is project-specific.
- rationalizer — keep the additive branch meaning — applied — it gives the contrasting byte/file-count interpretation at the decision point.
- rationalizer — keep the inode/path tie-break reason — applied — it explains deterministic traversal of equal identities.
- rationalizer — cut the `None`-versus-`Some` sort narration — applied — the match arms already state it and the maintainer cannot act on a duplicate sentence.
- rationalizer — keep relative/absolute ignore scope — applied — exact versus subtree matching is otherwise easy to infer incorrectly.
- rationalizer — keep ignore canonicalization behavior — applied — symlink aliases and failure fallback affect whether a path is excluded.
- rationalizer — keep the empty-regex fast-path reason — applied — without it the guard looks redundant.
- rationalizer — keep retry scope and rollback invariant — applied — it explains why interrupted reads can restart safely.
- rationalizer — keep eager listing materialization — applied — collecting before mutation is the structural reason retry needs no rollback.
- rationalizer — keep deferred-error explanation — applied — it prevents discarded attempts from leaving phantom errors.
- rationalizer — keep the commit/capacity/batch explanation — applied — these choices are the core performance and retry boundary.
- rationalizer — cut “Return file nodes” — applied — it was both incomplete and a restatement of the return flow.
- rationalizer — keep ignored-versus-traversable behavior — applied — it defines which entries vanish and which publish asynchronously.
- rationalizer — keep the pre-spawn increment warning — applied — moving it creates the exact fast-child race the reader must avoid.
- rationalizer — keep `finalize_chain`’s purpose — applied — the function’s iterative upward propagation is not evident from its signature.
- rationalizer — keep the meaning of `node_to_push` — applied — its loop-carried role is not expressed by the type.
- rationalizer — cut the duplicated lock argument in the function preface — applied — the edit-point comment retains the boundary without making the reader process it twice.
- rationalizer — keep the nonzero handoff and sentinel stop — applied — these are the two exits that determine which task finalizes.
- rationalizer — keep the critical-section warning — applied — the child vector and zero transition must remain synchronized.
- rationalizer — keep the relaxed-ordering reason — applied — the mutex publishes node data while the atomic only selects the last task.
- rationalizer — keep the diagnostic-counter warning — applied — the `999` branch otherwise looks like it controls retry when it does not.
- rationalizer — cut the first-identity test narration — applied — the assertion and test name already show it.
- rationalizer — cut the duplicate-identity test narration — applied — the assertion already shows removal.
- rationalizer — keep the apparent-size test intent — applied — it protects the mode-specific bypass of identity deduplication.
- rationalizer — keep the macOS exclusion reason — applied — the platform-specific ignore needs its environmental explanation.
- rationalizer — keep the deep-tree phase boundary — applied — the fixture covers flat discovery while the later pass remains recursive.
- rationalizer — cut the deep-tree arithmetic narration — applied — the assertion states the node count and the removed child claim was false for the leaf.
- rationalizer — keep the wide-tree intent — applied — the fixture exists to protect parallel leaf collection and its batched merge.
- rationalizer — cut the missing-root narration — applied — the test name and assertion already provide the behavior.
- rationalizer — cut the permission-error narration — applied — the test name and assertion already provide the behavior.
- rationalizer — keep the mode-000 probe explanation — applied — some environments cannot produce the error the test needs.
- rationalizer — keep the permission restoration reason — applied — cleanup requires the directory to become removable again.
- form — module summary lacked the counting mechanism — applied — the opening now states one own-task obligation, one per child task, and zero-triggered finalization.
- form — accounting fields hid the meanings of `Node::size` — applied — field docs now identify apparent bytes, file-count accounting, and maximum aggregation.
- form — public `walk_it` lacked hover-visible orientation — applied — it now documents the obligation invariant at the entry point.
- form — `walk_dir` lacked a function frame — applied — a short doc comment now gives scan, spawn, and own-obligation roles before retry detail.
- form — `finalize_chain` repeated its lock argument — applied — the preface now describes flow while the body comment carries only the atomic/vector boundary.
- form — item contracts used plain comments invisible to hover — applied — contracts on `PendingDir`, its counter, and the principal functions are now doc comments; local reasons remain plain comments.
- terms — “scan sentinel” collided with the outer sentinel — applied — the count is now the root task’s obligation.
- terms — “child” at capacity reservation meant a resulting node — applied — that comment now says each entry contributes at most one `Node`.
- terms — “Count the child” encouraged the wrong counter model — applied — the comment now records the child task’s obligation.
- terms — “child order” competed with Rust ordering terms — applied — the comment now says child sequence.
- terms — metaphorical “owns” appeared in ownership-heavy code — applied — zero now triggers finalization and `walk_dir` decides retry.
- terms — the dummy parent had three names — applied — comments consistently call `outer` the sentinel.
- terms — the counter unit alternated between completions and obligations — applied — it is now “obligation” throughout the protocol.
- terms — the zero-observing task had three names — applied — the atomic now elects the last task.
- terms — “scan” and “attempt” were proposed as one term — declined — an attempt is deliberately the discardable `read_dir` result, while the scan includes processing and finalization; merging them would blur the retry boundary.
- sentences — module invariant stacked two mismatched completion clauses — applied — the opening now separates obligation counting, zero transition, and upward publication.
- sentences — FxHash sentence broke around tuple jargon — applied — it now says fixed-width inode/device numbers in one pass.
- sentences — sentinel sentence packed landing, stopping, and prevention together — applied — it is now three short sentences.
- sentences — ignore sentence used one verb for exact and subtree matching — applied — the two match modes now have separate clauses.
- sentences — symlink-alias modifier was hard to attach — applied — canonicalization and failure fallback are now stated directly.
- sentences — pre-spawn warning used two opposing “before” clauses — applied — obligation recording and the spawn-first failure are now separate sentences.
- sentences — finalize preface’s lock sentence caused a garden path — applied — the duplicated sentence was cut and the body states the boundary directly.
- sentences — critical-section list mixed grammatical forms — applied — the body now uses parallel nouns: publication, decrement, and `take`.
- Q1 — fresh reader concluded interrupted reads retry indefinitely — applied — the retry-only sentence and diagnostic-only counter note remain explicit.
- Q2 — fresh reader identified zero-transition finalization — applied — the field and `finalize_chain` docs still state which task finalizes and how the sentinel differs.
- Q3 — fresh reader identified one batched publication — applied — the commit-point comment still states that one `extend` publishes the leaf batch.

Owner questions:

1. Should repeated `Interrupted` reads actually stop after 999 and skip the directory? The code currently prints “skipping” but continues retrying.
2. Should `clean_inodes` become iterative, or should the `--stack-size` deprecation message be narrowed? Directory discovery is flat, but the post-pass still recurses.
