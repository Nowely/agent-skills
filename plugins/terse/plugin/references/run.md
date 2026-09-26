# The run directory

Each skill keeps its run in a directory of its own, outside the repository that holds the text, and makes
it with one line in its own SKILL.md. The line is there and nowhere else: Claude Code writes the plugin's
data directory into `${CLAUDE_PLUGIN_DATA}` only in a skill's own body and exports nothing to Bash, so the
same line copied from any other page sends an installed run to the temporary directory. The plugin's
`plugins/terse/evals/pages.test.mjs` fails when the three copies differ.

`D` is empty when a skill runs from a source checkout rather than an installed plugin, which is why the
fallback is there. Under the plugin's data directory a run survives plugin updates and is deleted by
`claude plugin uninstall` unless `--keep-data` is passed, and in the temporary directory the operating
system may purge it: a run that must outlive either is the user's to copy somewhere durable, and the
report says so.

`<slug>` names the text, and a `rethink` run ends it in `-rethink`. Name the run's absolute path in the
report and in the run's own files: the next skill is given that path by the user and cannot guess it.
