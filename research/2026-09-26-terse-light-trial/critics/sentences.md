<!-- sentences; 7.7 min; 5 tool uses -->

Reviewed 01-draft.md against writing-rules.md and curse-of-knowledge.md (both applied as written) and against rules.md's first section, "First: a pleasant read" (sentences taken in at one reading; a hard one is said more simply, or cut). 5 sentences need a second read; no repository files touched, nothing written.

1. **Line 7** — "Dust is a more intuitive `du`: it finds the largest files and directories beneath the paths you give it and lays them out as a size-sorted tree."
   Cause: one sentence, two verbs, with a relative clause ("beneath the paths you give it") wedged between the object and the second verb — "them" in "lays them out" has to reach back across it; `du` sits bare right after the subject.
   Plainer: "Dust is a more intuitive `du`. Give it one or more paths, and it lays out the largest files and directories as a size-sorted tree."

2. **Line 9** — "With no path, Dust scans the current directory and fits the number of entries to the terminal height."
   Cause: "fits [a count] to [a height]" inverts the usual fit-X-to-Y pattern (you fit entries into a height, not a number to a height); the reader builds one picture, then has to revise it.
   Plainer: "With no path, Dust scans the current directory and shows as many entries as fit on the screen."

3. **Line 10** — "Sizes, tree branches, and percentage bars show both what is large and where it belongs."
   Cause: "it" in "where it belongs" has no plural antecedent in the subject ("Sizes, tree branches, and percentage bars") — the reader must backtrack to the other clause, "what is large," to resolve it.
   Plainer: "Sizes, tree branches, and percentage bars show which entries are large and where each one sits."

4. **Line 63, second sentence** — "By default on Unix, it measures allocated space and avoids counting the same inode and device twice; `--apparent-size` switches to file length and includes duplicate inodes."
   Cause: two topics compressed across a semicolon; the second clause's subject is a bare flag name; "inode" is never defined anywhere in the document (curse-of-knowledge: the writer's invisible prerequisite).
   Plainer: "By default on Unix, Dust counts actual disk use and does not double-count a file that appears in more than one place. With `--apparent-size`, it counts file length instead, even when that counts such a file twice."

5. **Line 65, second sentence** — "The finished tree goes to standard output; `--output-json` sends JSON there instead."
   Cause: same semicolon-plus-bare-flag-subject pattern as #4; "there" also has to be resolved against "standard output" two clauses back, past "standard error" in the sentence before it.
   Plainer: "The finished tree goes to standard output. With `--output-json`, that output is JSON instead."

None of the five carries nothing, so none is marked "cut" — all state a real mechanism or default, they just need the second read removed.

Scope check: table rows and the three other prose paragraphs (lines 11, 27, 35, 63's first sentence, 65's first sentence) were read against the same four criteria and hold up on one reading — not reported per "no noise." Read only the four named files (draft, writing-rules.md, curse-of-knowledge.md, rules.md in full — needed in full to find where its first section ends, since section boundaries aren't knowable without reading past them).
