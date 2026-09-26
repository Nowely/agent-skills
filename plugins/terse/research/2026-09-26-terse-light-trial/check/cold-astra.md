<!-- cold-astra; 0.3 min; 27711 tokens; exit 0 -->

Codex Astra C1: COMPLETE — This README is concise and easy to navigate, but its visual explanation and several option descriptions need more precision.

- **Clear purpose:** “Dust shows you where disk space is being used.” Immediately establishes what the tool does.
- **Practical default behavior:** “By default, Dust scans the current directory and sets its entry limit from the terminal height.” Helps readers predict their first run.
- **Straightforward installation:** “On macOS or Linux, install the latest release:” Clearly identifies the platforms covered, though installation support for other platforms is unknown from this file.
- **Missing output example:** “Default text output shows sizes in a tree, with percent bars when space permits.” A sample tree would make this central feature easier to understand; the percentage denominator is unspecified.
- **Useful task-oriented reference:** “| Option | What it changes | Reach for it when |” Connects flags to user needs rather than merely listing syntax.
- **Ambiguous filtering descriptions:** “| `-F, --only-file` | Flattens entries without children | You want to compare leaf entries directly |” and “| `-D, --only-dir` | Keeps directory child entries | You want directory totals without files |” Use wording that leaves the precise treatment of files, empty directories, and hierarchy unclear.
- **Helpful scripting detail:** “Dust writes any scan progress and errors to `stderr`. It writes the finished tree to `stdout`.” Clearly explains output streams for redirection and pipelines.
