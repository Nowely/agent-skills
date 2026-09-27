# Steps

2026-09-26 and 2026-09-27. The main session (Opus 5.5, 1M context; 162.5k tokens in context at the probe) did
the reading and the writing itself; one probe of three Haiku agents ran on the owner's word. There were no
critic rounds. Errors each step made are recorded beside what it produced.

| Step | Who | Produced | Got wrong |
|---|---|---|---|
| Code reading | the main session: searches over the 2.1.280 binary, `extension.js` and `webview/index.js`, the extension process's flags and environment, and the session transcripts since 2026-09-01 | the depth cap, the foreground and background forwarding paths, the flag the extension never sets, the 2026-09-10 nested launch; a prediction for each timeline result | the first search used the machine's `grep` with a pattern its regex engine refused as too complex; rerun in Python |
| Probe | 1 Haiku coordinator (39 s, 23.9k tokens) launching 2 Haiku grandchildren (12 s, 21.9k; 15 s, 21.0k) | nesting on 2.1.280, where a background grandchild's report goes, the timeline and the agent map as the owner saw them in five and one screenshots | the main session's own message landed inside the coordinator's run in the timeline, as the 2026-09-17 note on background cards predicted |
| Vendor prompt | the main session: Claude Code's built-in coordinator prompt extracted from the binary, 244 lines, and read against the page | 19 rules mapped ([vendor-practices.md](vendor-practices.md)) | — |
| Survey re-read | the main session: the 2026-09-17 synthesis and surveys searched for hierarchy, manager, supervisor and handoff | ten rows for and against a middle layer | the recommendation shown before the re-read proposed a foreman for more than one worker; S1-04 and S2-12 raised it to three |
| Decisions | the owner | an Opus foreman in the background, proposed for three workers or more, allowed the Fable agent within the cap; explicit models kept; E50 to the ledger | — |
| Pages | the main session | `references/foreman.md`, a sentence in the page's bounds paragraph, the Fable launch rule, a roles row, eight pins and D7 widened; the suite 67 of 67, and 9 of 67 failing with the page change taken out | — |
