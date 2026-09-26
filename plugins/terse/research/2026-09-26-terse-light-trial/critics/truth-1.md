<!-- truth-1; 4.1 min; 262811 tokens; exit 0 -->

Codex Sol T1: complete — 4 overstated sentences found.

- Line 9 — Overstated, Level 2. Evidence: `src/main.rs:130-139` lets configured file sources replace `.`, while `src/main.rs:160-168` disables the terminal-height limit for depth or JSON output. Shorter true sentence: “By default, Dust scans the current directory and bases its entry limit on terminal height.”

- Line 21 — Overstated, Level 2. Evidence: plain `dust` uses `.` only after configured `files0-from` and `files-from` sources are excluded (`src/main.rs:130-139`; `src/config.rs:47-60`). Shorter true sentence: “Then run Dust:”

- Line 27, first sentence — Overstated, Level 2. Evidence: `src/display.rs:154-158` removes percentage bars when disabled or when the terminal lacks space; `src/config.rs:86-87` permits disabling them through configuration. Shorter true sentence: “Default text output shows sizes in a tree and percent bars when space permits.”

- Line 27, second sentence — Overstated, Level 2. Evidence: configured `files0-from` or `files-from` sources take precedence over positional paths (`src/main.rs:130-139`). Shorter true sentence: “With no file source, pass paths as scan roots:”
