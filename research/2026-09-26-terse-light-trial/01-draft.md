# Dust

[![Build status](https://github.com/bootandy/dust/actions/workflows/CICD.yml/badge.svg?branch=master)](https://github.com/bootandy/dust/actions)

> Because I want an easy way to see where my disk is being used.

Dust is a more intuitive `du`: it finds the largest files and directories beneath the paths you give it and lays them out as a size-sorted tree.

- **Immediate overview.** With no path, Dust scans the current directory and fits the number of entries to the terminal height.
- **Structure stays visible.** Sizes, tree branches, and percentage bars show both what is large and where it belongs.
- **Focused answers.** Narrow the view by depth, path, file type, size, or regular expression.

## Quick start

Install the latest release:

```bash
curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh
```

Then scan the directory you are in:

```bash
dust
```

Dust prints a tree of the largest entries, with disk sizes and percentage bars. Pass one or more paths to scan somewhere else:

```text
dust PATH...
```

## Useful options

Start with `-n` when you want more or less detail. Combine the other controls as the question changes.

| Option | What it changes | Reach for it when |
| --- | --- | --- |
| `-n, --number-of-lines NUMBER` | Limits the selection to the largest entries | The default view is too short or too long |
| `-d, --depth DEPTH` | Limits the displayed tree depth | You want a broader, shallower view |
| `-F, --only-file` | Shows only files | You are looking for the largest individual files |
| `-D, --only-dir` | Shows only directories | You want directory totals without file rows |
| `-e, --filter REGEX` | Includes only matching paths | A name or extension defines the search |
| `-v, --invert-filter REGEX` | Excludes matching paths | Known clutter is hiding useful entries |
| `-X, --ignore-directory PATH` | Excludes a path | One subtree should not count |
| `-z, --min-size SIZE` | Excludes entries at or below a size | Small entries are noise |
| `-x, --limit-filesystem` | Stays on the starting filesystem | A mounted filesystem should not count |
| `-s, --apparent-size` | Uses file length instead of allocated blocks | Logical file size matters more than disk use |
| `-f, --filecount` | Counts child files instead of bytes | File count is the useful measure |
| `-p, --full-paths` | Keeps full paths in the output | Short names are ambiguous |
| `-R, --screen-reader` | Removes bars and adds a depth column | Reading the output with a screen reader |
| `-j, --output-json` | Prints the selected tree as JSON | Another command will consume the result |
| `--config FILE` | Loads settings from a chosen config file | You keep a reusable set of defaults |

See every flag:

```bash
dust --help
```

## How it works

Dust reads directory entries and filesystem metadata, totals the children beneath each directory, and selects the largest entries for display. By default on Unix, it measures allocated space and avoids counting the same inode and device twice; `--apparent-size` switches to file length and includes duplicate inodes.

While Dust scans, progress and errors go to standard error. The finished tree goes to standard output; `--output-json` sends JSON there instead.
