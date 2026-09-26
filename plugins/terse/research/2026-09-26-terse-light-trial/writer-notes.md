<!-- Codex Sol W1, writer; 5.5 min; 996670 tokens; thread 01a0dd2d-c44b-77b3-becb-167b124c5005 -->

Codex Sol W1: complete — I wrote a concise, mission-led README that takes the reader from installation to their first disk-usage view.

Files: [budgets.json](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260926-130310-dust-readme/budgets.json) and [01-draft.md](/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse/runs/20260926-130310-dust-readme/01-draft.md).

## Plan

- Opening — 120 words: establish the disk-space problem and Dust’s advantages through the project’s own purpose statement and three bold-led benefits.
- Quick start — 100 words: get from installation to visible output through two copyable commands and a description of what returns.
- Useful options — 300 words: help readers reshape the view through a three-column option table and the help command.
- How it works — 120 words: explain the scanning model and exactly where progress, errors, tree output, and JSON go.

## Evidence notes

All behavioral claims reached code-reading evidence level 2; the project was not built, installed, or run.

- The mission and “more intuitive `du`” description: `Cargo.toml:2–3`, `Cargo.toml:100–103`.
- Largest files and directories arranged as a sorted tree: `src/cli.rs:156–158`, `src/filter.rs:23–55`, `src/filter.rs:75–95`, `src/filter.rs:160–166`.
- No path means the current directory: `src/main.rs:130–142`.
- Default output length follows terminal height: `src/main.rs:85–90`, `src/main.rs:160–168`.
- Tree branches, sizes, and percentage bars: `src/display.rs:44–77`, `src/display.rs:93–125`, `src/display.rs:223–254`.
- Depth, path, file-type, size, and regex controls: `src/cli.rs:12–14`, `32–40`, `79–81`, `101–119`.
- The installer fetches and installs the latest release: `install.sh:51–70`, `install.sh:111–186`.
- `dust PATH...` accepts one or more input files or directories: `src/cli.rs:156–158`, `src/main.rs:135–142`.
- `-n` limits selection to the largest entries: `src/cli.rs:24–26`, `src/filter.rs:75–90`.
- `-d` limits displayed depth: `src/cli.rs:12–14`, `src/filter.rs:99–109`.
- `-F` and `-D` select file or directory views: `src/cli.rs:133–144`, `src/filter.rs:79–96`, `src/filter.rs:124–130`.
- `-e` and `-v` apply inclusion and exclusion regexes: `src/cli.rs:101–115`, `src/main.rs:146–147`.
- `-X` ignores a path: `src/cli.rs:32–34`, `src/dir_walker.rs:190–213`.
- `-z` hides child entries at or below the threshold: `src/cli.rs:79–81`, `src/filter.rs:116–123`.
- `-x` restricts the walk to the starting filesystem: `src/cli.rs:46–49`, `src/main.rs:205–212`.
- `-s` requests file length instead of allocated blocks: `src/cli.rs:51–53`, `src/platform.rs:24–67`.
- `-f` counts files: `src/cli.rs:92–94`, `src/node.rs:45–80`.
- `-p` retains full paths: `src/cli.rs:28–30`, `src/main.rs:284–287`.
- `-R` removes bars and substitutes depth: `src/cli.rs:83–86`, `src/display.rs:93–96`.
- `-j` serializes the selected tree as JSON: `src/cli.rs:160–162`, `src/main.rs:327–338`.
- `--config FILE` loads a selected configuration: `src/cli.rs:20–22`, `src/config.rs:268–281`.
- `--help` is generated from the command definition: `src/cli.rs:8–10`.
- Directory traversal reads entries and metadata: `src/dir_walker.rs:275–290`, `src/node.rs:49–54`.
- Directory totals accumulate their children: `src/dir_walker.rs:150–169`.
- Unix allocated-space calculation: `src/platform.rs:24–67`.
- Duplicate inode/device pairs are removed unless apparent size is selected: `src/dir_walker.rs:133–148`.
- Progress goes to standard error: `src/progress.rs:119–150`.
- Scan errors go to standard error: `src/main.rs:361–394`.
- Tree and JSON output go to standard output: `src/display.rs:223–254`, `src/main.rs:329–358`.
- The build-status badge corresponds to the repository workflow: `.github/workflows/CICD.yml:1–10`.

The curse-of-knowledge pass identified four invisible prerequisites: what an omitted path means, what the first command returns, how another path is supplied, and where output goes. Those are framed at their first decision points. `curl` and `sh` remain visible in the installation command rather than receiving a separate prerequisites section.

Validation confirmed that `budgets.json` parses and names all three `##` headings. The repository worktree remained unchanged.

One validation command started but exited 1 before its checks: combined `nl`/Python validation command — diagnostic: `zsh:4: parse error near ')'`. The simplified replacement validation succeeded.

## Rules set aside

None.

Rules that did not apply:

- Rule 9, update instructions: the code exposes no update command, so no update block was invented.
- The writing rule about retaining dated measurements: the README contains no measurements or dated results.
- Curse-of-knowledge step 3 had no observed reader stall to report because no reader session was supplied; the draft instead addresses the first-use failure point stated by the owner without inventing evidence.
