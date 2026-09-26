<!-- genre; 2.9 min; 272932 tokens; exit 0 -->

Codex Sol G1: complete — 8 files fetched.

| Place from top | What the genre puts there | Frequency | Formatting observed |
|---|---|---:|---|
| Module documentation before imports | Purpose, headline capabilities, first example, then traversal architecture and ordering guarantees. | 2 of 8: [jwalk](https://raw.githubusercontent.com/Byron/jwalk/main/src/lib.rs), [walkdir](https://raw.githubusercontent.com/BurntSushi/walkdir/master/src/lib.rs) | Headings 2/8; fenced examples 2/8; lists 1/8; bold lead-ins 1/8; tables 0/8. `//!` or `/*! … */`. |
| Documentation immediately above items | One-line role first; then ownership, errors, ordering, invariants, resource limits, or field meaning. | 6 of 8: [ripgrep ignore](https://raw.githubusercontent.com/BurntSushi/ripgrep/master/crates/ignore/src/walk.rs), [fd](https://raw.githubusercontent.com/sharkdp/fd/master/src/walk.rs), [jwalk](https://raw.githubusercontent.com/Byron/jwalk/main/src/lib.rs), [walkdir](https://raw.githubusercontent.com/BurntSushi/walkdir/master/src/lib.rs), [dua](https://raw.githubusercontent.com/Byron/dua-cli/main/src/traverse.rs), [eza](https://raw.githubusercontent.com/eza-community/eza/main/src/fs/dir.rs) | Mostly short `///` paragraphs with inline code and links. Headings 2/8; fenced examples 1/8; lists 1/8; bold opening term 1/8; tables 0/8. |
| Comments inside function bodies | Local reasons rather than narration: why a branch is exceptional, why state is dropped or retained, channel-closure meaning, batching/backpressure, descriptor limits, and traversal-order invariants. | 7 of 8; absent only from fetched [jwalk core module](https://raw.githubusercontent.com/Byron/jwalk/main/src/core/mod.rs). [tokei](https://raw.githubusercontent.com/XAMPPRocky/tokei/master/src/utils/fs.rs) is the otherwise-undocumented example. | Plain `//`, normally one to four lines immediately before the relevant statement. Headings, bold lead-ins, tables, fences and Markdown lists: 0/8. |

Best examples:

1. [jwalk `lib.rs`](https://raw.githubusercontent.com/Byron/jwalk/main/src/lib.rs) — Its first 150 comment words establish the contract immediately: parallel execution, sorted streaming, and customization. They then give a minimal runnable example and begin a larger example organized around sort/filter/skip/state. The reader learns both the promise and the extension point before seeing implementation details.

2. [fd `walk.rs`](https://raw.githubusercontent.com/sharkdp/fd/master/src/walk.rs) — Its first 150 comment words introduce the receiver’s buffering-versus-streaming states, worker result types, the deliberate large-enum tradeoff, batching, and backpressure. They function as a compact map of the thread-to-output pipeline and explain the non-obvious performance choices.

3. [dua `traverse.rs`](https://raw.githubusercontent.com/Byron/dua-cli/main/src/traverse.rs) — Its first 150 comment words define stable tree indices and entry metadata, then explain the compact arena node: shared name storage, 32-bit links, packed flags, the 64-byte target, and free-list reuse. They give maintainers the memory model and its motivation before traversal machinery appears.

Saved under `$TMPDIR/terse/runs/20260926-142621-dust-dir-walker-comments/fetched/`.

Failed-fetch diagnostics: `curl -fL --retry 2 --connect-timeout 15 -o …/jwalk-walk_dir.rs https://raw.githubusercontent.com/Byron/jwalk/main/src/core/walk_dir.rs` — started; exit 56; `curl: (56) The requested URL returned error: 404`. `…/broot-file_sum.rs …/Canop/broot/main/src/file_sum/tree.rs` — started; exit 56; same diagnostic. `…/broot-tree.rs …/Canop/broot/main/src/tree.rs` — started; exit 56; same diagnostic.
