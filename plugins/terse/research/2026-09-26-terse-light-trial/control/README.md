[![Build Status](https://github.com/bootandy/dust/actions/workflows/CICD.yml/badge.svg?branch=master)](https://github.com/bootandy/dust/actions)

# dust

**A more intuitive `du`, written in Rust.**

`dust` gives you an instant overview of the files and directories using your disk space. It sorts entries by size, displays their hierarchy as a tree, and scales the output to your terminal—no need to combine `du`, `sort`, and `head`.

```console
$ dust
```

<p>
  <img src="media/demo.gif" alt="A terminal demonstration of dust exploring disk usage" width="600">
</p>

In the demo, the bars show both relative size and directory ancestry. The shaded continuation of a parent bar makes it easy to see which entries belong to the same subtree.

## Highlights

- Finds the largest files and directories and presents them in context.
- Chooses a sensible amount of output based on the terminal height.
- Uses colors and percentage bars to make parent/child relationships visible.
- Avoids counting hard links more than once by default.
- Supports multiple paths, regex filters, file-type summaries, JSON output, and config files.
- Includes a screen-reader-friendly output mode.
- Runs on Linux, macOS, and Windows.

## Installation

### Install script

Install the latest release on Linux, macOS, or Windows environments with a POSIX-compatible shell:

```sh
curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh
```

Review the [install script](https://github.com/bootandy/dust/blob/master/install.sh) before running it if you prefer not to pipe a remote script directly into your shell.

### Package managers

| Platform | Command |
| --- | --- |
| Rust / Cargo | `cargo install du-dust` |
| Homebrew (macOS or Linux) | `brew install dust` |
| Fedora | `sudo dnf install du-dust` |
| Snap | `snap install dust` |
| mise | `mise use -g dust` |
| Pacstall (Debian/Ubuntu) | `pacstall -I dust-bin` |
| conda-forge | `conda install -c conda-forge dust` |
| deb-get (Debian/Ubuntu) | `deb-get install du-dust` |
| x-cmd | `x env use dust` |
| Scoop (Windows) | `scoop install dust` |

> [!NOTE]
> The Snap package can access only files under `/home`. See [danie-dejager/dust-snap#2](https://github.com/danie-dejager/dust-snap/issues/2) for details.

The Windows MSVC build requires the [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist).

### Prebuilt binaries

Download an archive for your platform from [GitHub Releases](https://github.com/bootandy/dust/releases), extract it, and place the `dust` executable somewhere on your `PATH`. For example, on Linux or macOS:

```sh
tar -xzf dust-*.tar.gz
sudo mv dust-*/dust /usr/local/bin/
```

Verify the installation:

```sh
dust --version
```

## Usage

Run `dust` without a path to inspect the current directory, or pass one or more paths:

```sh
dust
dust ~/Downloads
dust /var/log ./target
```

Common tasks:

```sh
# Show the 20 largest entries, no more than three levels deep
dust -n 20 -d 3

# Find the largest files only
dust -F

# Show only directories, using apparent file sizes
dust -D -s

# Ignore hidden entries and stay on the current filesystem
dust -i -x /

# Include only PNG files
dust -e '\.png$'

# Exclude node_modules and keep .git collapsed
dust -X node_modules --collapse .git

# Summarize usage by file extension
dust -t

# Emit machine-readable output
dust -j | jq
```

### Frequently used options

| Option | Description |
| --- | --- |
| `-n, --number-of-lines <NUMBER>` | Show the largest `NUMBER` entries. |
| `-d, --depth <DEPTH>` | Limit the displayed tree depth. |
| `-F, --only-file` | Show only files. |
| `-D, --only-dir` | Show only directories. |
| `-s, --apparent-size` | Use file length instead of allocated disk blocks. |
| `-f, --filecount` | Measure directories by child-file count instead of size. |
| `-t, --file-types` | Group usage by file extension. |
| `-e, --filter <REGEX>` | Include paths matching a regular expression. |
| `-v, --invert-filter <REGEX>` | Exclude paths matching a regular expression. |
| `-X, --ignore-directory <PATH>` | Exclude a file or directory path. May be repeated. |
| `-z, --min-size <SIZE>` | Hide entries smaller than a size such as `40000`, `30MB`, or `20KiB`. |
| `-x, --limit-filesystem` | Stay on the filesystem containing the supplied path. |
| `-L, --dereference-links` | Follow symbolic links into directories. |
| `-p, --full-paths` | Do not shorten paths. |
| `-r, --reverse` | Print the tree with the largest entries first. |
| `-o, --output-format <FORMAT>` | Use `si`, `b`, `k`, `m`, `g`, `t`, `kb`, `mb`, `gb`, or `tb`. |
| `-j, --output-json` | Write the directory tree as JSON to stdout. |
| `-R, --screen-reader` | Remove bars and symbols and add a depth column. |
| `-c, --no-colors` | Disable colors. `dust` also respects `NO_COLOR`. |
| `--config <FILE>` | Load a specific config file. |

Run `dust --help` for the complete option reference, including time-based filters, input path lists, display controls, and thread configuration.

## Understanding the output

`dust` selects the largest entries while retaining enough of the tree to show where they live. Each bar represents an entry's share of the scanned total. Grey continuations connect descendants to their parents, so related disk usage remains visually grouped.

The default number of rows follows the terminal height. Use `-n` to control it explicitly—for example, `dust -n 10` for a compact summary or `dust -n 50` for more detail. Use `-d` when you want a fixed tree depth instead.

By default, hard-linked files are counted once. With `--apparent-size`, each link is counted because the command measures file length rather than allocated blocks.

## Configuration

When `--config` is not supplied, `dust` uses the first valid configuration it finds in this order:

1. `~/.dust.toml`.
2. `$XDG_CONFIG_HOME/dust/config.toml`, or `~/.config/dust/config.toml` when `XDG_CONFIG_HOME` is unset or invalid.

Pass `--config <FILE>` to use a specific file instead.

Keys use the long option name in kebab-case. Example:

```toml
# ~/.config/dust/config.toml
reverse = true
limit-filesystem = true
number-of-lines = 30
output-format = "si"
collapse = [".git", "node_modules"]
```

See the [sample configuration](config/config.toml) for all supported settings. Command-line values take precedence where both forms are supported.

## Accessibility and non-interactive output

Use `--screen-reader` (`-R`) to replace visual bars with a depth column; combining it with `--full-paths` can provide additional context. Use `--no-colors` (`-c`) or set the [`NO_COLOR`](https://no-color.org/) environment variable when consuming output in another program. For structured data, use `--output-json` (`-j`).

## Building from source

The project uses the stable Rust toolchain:

```sh
git clone https://github.com/bootandy/dust.git
cd dust
cargo build --release --locked
```

The resulting executable is `target/release/dust` (`target/release/dust.exe` on Windows).

To run the checks used during development:

```sh
cargo test --locked
cargo fmt --all -- --check
cargo clippy --locked -- -D warnings
```

Bug reports and pull requests are welcome in the [GitHub repository](https://github.com/bootandy/dust).

## Alternatives

- [ncdu](https://dev.yorhel.nl/ncdu)
- [dutree](https://github.com/nachoparker/dutree)
- [dua](https://github.com/Byron/dua-cli)
- [pdu](https://github.com/KSXGitHub/parallel-disk-usage)
- [dirstat-rs](https://github.com/scullionw/dirstat-rs)
- `du -d 1 -h | sort -h`

Unlike tools that show only aggregate directory sizes, `dust` keeps large individual files visible inside their directory hierarchy. This makes it easier to distinguish “large directory” from “directory containing the file I actually need to investigate.”

## License

Licensed under the [Apache License 2.0](LICENSE).
