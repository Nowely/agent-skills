# Review comment

Start with how reviews in this project read: their tone, whether they mark comments as blocking or as suggestions, and the contract, guideline or test the change is measured against.

The author reads the comment at its line and decides whether to change the code now. Keep one point per comment, on the line it concerns. Say what is wrong or risky and why — the contract it breaks, the case that fails, the consequence — and what would resolve it. Mark it as blocking or as a suggestion, the way this project does. When you are not sure, ask a question instead of asserting a defect.

When you answer a reviewer, take each point in turn: changed, answered, or kept with a reason. Two short blocks on the substance usually carry it.

Do not rewrite the change inside a comment, restate what the diff already shows, or stack unrelated points in one comment. "This could be better" gives the author nothing to act on.

## Example

The owner asked that a reply to a reviewer be two short blocks on the substance, instead of a long and repetitive one. Paraphrased from episode E0263 in `plugins/terse/research/2026-09-26-writing-replication/anonymized/episodes.jsonl`.
