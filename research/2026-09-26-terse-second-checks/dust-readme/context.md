# Context

## What it is

`dust` is a Rust command-line disk-usage viewer. It scans one or more paths and prints a compact tree of the largest files and directories, with human-readable sizes and proportional bars. With no path, it scans the current directory. It resembles `du`, but selects and presents the useful part of the result itself instead of leaving the reader to combine `du`, `sort`, and `head`. It also resembles terminal disk analyzers such as `dua` and `gdu`, but its primary interface is a report printed directly in the terminal rather than an interactive browser.

## Reader and situation

The reader is at a terminal because disk space has gone missing, or because a directory has grown unexpectedly. They have opened the repository page to decide whether `dust` will answer “what is taking the space?” and, if it will, to install it and get that answer now. They understand shell commands and package managers; they do not need to understand Rust, the traversal implementation, configuration internals, or the complete option set before their first run.

## What they need first

They need to recognize the job in familiar terms (`du`, made easier to read), see the actual interface, choose an installation command for their system, and learn that the first command is simply `dust`. Immediately after that, they need only the controls that change the first report in common ways: how many entries appear, how deep the tree goes, and whether to show only files or only directories.

## What makes it desirable

The payoff is a useful overview without a pipeline or mandatory flags. The report preserves directory context while drawing attention to the largest entries; its line count follows the terminal by default, and its view can be narrowed by count, depth, type, size, path, or regular expression. JSON output, a screen-reader mode, and persistent defaults let the same tool continue to fit once the first inspection becomes a repeated workflow.

## Invisible prerequisites

The quick installer assumes a shell with `curl` and the archive tool needed for the downloaded release. Package-manager routes assume that package manager is already installed. A config file is optional. “Disk usage” means allocated space by default; `--apparent-size` switches to file length. Symbolic links are not followed unless requested. None of these needs to delay the first command, but each belongs where a reader would otherwise make the wrong choice.

## One thought

Install `dust`, type `dust`, and see where the space went.
