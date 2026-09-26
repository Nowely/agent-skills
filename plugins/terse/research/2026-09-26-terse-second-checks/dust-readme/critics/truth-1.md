<!-- truth-1; 2.9 min; 229462 tokens; exit 0 -->

Codex Sol T1: complete — 4 sentences found refuted or overstated.

- Line 7 — Overstated: “Human-readable sizes, proportional bars, and percentages keep the large entries visible without a `sort` or `head` pipeline.”
  Evidence: `src/display.rs:154-160` removes bars when the terminal lacks room; `src/display.rs:368-384` then removes percentages too.
  Plainest true sentence: “`dust` shows human-readable sizes and selects the largest entries itself, without a `sort` or `head` pipeline; bars and percentages appear when the terminal is wide enough.”

- Line 15 — Overstated: “The shell installer detects Linux, macOS, and MINGW, MSYS, or Cygwin on Windows, then downloads the latest release.”
  Evidence: `install.sh:31-47` recognizes those systems but rejects unlisted architectures; `install.sh:74-103` supports only specific OS–architecture combinations before reaching the download.
  Plainest true sentence: “The shell installer detects Linux, macOS, and MINGW, MSYS, or Cygwin on Windows; on a supported architecture, it downloads the latest release archive.”

- Line 33 — Overstated: “The Snap package can access files only under `/home`.”
  Evidence: `README.md:57-61` repeats this guarantee, but `dust/` contains no Snap manifest or packaging code with which to check every access case. The guarantee is unconfirmed at evidence level 2.
  Plainest true sentence: “The project warns that the Snap package may not be able to read files outside `/home`.”

- Line 43 — Overstated: “A bar and percentage compare each entry with the total, while lighter bar segments preserve its parent-directory context.”
  Evidence: `src/display.rs:154-160` sets the bar length to zero when there is insufficient width, and `src/display.rs:368-384` omits both the bar and percentage in that case.
  Plainest true sentence: “With bars enabled and enough terminal width, each entry’s bar and percentage compare it with the total, and lighter segments show its parent-directory context.”
