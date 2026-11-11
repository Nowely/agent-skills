# Case: export settings

A report export form lets an editor choose a title and a comma-separated list of labels. Block export when the trimmed title is empty or when more than eight nonempty labels are supplied. The caller already normalizes the inputs before invoking `validateExport`; preserve the submitted text and existing error messages. Review the change for correctness, simplicity, design and tests.
