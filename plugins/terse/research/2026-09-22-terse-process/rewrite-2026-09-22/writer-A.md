
## The task (bake-off.md, the writer brief)

Rewrite the whole of ~/Git/agent-skills/plugins/terse/README.md by running the parts above as passes, in order. Keep each
intermediate draft as a separate file; name them 01-reader-pass, 02-writing-pass,
03-prerequisite-pass, and the final result last.

Your angle is Repair-first. Start at the failures. Change as little else as possible..

Fresh readers have been measured against the current file and their failures are in part five.
They are the point of this exercise. A rewrite that improves prose without repairing those failures
has done nothing.

Do not modify the repository. Write every file into your own temporary directory and name the paths
in your return.

THE ACCURACY FLOOR: every statement about behaviour must be true of the code in this checkout, and
you must know the file and line that backs it. Correct what the current file gets wrong rather than
carrying it forward. Rewrites of this file have already failed by writing a cleaner sentence that
states something the code does not do.

CHECK:
a) For each measured failure, name what you changed and where.
b) Back every behavioural claim with a file and line.
c) List what you were tempted to cut and kept, because it is a condition, a limit or a warning at a
   point where a reader decides.
d) Report the word count before and after.
e) For every claim about behaviour you changed or added: the level of evidence reached — the line
   resolves, the code says this, or you made it happen — and the command or line. A claim about a
   lifecycle (what stays, what is removed, what a continuation sees) at level 2 is a guess; run it.

The checkout is ~/Git/agent-skills at commit 2f29a8f on branch terse-process-2026-09-22; the code is the three skill pages under plugins/terse/skills/ with their references/, the seven scripts under plugins/terse/skills/*/scripts/, and the three manifests (plugins/terse/.claude-plugin/plugin.json, plugins/terse/package.json, .claude-plugin/marketplace.json). The audit's claim ledger, with a verdict for every sentence of the current README, is at ~/Git/agent-skills/research/2026-09-22-terse-process/audit-2026-09-22/audit.md under "Claim ledger". Your final text is your return value to a coordinator, not a message to a human: return exactly five fields — status (done | partial | blocked); result (at most 30 lines: first line "<your name>: <status>, <what you did>", then CHECK a) to e) in brief, one line per measured failure for a), and the word counts); evidence (what you read and ran, with counts); artifacts (the four files, absolute paths, the final candidate last); open (what you could not verify, and every sentence you kept at level 2 about a lifecycle).
