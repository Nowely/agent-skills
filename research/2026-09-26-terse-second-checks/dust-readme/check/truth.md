<!-- truth; 5.3 min; 583668 tokens; exit 0 -->

Codex Sol CT1: complete — 1 sentence refuted.

Line 66 — “Use file length instead of allocated disk space”

Evidence (level 2): On Unix, `src/platform.rs:38-64` implements this distinction. On Windows, `src/platform.rs:151-164` uses `size_on_disk()` when apparent-size mode is enabled and `file_size()` otherwise; the common path at lines 203-220 returns `md.len()` regardless of the flag.

Plainest true sentence: “On Unix, `dust -s` uses file length instead of allocated disk space; on Windows, `-s` does not consistently make that switch.”
