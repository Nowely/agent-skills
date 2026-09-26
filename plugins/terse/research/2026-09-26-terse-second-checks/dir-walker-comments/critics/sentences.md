<!-- sentences; 20.5 min; 12 tool uses -->

Reviewed `01-draft.rs` (all comments/doc comments — the only prose in a .rs file) against writing-rules.md, curse-of-knowledge.md, and the pleasant-read line in rules.md ("sentences taken in at one reading"). Checked every comment sentence; word-counted the long ones via script to avoid eyeballing. 8 sentences force a reread; no sentence carries nothing, so no "cut" calls.

1. **Lines 3–5** (module doc): "Completed subtrees then join upward through [`PendingDir`], so a directory is built only after its own listing is complete and every descendant has finished." — 24 words, two conditions stacked under one "only after" with mismatched predicates ("is complete" / "has finished").
   Plainer: "Completed subtrees join upward through PendingDir. A directory is built only once its own listing and all its descendants are done."

2. **Lines 77–78**: "FxHash is confined to fixed-width `(inode, device)` metadata keys; this set never hashes paths or other variable-length user input." — a tuple-type fragment `(inode, device)` sits inside the noun phrase ("fixed-width ___ metadata keys"), breaking it mid-parse.
   Plainer: "FxHash only ever sees fixed-width inode/device numbers here, never a path or other variable-length input a user controls."

3. **Lines 91–93**: "The finished root is pushed into `outer.children`; `parent: None` stops propagation before the empty outer path can become a Node." — 20 words packing three facts (where the root lands, what halts propagation, what that prevents) into one semicolon+"before" sentence.
   Plainer: "The finished root ends up in outer's children list. Because outer has no parent, propagation stops there, and the empty outer path never becomes a Node itself."

4. **Line 194**: "Match relative ignores exactly and absolute ignores as subtree roots." — zeugma: one verb ("Match") governs two objects with two different complement types ("exactly" vs. "as subtree roots"), so the split isn't clear until the end of the sentence.
   Plainer: "A relative ignore must match exactly; an absolute ignore matches anything under it."

5. **Lines 200–202**: "Canonicalizing the candidate lets aliases through symlinks compare against the same subtree root; a failed canonicalization cannot match an absolute root." — "aliases through symlinks compare" is a misplaced-modifier trap: "through symlinks" first reads as modifying "compare" (compare *through symlinks*) rather than "aliases" (aliases *arising* through symlinks).
   Plainer: "Canonicalizing the candidate resolves any symlink alias to the same subtree root, so it can still match. A candidate whose canonicalization fails cannot match an absolute root."

6. **Lines 356–357**: "Count the child before making it runnable: otherwise it could finish before the parent records the obligation." — two "before"s ordering the same two events from opposite directions, in one clause.
   Plainer: "The count must go up before the child task starts running. Spawn first, and the child could finish before that count is even recorded."

7. **Lines 393–395**: "Publishing it and decrementing its parent's count under one lock ensures the transition to zero observes that child." — garden path: "under one lock" first reads as attached to "its parent's count" (a locked counter) rather than to the whole compound action.
   Plainer: "Publishing the child and decrementing the parent's count happen under the same lock, so whichever task sees the count reach zero also sees that child already published."

8. **Lines 404–405**: "Keep publish, decrement, and the last task's `take` in one critical section." — parallelism mismatch: the first two list items are bare verb-nouns, the third is a possessive noun phrase, so the reader has to re-parse to see whether "the last task's" scopes over all three or just the last.
   Plainer: "Do the publish, the decrement, and the last task's `take` all inside one critical section."

Everything else in the file's comments (module doc's "no recursive calls" contrast, the `finalize_chain` doc's three-item list, the atomic/mutex sentences, test comments, etc.) reads in one pass on inspection — checked but not flagged.

Constraints honored: read-only, no writes, no `cd`, nothing read outside the named target and reference files.
