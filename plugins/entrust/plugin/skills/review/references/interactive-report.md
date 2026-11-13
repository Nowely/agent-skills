# Interactive presentation

Render only when the user asks. Every review already has a canonical `review.json` as specified by the [data contract](report-data.md). Presentation does not request a second review or authorize project edits.

1. Locate the report and its recorded source snapshot. Verify revision/diff identity and local image digests from `change.sources` and `coverage`. If inputs are unavailable or have changed, name the missing evidence; do not silently use a new source version.
2. From that repository, run:

       node "<skill-dir>/scripts/report.mjs" render /path/to/review.json

   `<skill-dir>` is the installed review skill directory. The script checks the record against the diff, writes `review.html` beside it and prints a Markdown rendering. It does not modify JSON.
3. Confirm the JSON bytes are unchanged and link the HTML. All findings, requirements, structures, mechanisms and manual scenarios come from the existing record. A new substantive conclusion needs an explicit revised review, not a silent rendering-time repair.

The self-contained page shows the current and target solutions, recommendations, requirement provenance, mechanisms and their costs, file tree, connected units, changed-line blocks, findings and proposed manual checks. It supports apply/skip decisions and notes on findings, ideas, blocks and selected passages. The user copies those decisions back as text. They are proposals for the next step, not edits to source. Local images are embedded; HTTPS pictures remain links.
