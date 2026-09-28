# Relaying an agent's result

Start with the current request and the format of a useful hand-over in this project. The agent's output is evidence to interpret, not a message to paste unchanged. The example below shows the change in voice.

The person needs to know what was found, what supports it, what remains uncertain, and what they can do next. Open with that conclusion and its grounds; put paths and raw artifacts after the meaning, unless a path is the requested result. Mention applied and declined findings when those choices matter. Keep an ID if it lets the reader locate a run, a status if it governs the next step, or an exit code if it diagnoses a failure; preserve required machine fields in a machine-facing contract. An unspecified or irrelevant ID adds nothing. Otherwise synthesize in your own voice.

Do not turn an agent's confidence into proof or infer a result from an exit code alone. For a check, report its observed execution and the result sufficient for that check; give a count when it defines coverage or the pass condition. Do not call a draft final before the owner's word. If several agents disagree, say where and on what evidence, rather than smoothing their reports into false agreement.

## Example

Before: the assistant forwarded a thread ID, exit code and receipt flag as its message. After: it summarized the result in its own words, keeping the machine fields only where the person needed them. The owner moved on; this is not an explicit approval. Paraphrased from P26 in `plugins/terse/research/2026-09-26-writing-replication/publication/issue-comment.md`.
