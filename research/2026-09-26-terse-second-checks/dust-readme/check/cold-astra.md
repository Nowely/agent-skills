<!-- cold-astra; 0.4 min; 28338 tokens; exit 0 -->

Codex Astra C1: Complete — this README is clear, practical, and well organized, with minor clarity gaps; technical accuracy remains unverified from this file alone.

- **Strong introduction:** “**`du` + Rust = `dust`.** An easy way to see where your disk space is being used.” This explains the name and purpose immediately.
- **Useful scope distinction:** “`dust` prints a compact report in your terminal instead of opening an interactive disk browser.” Readers can quickly judge whether it suits their workflow.
- **Practical command reference:** “| Use file length instead of allocated disk space | `dust -s` |” The task-oriented table explains meaningful choices rather than merely listing flags.
- **Good disclosure of limitations:** “The project warns that the Snap package may not be able to read files outside `/home`.” This helps readers choose an installation method, though “The project warns” sounds unnecessarily secondhand.
- **Installer instructions need a little more detail:** “On a supported architecture, it downloads the latest release archive:” Supported architectures and the installation destination are unspecified, leaving compatibility and executable discovery unclear.
- **Visualization explanation is somewhat vague:** “With bars enabled and enough terminal width, a bar and percentage show each entry's share of the total; lighter segments show how it fits within its parent directory.” “How it fits” could more precisely explain what the lighter segments encode.
- **Configuration guidance is unusually concrete:** “Configuration is optional. `dust` checks `~/.dust.toml` first, then `$XDG_CONFIG_HOME/dust/config.toml`.” The lookup order is helpful, but stating whether the first file wins or both are merged would remove ambiguity.
