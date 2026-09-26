<!-- writer-fix-notes; 3.2 min; 7337626 tokens; exit 0 -->

Codex Sol W1: complete — 6 findings applied, 3 declined.

Fixed text: [03-fixed.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/03-fixed.rs>). Ledger: [03-fixes.md](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/03-fixes.md>).

- truth — module docs treated the sentinel like every other `PendingDir` — applied — the sentinel now has its distinct root obligation, while only non-sentinel entries count their own scheduled call and child calls.
- truth — module docs said the directory algorithm made no recursive calls — applied — the call graph is recursive, so the comment now distinguishes scheduled descendant calls from inline calls.
- truth — `walk_it` said it returned every built root tree — applied — a built root can be removed by the post-pass, so the comment now promises only retained trees.
- cold-astra — leaf collection sounded as though mixed directory work never locked `pending` — applied — the comment now names `pending.children`, limits the lock-free claim to each leaf, and says directory tasks may publish separately.
- cold-astra — ignore canonicalization could not be verified from this file alone — declined — the maintainer’s world is the repository, and `main` plus `canonicalize_absolute_path` establish this prerequisite needed to understand subtree matching.
- cold-astra — the macOS path-limit claim could not be verified from this file alone — declined — the platform-specific test exclusion and its 500-level fixture need a local reason or the ignored test becomes unexplained.
- cold-sol — “real entry” was ambiguous — applied — “non-sentinel entry” names the exact distinction used by the counter and finalizer.
- cold-sol — `Operator` and `WalkData` lacked overview documentation — applied — both are public configuration types a maintainer may reach directly, so each now has a short role comment.
- cold-sol — the `TempDir` cleanup comment was low-value — declined — restoring permissions after the walk does not affect the assertion, so the comment prevents that necessary cleanup step from looking accidental.
