<!-- sentences; 7.0 min; 5 tool uses -->

8 sentences in `01-draft.md` need a second reading. Grounds: writing-rules.md ("no sentence that carries nothing"; "define a term where the reader first needs it, not before"), curse-of-knowledge.md (invisible prerequisites — the melody only the writer hears), and rules.md's pleasant-read requirement ("sentences taken in at one reading... no detail the reader does not need where they are... a hard one is said more simply, or cut").

**Line 7** — "Human-readable sizes, proportional bars, and percentages keep the large entries visible without a `sort` or `head` pipeline."
A three-item subject list ends in "a `sort` or `head` pipeline" — reads as one pipeline built from either command, or two separate pipelines; the reader backtracks to resolve which.
→ "Human-readable sizes, proportional bars, and percentages make the large entries stand out, without needing a `sort | head` pipeline."

**Line 15** — "The shell installer detects Linux, macOS, and MINGW, MSYS, or Cygwin on Windows, then downloads the latest release:"
"Linux, macOS, and MINGW" first reads as three parallel operating systems; only "on Windows" at the end reveals MINGW/MSYS/Cygwin are Windows variants, forcing a re-read of the list.
→ "The shell installer detects your OS — Linux, macOS, or Windows (via MINGW, MSYS, or Cygwin) — then downloads the latest release:"

**Line 43** — "A bar and percentage compare each entry with the total, while lighter bar segments preserve its parent-directory context."
"its" has two possible antecedents (entry or total), and "parent-directory context" is a compressed, never-defined term — exactly the curse-of-knowledge gap between what the writer sees in the tree and what a first-time reader sees.
→ "A bar and percentage show each entry's share of the total; lighter segments show how it fits within its parent directory."

**Line 45** — "Pass one or more paths to inspect somewhere else or compare several roots:"
"one or more" doesn't clearly split across the two purposes that follow; the reader has to guess which count goes with which clause. Weaker case than the others — most readers likely parse it fine on the first pass.
→ "Pass a path to inspect a different directory, or several to compare multiple roots at once:"

**Line 69** — "Combine these controls as needed: `dust -D -d 2 -n 50` shows up to 50 directories within two levels."
Three flags land before their effects are named; the reader holds all three, then reverse-maps each onto a fragment of "up to 50 directories within two levels."
→ "These controls combine: to see up to 50 directories within two levels, run `dust -D -d 2 -n 50`."

**Line 73** — "`dust` first checks `~/.dust.toml`, then `$XDG_CONFIG_HOME/dust/config.toml` (or `~/.config/dust/config.toml` when `XDG_CONFIG_HOME` is not set)."
Three paths plus a fallback condition nested in a parenthetical — the reader holds two lookups, then unpacks a third one inside parentheses.
→ "`dust` checks `~/.dust.toml` first, then `$XDG_CONFIG_HOME/dust/config.toml`; if that variable isn't set, it checks `~/.config/dust/config.toml` instead."

**Line 83** — "See the [sample config](config/config.toml) for the available keys, including full paths, apparent size, colors, bars, output units, and collapsed directories."
A six-item list is bolted onto a pointer sentence; "collapsed directories" appears nowhere else in the document and is never explained, and the reader can't act on any item without opening the linked file anyway — detail the reader doesn't need where they are.
→ "See the [sample config](config/config.toml) for the available keys."

**Line 87** — "Other disk-usage tools include [ncdu](https://dev.yorhel.nl/ncdu), [dua](https://github.com/Byron/dua-cli), [dutree](https://github.com/nachoparker/dutree), [pdu](https://github.com/KSXGitHub/parallel-disk-usage), and `du -d 1 -h | sort -h`."
The raw shell pipeline reads as a fifth tool name until its flags and pipe force a re-parse. Weaker case — an Alternatives list is typically scanned, not read as prose.
→ "Other disk-usage tools include [ncdu](https://dev.yorhel.nl/ncdu), [dua](https://github.com/Byron/dua-cli), [dutree](https://github.com/nachoparker/dutree), and [pdu](https://github.com/KSXGitHub/parallel-disk-usage) — or the classic `du -d 1 -h | sort -h`."

Not flagged, checked and cleared: the opening pitch (line 5, "`du` + Rust = `dust`" — matches the owner's own "very important... for marketing" note in rules.md, not a curse-of-knowledge problem), the Snap/`/home` constraint (line 33, short and single-clause), and the "Remove bars and add a depth column for screen readers" table row (line 66) — considered but the Task→Command table pattern doesn't require per-flag mapping, so no reread is proven.

Compliance: read only the four files named in the brief (the draft plus writing-rules.md, curse-of-knowledge.md, rules.md); nothing under `research/`, no other run directory, no writes, no `cd`.
