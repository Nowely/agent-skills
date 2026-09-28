# Ticket or issue

Start with the tracker's template and a few well-received tickets in this project: what the team fills in, which labels it uses, and how much it writes. An issue in someone else's project follows that project's template, not yours.

The reader triages, reproduces or picks up the work, often weeks later and without this conversation. Give them the problem as expected against actual behaviour, the version it happens on, and the steps that show it. A proposed fix comes after the facts and is marked as a proposal; when the choice between fixes trades one property for another, name the trade-off, because the person who picks it up will make that call.

Do not add estimates, parent tickets or internal task references unless the owner asks for them, and keep internal tool names out of an issue filed in another project. Do not pad the version with the state of your repository; one line with the version is enough. One problem per ticket: a second one gets a ticket of its own.

## Example

Before: feedback for another project's issue that described the local repository at length and left out the plugin version. After: one line with the version, then expected against actual behaviour and a suggested fix, with no internal tool named. The owner asked for each of those changes. Paraphrased from episodes E0069, E0071 and E0072 in `plugins/terse/research/2026-09-26-writing-replication/anonymized/episodes.jsonl`.
