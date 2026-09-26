<!-- form; 18.3 min; 8 tool uses -->

Reviewed 01-draft.md (91 lines) against context.md, readme-terminal-tools.md, the three fetched READMEs, and rules.md.

**Pleasant/scan:** mostly yes. Task-phrased headings, two well-built tables (Install, Choose what to see), and fenced blocks correctly distinguish a literal command (```sh, lines 39-41) from a placeholder pattern (```text, lines 47-49). Two spots fight scanning: line 7 and line 33 (below).

**Early need:** by line 41 the reader already has name, du-comparison, value prop, demo, install command, and first run — matches context.md's priority order closely. One gap in "early": the report-vs-interactive-browser distinction context.md opens with is never stated.

Findings (line : category : what's wrong : what the reader gains):

1. **Lines 5-7 / missing.** context.md:5 frames dust against dua/gdu specifically by "its primary interface is a report printed directly in the terminal rather than an interactive browser" — this distinction never appears anywhere in the draft (checked full text). Adding one clause to the opening paragraph lets a reader who actually wants an interactive browser (or dreads learning one) find out before installing, not after.

2. **Line 86 / missing.** Alternatives lists "ncdu, dua, dutree, pdu, and du -d 1 -h | sort -h" — gdu is absent, even though context.md:5 names dua *and* gdu together as the tools dust resembles, and both fetched exemplars (dua-cli, gdu) cross-list each other alongside dust in their own Alternatives sections. Reader comparing tools sees the same set context.md says dust resembles, not a partial one.

3. **Nowhere / missing.** context.md:20 flags "Symbolic links are not followed unless requested" as a prerequisite that "belongs where a reader would otherwise make the wrong choice." No line in the draft mentions symlinks (grep confirms). A reader whose missing space involves symlinked files/directories won't misattribute dust's total or wonder why the numbers look off.

4. **Line 71 / missing.** "Configure defaults" never says the step is optional, though context.md:19 states this explicitly as one of five things that "belongs where a reader would otherwise make the wrong choice." A one-clause fix stops the answer-now reader from pausing here to wonder if setup is required before the tool works.

5. **Line 7 / formatting.** The benefits (human-readable sizes, bars, percentages, no sort/head pipeline, terminal-adaptive width) are one dense paragraph. rules.md ("Then what it gives, as a short list… reads fastest as one bold-led item each") and the genre count (8/8 READMEs surface this content, mostly as a bullet list — readme-terminal-tools.md place 5) both point to a short list instead. Reader scanning to decide "does this solve my problem" gets a yes/no per line instead of parsing a paragraph.

6. **Line 33 / formatting.** "The Snap package can access files only under /home. Prebuilt Linux, macOS, and Windows archives are available from GitHub Releases." bundles an install caveat with an unrelated fact (an extra install route) in one sentence. Splitting them lets a Snap user find the caveat, and a reader on an unlisted system find the archive link, without reading past the other.

7. **Line 51 / out of place.** "Use `dust --help` for the complete command reference" sits between "Run it" and "Choose what to see," pointing to the full flag list right before the doc itself shows a curated slice of it. Moving it to after line 69 lets the reader take in the common controls first and reads the `--help` pointer as "beyond this, see `--help`," not a premature detour.

8. **Line 3 / minor, low-confidence.** The sole badge is CI build status — a maintainer-facing signal — while context.md's reader is deciding whether/how to install, not vetting project health. Cost to the reader is one glance either way; flagged for completeness, not a priority.

Scope note: did not fact-check flag semantics (e.g., whether `-R -p` really does what row 66 claims) against dust's source — the brief's questions are about reader experience, not accuracy, and the source tree wasn't needed to answer them.

