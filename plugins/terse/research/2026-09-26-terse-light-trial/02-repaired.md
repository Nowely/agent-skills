# Dust

Dust shows you where disk space is being used. Its size-sorted tree keeps the largest entries and their place in the directory structure together.

- **Ready at once.** By default, Dust scans the current directory and sets its entry limit from the terminal height.
- **Structure stays visible.** Sizes and tree branches show which entries are large and where each one sits.
- **Focused answers.** Options narrow the view by depth, path, size, or regular expression.

## Quick start

On macOS or Linux, install the latest release:

```bash
curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh
```

Run Dust:

```bash
dust
```

Default text output shows sizes in a tree, with percent bars when space permits.

## Useful options

| Option | What it changes | Reach for it when |
| --- | --- | --- |
| `PATH...` | Supplies one or more positional paths | You want to inspect somewhere else |
| `-n, --number-of-lines NUMBER` | Limits the view to its largest entries | The default view is too short or too long |
| `-d, --depth DEPTH` | Limits the displayed tree depth | You want a broader, shallower view |
| `-F, --only-file` | Flattens entries without children | You want to compare leaf entries directly |
| `-D, --only-dir` | Keeps directory child entries | You want directory totals without files |
| `-e, --filter REGEX` | Includes matching files | A name or extension defines the search |
| `-v, --invert-filter REGEX` | Excludes matching files | Known clutter is hiding useful entries |
| `-X, --ignore-directory PATH` | Excludes a path | One subtree should not count |
| `-z, --min-size SIZE` | Excludes entries at or below a size | Small entries are noise |
| `-x, --limit-filesystem` | Limits the scan to detected starting filesystems | Mounted filesystems should not count |
| `-s, --apparent-size` | Uses file length on Unix | File length matters more than disk space |
| `-p, --full-paths` | Keeps full paths in the output | Short names are ambiguous |
| `-R, --screen-reader` | Removes bars and adds a depth column | You use a screen reader |

See every option:

```bash
dust --help
```

## How it works

Dust writes any scan progress and errors to `stderr`. It writes the finished tree to `stdout`.
