# dust

[![Build Status](https://github.com/bootandy/dust/actions/workflows/CICD.yml/badge.svg?branch=master)](https://github.com/bootandy/dust/actions)

**`du` + Rust = `dust`.** An easy way to see where your disk space is being used.

`dust` turns a directory into a compact tree of its largest files and subdirectories. Human-readable sizes, proportional bars, and percentages keep the large entries visible without a `sort` or `head` pipeline. With default settings, it scans the current directory and adapts its width and line count to your terminal.

<p>
  <img src="media/demo.gif" alt="dust displaying disk usage as a tree with sizes, bars, and percentages" width="600">
</p>

## Install

The shell installer detects Linux, macOS, and MINGW, MSYS, or Cygwin on Windows, then downloads the latest release:

```sh
curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh
```

Or install `dust` with a package manager you already use:

| System | Command |
| --- | --- |
| macOS or Linux with Homebrew | `brew install dust` |
| Fedora | `sudo dnf install du-dust` |
| Ubuntu and other Snap systems | `snap install dust` |
| Debian or Ubuntu with deb-get | `deb-get install du-dust` |
| Conda | `conda install -c conda-forge dust` |
| Windows with Scoop | `scoop install dust` |
| With Rust and Cargo | `cargo install du-dust` |

The Snap package can access files only under `/home`. Prebuilt Linux, macOS, and Windows archives are available from [GitHub Releases](https://github.com/bootandy/dust/releases).

## Run it

From the directory you want to inspect:

```sh
dust
```

The report shows sizes beside a tree of the largest entries. A bar and percentage compare each entry with the total, while lighter bar segments preserve its parent-directory context.

Pass one or more paths to inspect somewhere else or compare several roots:

```text
dust <path> [<path> ...]
```

Use `dust --help` for the complete command reference.

## Choose what to see

| Task | Command |
| --- | --- |
| Show the 20 largest entries | `dust -n 20` |
| Limit the tree to three levels | `dust -d 3` |
| Find the largest files | `dust -F` |
| Show directories only | `dust -D` |
| Ignore hidden files and directories | `dust -i` |
| Stay on the starting filesystem | `dust -x` |
| Use apparent size instead of allocated disk space | `dust -s` |
| Exclude entries at or below 100 MB | `dust -z 100MB` |
| Keep only paths that match a regular expression | `dust -e '\.png$'` |
| Remove bars and add a depth column for screen readers | `dust -R -p` |
| Emit the directory tree as JSON | `dust -j` |

Combine these controls as needed: `dust -D -d 2 -n 50` shows up to 50 directories within two levels.

## Configure defaults

`dust` first checks `~/.dust.toml`, then `$XDG_CONFIG_HOME/dust/config.toml` (or `~/.config/dust/config.toml` when `XDG_CONFIG_HOME` is not set).

```toml
number-of-lines = 20
depth = 3
ignore-hidden = true
limit-filesystem = true
```

See the [sample config](config/config.toml) for the available keys, including full paths, apparent size, colors, bars, output units, and collapsed directories. You can also select a file for one run with `dust --config <file>`.

## Alternatives

Other disk-usage tools include [ncdu](https://dev.yorhel.nl/ncdu), [dua](https://github.com/Byron/dua-cli), [dutree](https://github.com/nachoparker/dutree), [pdu](https://github.com/KSXGitHub/parallel-disk-usage), and `du -d 1 -h | sort -h`.

## License

`dust` is licensed under the [Apache License 2.0](LICENSE).
