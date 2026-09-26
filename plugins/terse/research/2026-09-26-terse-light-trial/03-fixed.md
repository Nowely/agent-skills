# Dust

Dust is a `du` alternative that shows the largest files and directories in a size-sorted tree.

- **Ready at once.** With default settings, Dust scans the current directory.
- **Structure stays visible.** Sizes and tree branches show which entries are large and where each one sits.
- **Focused answers.** Options narrow the view by depth, path, size, or regular expression.

## Quick start

On macOS, run the installer:

```bash
curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh
```

Run Dust:

```bash
dust
```

Default text output shows sizes in a tree, with percent bars when space permits. Each bar compares an entry with the total shown at the root.

## Useful options

| Option | What it changes | Reach for it when |
| --- | --- | --- |
| `PATH...` | Supplies one or more positional paths | You want to inspect somewhere else |
| `-n, --number-of-lines NUMBER` | Limits the view to its largest entries | The default view is too short or too long |
| `-d, --depth DEPTH` | Limits the displayed tree depth | You want a broader, shallower view |
| `-D, --only-dir` | Hides files below the root | You want directory totals without files |
| `-e, --filter REGEX` | Includes matching files | A name or extension defines the search |
| `-v, --invert-filter REGEX` | Filters matching files | Known clutter is hiding useful entries |
| `-X, --ignore-directory PATH` | Excludes a path | One subtree should not count |
| `-z, --min-size SIZE` | Excludes entries at or below a size | Small entries are noise |
| `-x, --limit-filesystem` | On Unix, limits scans to starting filesystems | Mounted filesystems should not count |
| `-s, --apparent-size` | Uses file length on Unix | File length matters more than disk space |
| `-p, --full-paths` | Keeps full paths in the output | Short names are ambiguous |
| `-R, --screen-reader` | Removes bars and adds a depth column | You use a screen reader |

Set the entry limit to ten:

```bash
dust -n 10
```

See every option:

```bash
dust --help
```

## Install with Cargo

If Cargo is already installed:

```bash
cargo install du-dust
dust --version
```

## How it works

Progress and filesystem errors use `stderr`. Dust writes the finished tree to `stdout`.
