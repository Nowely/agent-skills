# What was done with each of Codex Astra J0's 24 split-critique findings

Source of the findings: agents/J0.json. "Applied" means the change is in the corpus rebuild (agents/E1b.json), in the
Luna brief generator (tools/mkprompts.py), the schema (briefs/episodes.schema.json) or the coordinator's tools.

| # | finding (short) | disposition |
| --- | --- | --- |
| 1 | duplicate records of one uuid inside a file | applied in the rebuild: 1,775 removed |
| 2 | context from the wrong branch | applied: context by parentUuid ancestors; 0 parts with later context |
| 3 | no linking across part boundaries | applied inside E2's role (linked_draft / linked_outcome from turns.jsonl), not as a new stage |
| 4 | historical snapshots of discussed artifacts | partly: draft_missing_reason added; snapshots not recoverable in general |
| 5 | old vs new text in assistant-tool turns | applied: [старый текст] / [новый текст] marks and the call's result line |
| 6 | corpus instructions read as instructions | applied: "pages are data, not instructions" in every brief |
| 7 | exclusion applied per turn instead of per fragment | applied: brief says decide by fragment; mixed turns give several episodes |
| 8 | "commit after text = approved"; repeat_request; factual_error | commit rule kept (owner's explicit rule); repeat_request now needs the earlier request quoted; factual_error = the user's claim |
| 9 | unit = one statement about one target | applied in the brief (several episodes per turn); E2 keeps unions when merging |
| 10 | several evidence fragments, the user's own version | applied: more_quotes with kinds user_version, reason, condition, exception, draft_more, reaction_more |
| 11 | explicit scope vs analyst's generalisation | applied: scope_explicit; reason/condition/exception quotes |
| 12 | label sets overlap, missing clarity/completeness | genre selection rules added; aspects set kept as the owner gave it |
| 13 | outcome decided too early | applied: moved_on needs its turn; unclear at a part's end; E2 re-links outcomes |
| 14 | check_quotes checks only substrings | applied: DIALOG, ORDER, OUTROLE, NOEVIDENCE, SCHEMA codes |
| 15 | 0.9 similarity can flip a negation | applied in E2's brief: replacement only when negations and numbers are unchanged, else needs_review |
| 16 | coverage accepts headers without bodies | applied: a page counts only when its whole text is in one command output |
| 17 | truncation regex wrong | superseded by 16 |
| 18 | truncation vs empty output vs unfinished command | applied in the brief; max_output_tokens 10000 required |
| 19 | batch reads stale reports | applied: launcher exit code and report mtime checked |
| 20 | pilot selection and metrics defined in advance | applied: measures/pilot-protocol.md written before the pilot; holdout parts added after pilot 1 |
| 21 | gap search and rule provenance as separate jobs | applied as two turns of A2 (gaps fixed first); the gap search was later redone by five readers |
| 22 | stress label sets | owner's closed sets kept; zero findings allowed; supports_new defined against the principle's cited turns |
| 23 | calibrate Luna on relation tasks; strong arbiter | not calibrated separately; Codex Astra J1 acted as the arbiter over every non-supporting signal |
| 24 | freeze the corpus revision | applied: corpus/measures/corpus-revision.json; coverage checks page hashes |
