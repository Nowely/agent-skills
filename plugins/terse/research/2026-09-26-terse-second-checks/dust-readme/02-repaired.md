# dust

**`du` + Rust = `dust`.** An easy way to see where your disk space is being used.

`dust` prints a compact report in your terminal instead of opening an interactive disk browser.

- **Focused.** It selects the largest files and directories itself, without a `sort | head` pipeline.
- **Readable.** By default, it shows human-readable sizes; proportional bars and percentages appear when the terminal is wide enough.
- **Ready immediately.** With default settings, it scans the current directory and adapts its width and number of entries to your terminal.

<p>
  <img src="media/demo.gif" alt="dust displaying disk usage as a tree with sizes, bars, and percentages" width="600">
</p>

## Install

The shell installer detects Linux, macOS, or Windows through MINGW, MSYS, or Cygwin. On a supported architecture, it downloads the latest release archive:

```sh
curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh
```

Or install `dust` with a package manager:

| System | Command |
| --- | --- |
| macOS or Linux with Homebrew | `brew install dust` |
| Fedora | `sudo dnf install du-dust` |
| Ubuntu and other Snap systems | `snap install dust` |
| Debian or Ubuntu with deb-get | `deb-get install du-dust` |
| Conda | `conda install -c conda-forge dust` |
| Windows with Scoop | `scoop install dust` |
| With Rust and Cargo | `cargo install du-dust` |

The project warns that the Snap package may not be able to read files outside `/home`.

Prebuilt Linux, macOS, and Windows archives are available from [GitHub Releases](https://github.com/bootandy/dust/releases).

## Run it

From the directory you want to inspect:

```sh
dust
```

The report shows sizes beside a tree of the largest entries. With bars enabled and enough terminal width, a bar and percentage show each entry's share of the total; lighter segments show how it fits within its parent directory.

Pass a path to inspect a different directory, or several paths to compare them at once:

```text
dust <path> [<path> ...]
```

## Choose what to see

| Task | Command |
| --- | --- |
| Show the 20 largest entries | `dust -n 20` |
| Limit tree depth to 3 | `dust -d 3` |
| Find the largest files | `dust -F` |
| Show directories only | `dust -D` |
| Skip `node_modules` directly under the scan path | `dust -X node_modules` |
| Ignore hidden files and directories | `dust -i` |
| Stay on the starting filesystem | `dust -x` |
| Use file length instead of allocated disk space | `dust -s` |
| Exclude entries at or below 100 MB | `dust -z 100MB` |
| Keep files whose paths match a regular expression | `dust -e '\.png$'` |
| Follow symbolic links into directories | `dust -L` |
| Use screen-reader output with complete paths | `dust -R -p` |
| Emit the directory tree as JSON | `dust -j` |

Regular-expression filters retain parent directories to show where matching files belong. Use `dust --help` for the complete command reference.

## Configure defaults

Configuration is optional. `dust` checks `~/.dust.toml` first, then `$XDG_CONFIG_HOME/dust/config.toml`. If `XDG_CONFIG_HOME` is unset, empty, or not absolute, it checks `~/.config/dust/config.toml` instead.

```toml
number-of-lines = 20
depth = 3
ignore-hidden = true
limit-filesystem = true
```

See the [sample config](config/config.toml) for examples of supported keys. To select a config file for one run, use `dust --config <file>`.

## License

`dust` is licensed under the [Apache License 2.0](LICENSE).
