# Review of the implementation, and what was done with it

Opus R1 reviewed a92d0db and 4c11870 against [05-decision.md](05-decision.md), its detail in v2 and both
verifications: a leftover grep over the plugin and the suites (88 hits, none a leftover), ten offline suites green,
and a zsh and bash check of the documented heredoc against a `COMMAND` line with a payload, `$(…)`, backticks,
backslash-newline, tabs, trailing spaces and one or two trailing newlines: every one printed `DECIDED`, ran nothing
and published an accept (level 3). Everything the design keeps was found intact, a decline never reads stdin, the
comparison is exact on bytes, and the changelog names every changed contract.

| Finding | Severity | Disposition, commit ac3ad58 |
|---|---|---|
| F1: the pages copy the command block from the wrapper's hand-back, which 05-decision forbade; the relay passes the agent's text, so a relay talked into rewriting the marker line into a word that is also a line of the command would end the heredoc early (hypothesis) | medium | The heredoc's delimiter is one the coordinator makes up at that moment and checks is no line of the command, never the printed token. Nothing in the relay then needs trusting: a changed byte of the command is refused by the exact comparison, and the heredoc cannot end early on a delimiter chosen after the command is read. This departs from 05-decision's "copy from `--pending`", which costs one more call per request, and keeps the hand-back as the source, which the owner's question about waiting asked for |
| F2: a request with a null or empty command took one empty line as its restatement and was accepted with nothing judged (level 3) | low | refused before stdin is read, "the request carries no command to restate: decline it"; a failing-first case for null and empty commands against three stdins |
| F3: the two hazards of an accept, hooks and a script's bytes at run time, were on the orchestrate page only | low | the codex page's Rights section carries them; both pages now say "a version-control query" and name no tool |
| F4, pre-existing: a permissions request, now refused by rule, was recorded with cause `sandbox`, which the page defines as a command that had just failed | low | its cause is `outside` |

R1's open items that stay open: the Haiku relay was not pushed to rewrite a marker (moot under F1's fix); whether
the server ever sends a null command; `experimentalApi: false` at worktree level (the handshake suite covers read
and write); the classifier on the restated accept, since measured live twice ([07-live-gate.md](07-live-gate.md)).
