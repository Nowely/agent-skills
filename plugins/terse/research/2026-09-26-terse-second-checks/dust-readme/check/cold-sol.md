<!-- cold-sol; 0.4 min; 26992 tokens; exit 0 -->

Codex Sol C2: PASS — this is a clear, concise, task-oriented README with strong examples and only minor installation-safety and troubleshooting gaps.

- “**`du` + Rust = `dust`.** An easy way to see where your disk space is being used.” — Immediately explains the project and its purpose.

- “`dust` prints a compact report in your terminal instead of opening an interactive disk browser.” — Clearly sets expectations about the interface.

- “**Ready immediately.** With default settings, it scans the current directory and adapts its width and number of entries to your terminal.” — Describes useful default behavior without making readers study configuration first.

- “`curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh`” — Convenient, but piping a mutable remote script directly into a shell is a security weakness; the README offers no inspection, checksum, or pinned-version alternative.

- “The project warns that the Snap package may not be able to read files outside `/home`.” — Good platform-specific caveat placed near the relevant installation instructions.

- “Pass a path to inspect a different directory, or several paths to compare them at once:” — The usage section progresses naturally from the default invocation to common variations.

- “| Use screen-reader output with complete paths | `dust -R -p` |” — Accessibility is treated as a concrete supported workflow.

- “Regular-expression filters retain parent directories to show where matching files belong. Use `dust --help` for the complete command reference.” — Explains a potentially surprising behavior and directs readers to exhaustive documentation.

- “Configuration is optional. `dust` checks `~/.dust.toml` first, then `$XDG_CONFIG_HOME/dust/config.toml`.” — Documents configuration precedence precisely.

- “Prebuilt Linux, macOS, and Windows archives are available from [GitHub Releases](https://github.com/bootandy/dust/releases).” — Broad platform coverage is clear, though the README does not provide checksum or signature-verification instructions.

- “## Run it” — The README covers normal use well, but it contains no troubleshooting section for permissions, unsupported architectures, or failed installation.
