<!-- terms; 11.9 min; 5 tool uses -->

Read 01-draft.rs as the reader profiled in context.md (dust maintainer; knows Arc/Mutex/atomics/Rayon; does not yet hold the pending/finalize_chain protocol; primed to mistake `pending` for a child-count rather than an outstanding-obligations count; told to learn `Node::size`, `PendingDir::pending`, "the outer sentinel," and the two phases).

**A. Words this reader would parse differently from what the text means**

1. Line 107, `// The scan sentinel prevents children from finalizing this` — context.md primes "sentinel" to mean the dummy `outer` parent ("the outer sentinel," "sentinel nodes," lines 13/15). This "sentinel" is unrelated: it's `root`'s own `pending: AtomicUsize::new(1)` self-scan unit (line 109), nothing to do with `outer`. Reader will hunt for a link to the outer node that isn't there. Word to use: drop "sentinel" — "The self-scan obligation prevents children from finalizing this directory…".

2. Line 307-308, `// Commit point. Each entry contributes at most one child, so the` — "child" here means any resulting Node (file or directory) going into `pending.children`'s capacity reservation. Elsewhere (63-64, 70-71, 356-358) "child"/"child directory" names specifically a spawned subdirectory that increments `pending`. This is the reader's named failure mode (context.md line 13: conflating `pending`'s count with a count of children) landing on the one line that uses "child" in the other sense. Word to use: "Node" — "Each entry contributes at most one Node."

3. Line 356, `// Count the child before making it runnable: otherwise it could finish` — describes `pending.fetch_add(1, …)`, i.e. recording one obligation before spawn. "Count the child" literally reads as tallying children — the exact wrong model context.md (line 13) names. Word to use: rebuild around "obligation" — "Record the child's obligation before making it runnable."

4. Line 144, `// Parallel completion does not define child order. Sorting before the` — sits in the same function as `sort_by_inode`, which returns `std::cmp::Ordering` (line 147/175); the file separately aliases the unrelated atomic `Ordering` to `AtomicOrdering` (line 14) specifically to keep the two apart, so "Ordering" is already known-overloaded here. A third colloquial "order" risks a momentary cross-read. Word to use: "sequence" — "does not define child sequence."

5. (lower confidence) Lines 71 and 451, `// … The transition to zero owns finalization.` / `// … \`walk_dir\` owns retry policy.` — idiomatic for "is responsible for," but this reader reasons in literal Rust ownership all day (Arc/Mutex); "owns" applied to an event/policy rather than a value is a stretch. Word to use: "triggers" (71); "alone retries"/"is responsible for" (451).

**B. Internal names used where the reader already has a word**

6. Lines 90, 93, 400 — the dummy root-parent object is "a synthetic parent" (90: `// Give the root a synthetic parent so`), bare "outer" (93: `// outer path can become a Node.`), and "the synthetic outer node" (400: `// synthetic outer node; by then its children contain`). Three phrasings, one object — and none of them is the term the reader is explicitly told to learn: "the outer sentinel" / "sentinel nodes" (context.md lines 13, 15). Word to use: "the sentinel," consistently at 90/93/400.

**C. Terms used twice under two names**

7. Line 70-71 vs. 356-357/391 — the unit `pending` counts is "Outstanding completions" at its field doc (`// Outstanding completions: one for this directory's scan, plus one for`) but "the obligation"/"one obligation" everywhere it's actually used (356-357: `before the parent records the obligation`; 391: `Complete one obligation, then iteratively propagate`) — matching context.md line 9's "the last obligation." Same referent, two names; "obligation" is the majority usage (3 occurrences across draft+context vs. 2 for "completions"). Word to use: "obligation" — reword line 70 to "Outstanding obligations."

8. Lines 396, 404-405, 412-413 — the one task whose decrement hits zero is "the task that sees zero" (396), "the last task" (405: `the last task's \`take\` in one critical`), and "the last completer" (412-413: `the atomic only elects the last / completer`) — three names within one doc-comment/function. "Task" is the reader's own known Rayon vocabulary and is already used twice. Word to use: "task" — reword 412-413 to "the atomic only elects the last task."

9. (lower confidence) Lines 70-71/107 vs. 277-310 — "scan" (matching context.md's own "a count for its own scan," line 9) names the same read_dir-and-process activity that walk_dir's retry-loop comments call "a complete listing attempt" (278), "the attempt" (291-292, 297), "an interrupted read" (277). Same operation, two vocabularies (accounting-level vs. mechanical-level). Word to use: "scan" throughout, e.g. line 278 → "until this directory's scan is complete."

Checked and found clean, no finding: `Node::size`'s two mode-specific meanings (lines 154, 162) are consistently phrased ("carries…") and match context.md's description exactly. The module doc's two-phase framing (lines 1-7) names each phase distinctly without collision.

Scope respected: only read context.md and 01-draft.rs inside the named run directory; no writes, no `cd`, no other run or restricted path touched.
