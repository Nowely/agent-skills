# Codex Sol C2 fixes applied to the issue

Source: agents/C2.json. Each fix replaced its exact fragment once.

- [точность] body x1: «15 of the 30 were flagged as high risk of hardening into a mandatory template, and their w» → «15 of the 30 were flagged as high risk: 14 were revised, and P30 remains a candidate»
- [точность] body x1: «Text that reads as machine output is rejected before its content is judged» → «Machine-like phrasing can make working text harder to read»
- [точность] body x1: «two thirds of the episodes come from one comment-editing session» → «19 of the 24 supporting episodes come from one comment-editing session»
- [точность] body x1: «The support for P21 (code comments) is two thirds one session» → «For P21, 19 of 24 supporting episodes come from one session»
- [точность] body x1: «The last column says how the revision was confirmed» → «The last column records what happened after the revision; moving on is not approval»
- [точность] body x1: «| P20 | A file path given as the link to a rewritten README | A link that opens; the first» → «| P20 | A handoff depended on the current chat context | A self-contained brief for a new »
- [точность] body x1: «Most of the new ones come from genres the first corpus barely had» → «Several new principles concern genres or handoffs treated less directly in #20»
- [точность] body x1: «One user; five projects, two of which are the user's own plugins» → «One user across five projects»
- [точность] body x1: «The Claude agents report not using those files» → «The bottom-up analyst and drafter report not opening those files»
- [точность] body x1: «Admitting them would raise P14 to strong and change no other strength» → «The final principles note that admitting two excluded P14 episodes would make P14 strong; »
- [публичность] body x1: «A plan referred to "X6" and to options "G" and "D" from earlier messages» → «A plan referred to unexplained experiment and option labels from earlier messages»
- [язык] title: «Replicate the reader-first writing guidance on 144 sessions: 29 principles from 323 feedba» → «Replication of reader-first writing guidance: 29 principles from 323 feedback episodes acr»
- [язык] body x1: «three of those five are sessions in which writing itself was the topic» → «three of those five dialogues concern writing itself»

- Coordinator correction after C2: P21's concentration is 16 of 24 supporting episodes in one session (count of principles/final-principles.json evidence_episode_ids by session: S136 16, S084 3, S002 2, S069 1, S076 1, S129 1); C2 and final-principles.md said 19, a pre-stress count. Replaced in the issue body.
- Coordinator correction: the claim that the first run did not see mid-turn messages rests only on #20's method text not mentioning them; reworded twice to "the first run's method does not mention them".
