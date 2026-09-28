# Interface text and error messages

Start with the design or mock-up and the words the product already uses on nearby screens. A label the request did not ask to change stays as it is; one thing keeps one name across screens.

The reader is in the middle of a task and scans rather than reads. A button names its action with a verb and its object: "Delete archive", not "OK". A confirmation before a destructive action says what will be lost and whether it can be undone. An empty state says why the space is empty and the one step that fills it. An error message says what happened, in the user's terms rather than the code's, and what to do next; a command-line error names the file, the key or line, and the fix.

Do not blame the user, show a code or stack trace as the whole message, or end on "Something went wrong" with no next step. Mind the space the text will have: a label that fits in English may be cut off in another language or on a narrow screen.

## Example

The owner first asked to keep a panel's tab labels unchanged, then approved short English labels once the mock-up renamed the tabs, and pointed out that the rest of the interface labels had to follow the mock-up too. Paraphrased from episodes E0080, E0109 and E0111 in `plugins/terse/research/2026-09-26-writing-replication/anonymized/episodes.jsonl`.
