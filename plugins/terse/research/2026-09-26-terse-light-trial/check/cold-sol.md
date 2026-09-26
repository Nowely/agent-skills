<!-- cold-sol; 0.3 min; 26527 tokens; exit 0 -->

Codex Sol C2: PASS — A clear, concise, well-structured README, but installation guidance and practical examples are too limited.

- The opening explains the product and its main benefit immediately: “Dust shows you where disk space is being used. Its size-sorted tree keeps the largest entries and their place in the directory structure together.”
- The feature summary is concrete and user-focused: “**Focused answers.** Options narrow the view by depth, path, size, or regular expression.”
- The quick start is genuinely minimal and actionable: “Run Dust:” followed by `dust`.
- The options table is scannable and explains when each flag is useful: “| `-R, --screen-reader` | Removes bars and adds a depth column | You use a screen reader |”
- Installation relies exclusively on piping a remote script into a shell, without offering package-manager or verification alternatives: “curl -sSfL https://raw.githubusercontent.com/bootandy/dust/refs/heads/master/install.sh | sh”
- Usage coverage is shallow because the only runnable example is: “dust”
- The README describes output but does not show representative output, making the presentation harder to visualize: “Default text output shows sizes in a tree, with percent bars when space permits.”
- “Keeps directory child entries” is less clear than the rest of the prose and could better explain whether files are excluded: “| `-D, --only-dir` | Keeps directory child entries | You want directory totals without files |”
- The final implementation note usefully documents stream behavior, especially for scripting: “Dust writes any scan progress and errors to `stderr`. It writes the finished tree to `stdout`.”
