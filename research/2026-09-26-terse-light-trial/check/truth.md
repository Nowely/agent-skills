<!-- truth; 4.4 min; 628716 tokens; exit 0 -->

Codex Sol CT1: complete — 6 sentences refuted or overstated.

- Line 3, overstated: “Dust shows you where disk space is being used.” Evidence: `src/platform.rs:183-218` uses `md.len()` for ordinary Windows entries, not allocated disk space. Replace: “Dust maps entry sizes into a tree.”
- Line 5, overstated: “By default, Dust scans the current directory and sets its entry limit from the terminal height.” Evidence: `src/main.rs:85-90` substitutes a fixed fallback when terminal size is unavailable; `src/main.rs:160-167` uses an unlimited value for depth or JSON output. Replace: “Without overrides, Dust scans `.` and chooses an entry limit.”
- Line 11, overstated: “On macOS or Linux, install the latest release:” Evidence: `install.sh:41-48` rejects unsupported Linux architectures. Replace: “On macOS or Linux, run the installer:”
- Line 35, refuted: “Excludes matching files.” Evidence: `src/dir_walker.rs:248-260` excludes matching files found inside directories, but a matching positional file is retained as the root and merely given size zero by `src/node.rs:57-80`. Replace: “Filters matching files.”
- Line 38, overstated: “Limits the scan to detected starting filesystems.” Evidence: ordinary Windows directory metadata returns no device ID (`src/platform.rs:183-218`); this leaves the allowed set empty, which disables filesystem filtering (`src/dir_walker.rs:219-226`). Replace: “On Unix, limits scans to starting filesystems.”
- Line 51, overstated: “Dust writes any scan progress and errors to `stderr`.” Evidence: the interrupt handler prints “Aborting” to `stdout` and exits with status 1 (`src/main.rs:124-127`). Replace: “Progress and filesystem errors use `stderr`.”
