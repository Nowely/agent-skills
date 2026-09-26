<!-- writer-notes; 9.4 min; 2417102 tokens; exit 0 -->

Codex Sol W1: complete — I wrote a concise maintainer-focused comment pass explaining dust’s walker invariants, retry boundary, aggregation, and concurrency choices without changing code.

Artifacts: [context.md](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/context.md>), [budgets.json](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/budgets.json>), and [01-draft.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/01-draft.rs>).

## Context

dust is a Rust command-line disk-usage viewer: `du` presented as a compact tree of the largest files and directories, with sizes, hierarchy, and proportional bars. Users install it through the shell installer, Cargo, package managers, or release binaries; `dust` scans the current directory, while path arguments select other roots.

`dir_walker.rs` is its collection and reduction stage. It filters entries, creates file nodes in parallel, waits for complete subtrees, then deduplicates filesystem identities and aggregates child values. It resembles a fork/join tree reduction rather than a streaming iterator.

The reader is a Rust developer maintaining dust or changing its walker. They need the local completion protocol, not explanations of Rust, Rayon, or filesystem basics. The essential thought is:

> A directory may be published only after its own listing and every descendant are complete; the unusual state, lock boundaries, and sentinel nodes preserve that rule without recursive directory discovery.

## Plan

| Part | What it gives the maintainer | Device | Budget |
|---|---|---|---:|
| File-level map | The two-phase mental model | Short module documentation | 85 |
| Completion state | Meaning of `PendingDir` and `pending` | Type- and field-adjacent comments | 75 |
| Root orchestration | Why the synthetic parent and scope exist | Comments beside their construction | 125 |
| Deduplication and aggregation | Ordering, hard-link, and overloaded-size contracts | Function and branch comments | 110 |
| Filtering | Relative/absolute ignore behavior and the fast path | Decision-point comments | 55 |
| Retry and commit boundary | Why a listing is materialized before mutation | A compact sequence around `read_dir` | 175 |
| Entry dispatch | File batching versus spawned directories | Function contract and pre-spawn warning | 90 |
| Completion propagation | The lock/counter invariant and termination cases | Invariant-first function comment | 185 |
| Error policy | Ownership of retry decisions | One local reason | 35 |
| Regression tests | What each fixture protects | Brief comments at setup or assertion | 120 |

The genre examples informed the form: jwalk’s opening contract, fd’s local reasons around concurrency and batching, and dua’s invariant-first type documentation.

## Evidence notes

- Product, installation, commands, and output are shown in [README.md](<$TMPDIR/terse-trial-dust/dust/README.md:4>), especially its install, overview, usage, hard-link, and JSON descriptions.
- Default roots, terminal-height output, `WalkData` construction, and the call from walking into filtering/display appear in [main.rs](<$TMPDIR/terse-trial-dust/dust/src/main.rs:130>).
- `Node::size` can carry bytes, file counts, or timestamps; `build_node` establishes those meanings in [node.rs](<$TMPDIR/terse-trial-dust/dust/src/node.rs:36>).
- `PendingDir`’s parent link, scan sentinel, child counter, and child store are visible in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:55>).
- The synthetic outer parent, one Rayon scope per root, and post-scope inode cleanup are in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:72>).
- Recursive inode/device deduplication, sorting before traversal, maximum timestamp aggregation, and additive byte/count aggregation are in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:133>).
- Absolute ignore paths are canonicalized when options are assembled in [main.rs](<$TMPDIR/terse-trial-dust/dust/src/main.rs:176>); candidate canonicalization and subtree matching are in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:190>).
- The regex helper performs path-to-string conversion in [utils.rs](<$TMPDIR/terse-trial-dust/dust/src/utils.rs:81>), supporting the empty-filter fast-path comment.
- Retry safety follows directly from collecting the complete `read_dir` attempt before spawning or publishing, then discarding it on `Interrupted`, in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:270>).
- File nodes return through Rayon’s collection; directories increment their parent before spawning and publish later, as shown in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:348>).
- `finalize_chain` pushes the completed child, decrements the obligation count, and takes children under the same mutex; only the zero transition builds and propagates the directory. See [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:401>).
- The error counter only records and prints; retry policy remains in `walk_dir`, as shown by `is_retryable` and `record_error` in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:457>).
- Test comments follow their fixtures and assertions: duplicate identities, apparent-size retention, deep and wide trees, missing roots, and permission failures begin in [00-original.rs](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/00-original.rs:523>).
- Genre evidence is in [genre.md](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/genre.md:5>) and the supplied [jwalk](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/fetched/jwalk-lib.rs:4>), [fd](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/fetched/fd-walk.rs:24>), and [dua](<$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/fetched/dua-traverse.rs:25>) files.

Verification:

- `context.md`, `budgets.json`, and `01-draft.rs` exist.
- `python3 -m json.tool budgets.json` exited 0.
- Comment- and blank-line-stripped original and draft both hash to `b49b5d5f85272ec8640c75aac456338809141af4ac33de20df4e5951ca87597b`.
- Repository `src/dir_walker.rs` and `00-original.rs` both hash to `0e2566070ac8c0169265a37d5b18b3358c0b91165823369757619c3b8d0c6bb9`.
- `git status --short` produced no output; the repository is unchanged.
- Tests were not run, as requested.
- Failed command record: `diff -u <(grep -vE '^[[:space:]]*//|^[[:space:]]*$' 00-original.rs) <(grep -vE '^[[:space:]]*//|^[[:space:]]*$' 01-draft.rs)` — started; exit 2; `diff: /dev/fd/11: Operation not permitted`. Streamed hashes supplied the equivalent check.

## Questions for the owner

1. Should repeated `Interrupted` reads actually stop after 999 and skip the directory? The code prints “skipping” but both retry sites continue indefinitely.
2. Should `clean_inodes` also become iterative, or should the `--stack-size` deprecation message be narrowed? Directory discovery is flat, but `clean_inodes` still recurses over the complete tree.
