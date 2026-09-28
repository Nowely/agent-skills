# The run directory

Each skill that makes a run keeps it in a directory of its own, outside the repository that holds the text, and makes
it with one line in its own SKILL.md. The line is there and nowhere else: Claude Code writes the plugin's
data directory into `${CLAUDE_PLUGIN_DATA}` only in a skill's own body and exports nothing to Bash, so the
same line copied from any other page sends an installed run to the temporary directory. The plugin's
`plugins/terse/evals/pages.test.mjs` fails when the three copies differ.

`D` is the plugin's data directory when Claude Code supplies one, and empty otherwise, as in a bare source
checkout; then the run falls back to the temporary directory. A run in the data directory survives plugin
updates and goes when the plugin's last installation is removed: by `claude plugin uninstall` without
`--keep-data`, or by `claude plugin marketplace remove`, which has no such option. A checkout loaded with
`claude --plugin-dir` gets a data directory of its own, `plugins/data/terse-inline` under Claude Code's
configuration directory, which no uninstall removes: its runs are the user's to delete. In the temporary
directory the operating system may purge a run. A run that must outlive any of these is the user's to copy
somewhere durable, and the report says so.

The data directory is under `~/.claude`, which Claude Code protects: in the `default` and `acceptEdits`
permission modes each file written there asks first, until the user allows edits in `~/.claude` for the
session, and no allow rule or `additionalDirectories` entry approves it in advance; in auto mode its
classifier decides.

`<slug>` names the text, and a `rethink` run ends it in `-rethink`. Name the run's absolute path in the
report and in the run's own files: the next skill is given that path by the user and cannot guess it.
