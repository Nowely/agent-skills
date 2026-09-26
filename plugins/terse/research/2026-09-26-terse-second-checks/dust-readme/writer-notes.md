<!-- writer-notes; 7.0 min; 2000112 tokens; exit 0 -->

Codex Sol W1: complete — I wrote an install-first README that shows dust’s output, gets the reader to `dust` immediately, and keeps advanced controls compact.

Artifacts: [context.md](</var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260926-142621-dust-readme/context.md>) · [budgets.json](</var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260926-142621-dust-readme/budgets.json>) · [01-draft.md](</var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260926-142621-dust-readme/01-draft.md>)

## Context

- **What it is:** A Rust command-line disk-usage viewer. It resembles `du`, but selects the largest entries and presents them as a readable tree with sizes, bars, and percentages. Unlike interactive disk browsers, its primary interface is a report printed directly in the terminal.
- **Reader and situation:** Someone at a terminal whose disk or directory has grown unexpectedly. They are deciding whether dust will answer “what is taking the space?” and want to install it and see the answer now.
- **What they need first:** Recognition in familiar terms, the real interface, an installation command for their system, and the knowledge that the first command is simply `dust`.
- **What makes it desirable:** A useful overview without a `du | sort | head` pipeline or mandatory flags. The report retains directory context, adapts to the terminal, and can later be narrowed by count, depth, type, size, path, or regular expression.
- **Invisible prerequisites:** The shell installer needs `curl` and an archive tool; package-manager routes assume their manager is installed. Configuration is optional. Disk usage means allocated space unless `--apparent-size` is selected, and symbolic links are followed only when requested.
- **One thought:** Install `dust`, type `dust`, and see where the space went.

## Plan

| Part | What it gives the reader | Device | Budget |
|---|---|---|---:|
| Opening | Immediate recognition, purpose, and proof of the interface | `du + Rust` line, compact value paragraph, bundled demo | ~100 words |
| `## Install` | The shortest route to a first run, plus familiar alternatives | Copyable installer and package-manager table | 260 |
| `## Run it` | The first command and an explanation of its result | One command, output description, multipath syntax | 150 |
| `## Choose what to see` | The controls most likely to improve the first report | Task-to-command table and one combined example | 190 |
| `## Configure defaults` | A way to make repeated use fit the reader | Config locations, small TOML example, sample link | 130 |
| `## Alternatives` | Nearby tools without an unsupported comparison | Short linked line | 55 |
| `## License` | Legal disposition | One linked sentence | 25 |

## Evidence notes

- **Identity and purpose:** `Cargo.toml` names `du-dust`, describes it as “A more intuitive version of du,” and declares the `dust` binary (lines 1–4, 20–22). `src/cli.rs` repeats “Like du but more intuitive” (line 8). The retained purpose comes from `00-original.md` lines 6–10.
- **Rust implementation:** Shown by `Cargo.toml`, the Rust source tree, and Cargo dependencies.
- **Largest-entry tree:** `src/main.rs` lines 276–294 build the displayed tree through `get_biggest`; `src/filter.rs` lines 67–96 select entries from a size-ordered heap and rebuild their hierarchy.
- **Sizes, bars, percentages, and hierarchy:** `src/display.rs` lines 44–125 generate proportional nested bars; lines 335–394 format names, human-readable sizes, percentages, and screen-reader output. The bundled `media/demo.gif` and `00-original.md` lines 19–29 show and describe the same interface.
- **Current-directory and terminal defaults:** `src/main.rs` lines 85–100 derive height and width from the terminal; lines 130–169 choose `.` when no path is supplied and derive the default line count from terminal height.
- **Installer platforms and latest release:** `install.sh` lines 29–35 detect Linux, macOS, MINGW, MSYS, and Cygwin; lines 51–70 obtain the latest release; lines 111–150 select, download, and extract its archive. The displayed installer command is retained from `00-original.md` lines 34–37.
- **Package-manager commands and Snap limitation:** Retained from the repository’s existing documentation, `00-original.md` lines 41–91. Cargo package identity is independently confirmed by `Cargo.toml` lines 1–3. These routes were not externally registry-checked.
- **Multiple paths:** `src/cli.rs` lines 156–158 accepts multiple path arguments; `src/main.rs` lines 130–142 collects them; `src/filter.rs` lines 35–48 creates a combined total when more than one root is supplied.
- **Command table:** The flags are defined in `src/cli.rs`: depth and entry count at lines 12–26; filesystem and apparent-size controls at lines 42–53; minimum size and screen-reader mode at lines 79–86; hidden entries at lines 96–99; regex filtering at lines 112–115; directories, files, and JSON at lines 133–162.
- **Minimum-size boundary:** `src/filter.rs` lines 116–123 includes only entries whose size is greater than the configured minimum, supporting “exclude at or below.”
- **JSON output:** `src/main.rs` lines 329–337 serializes the selected directory tree as JSON.
- **Config keys and precedence:** `src/config.rs` lines 16–44 define the supported keys; lines 260–302 define the lookup order and optional fallback. `config/config.toml` demonstrates full paths, apparent size, colors, bars, units, entry limits, filesystem limits, and collapsed directories. `src/cli.rs` lines 20–22 defines `--config`.
- **Alternatives:** Retained from `00-original.md` lines 158–165 without carrying over its unsupported comparative claims.
- **License:** `Cargo.toml` line 15 declares `Apache-2.0`; the repository’s `LICENSE` contains the Apache License 2.0 text.

Validation completed: `context.md` exists, `budgets.json` parsed successfully, and all 6 of 6 `##` headings are represented exactly. The dust repository remained clean. I did not run dust or its tests, as instructed.

## Question for the owner

None.
