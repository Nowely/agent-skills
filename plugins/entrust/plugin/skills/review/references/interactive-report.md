# Interactive presentation

Render only when the user asks. Every review already has a canonical `review.json` as specified by the [data contract](report-data.md). Presentation does not request a second review or authorize project edits.

1. Locate the report and its recorded source snapshot. Verify revision/diff identity and local image digests from `change.sources` and `coverage`. If inputs are unavailable or have changed, name the missing evidence; do not silently use a new source version.
2. From that repository, run:

       node "<skill-dir>/scripts/report.mjs" render /path/to/review.json

   `<skill-dir>` is the installed review skill directory. The script checks the record against the diff, writes `review.html` beside it and prints a Markdown rendering. It does not modify JSON.
3. Confirm the JSON bytes are unchanged and link the HTML. All findings, requirements, structures, mechanisms and manual scenarios come from the existing record. A new substantive conclusion needs an explicit revised review, not a silent rendering-time repair.

The self-contained page shows the current and target solutions, recommendations, requirement provenance, mechanisms and their costs, file tree, connected units, changed-line blocks, findings and proposed manual checks. It supports apply/skip decisions and notes on findings, ideas, blocks and selected passages. The user copies those decisions back as text. They are proposals for the next step, not edits to source. Local images are embedded; HTTPS pictures remain links.

Mechanism cards start collapsed, showing the name, existing recommendation and compact attributed weight.
Expanding a card reveals its consequence, alternative, benefit, cost and detailed grounds. This rearranges the canonical record,
not a second analysis or a new independent mechanism-decision state. Global navigation precedes the content.

Passage comments use a local draft editor with Save/Cancel (Escape cancels; Ctrl/Cmd+Enter saves).
Alt+Shift+M opens the editor for the current selection. Saved passages retain a source ID, text offsets and
full quote; marks and numbered buttons are restored only when the stored text still matches. Old comments
without anchors remain readable/editable/exportable and are marked as unlocated rather than guessed.
Deletion offers undo for eight idle seconds; feedback pauses while hovered or focused, resumes when interaction leaves it and can be dismissed. Clearing all feedback requires confirmation. Only on-screen quote previews are shortened.
The browser regression script is `plugins/entrust/evals/review-annotations.browser.mjs`; run it through the
Playwright browser tool on an isolated generated Russian report containing at least two mechanisms. It restores
the report's prior local state on completion, including when a check fails.

Mechanism weight comes only from explicit block references and the recorded diff: separate added/removed
nonblank lines for code, tests and other material. Shared blocks are displayed separately with links; they
are not charged to every mechanism's exclusive contribution. Unmapped legacy mechanisms remain unassessed.
The renderer does not invent frequency, omitted behavior or tradeoff conclusions. See the data contract for
attribution: this footprint is neither a complexity score nor an estimate of deletable code.

The weight overview leads with all attributed lines within each mechanism, including shared lines, using
localized added/removed wording and no zero operations. Shared lines are explicitly a subset. Exclusive
contribution and per-block attribution stay in the expanded
counted-lines view. Code, tests and other material remain separate; unknown and verified-zero states differ.
