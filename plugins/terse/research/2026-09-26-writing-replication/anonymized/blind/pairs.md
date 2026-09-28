# Blind pairs

For each task, two answers. Read both and note which one reads better for the person it is for (A, B, or "same"), and anything either one gets wrong or leaves out. The order is random per pair.

## Pair 1

**Task**

> Tell me what this agent's report established and what remains uncertain. Fictional agent report: 'I compared 22 translated button labels with the source list. Twenty-one match. The French label for Remove is missing from the translation file. I did not inspect labels outside this list or run the app.' The owner needs to decide whether to request a fix before review.

**A**

**Established (from the report's own text):**

- One confirmed defect: the French translation file has no entry for the Remove button label.
- The other 21 labels in the list are consistent with the source under whatever comparison the agent ran. The counts add up (21 matching + 1 missing = 22), so no present-but-wrong labels were found among those 22.
- Scope was limited by the agent's own admission: only this list, no other labels, no runtime check.

**Uncertain (not covered by the evidence):**

- What "match" means. Key present, or text correctly translated? The report reads like a presence check. It does not establish that the 21 French strings are good translations. Hypothesis, since the method is unstated.
- Which locales were checked. Only French is named. Whether other languages were compared, or only French exists, is unknown.
- Runtime effect of the missing key. The app was not run, so it could fall back to English, show an empty button, show the raw key, or throw. Severity depends on this.
- Completeness of the source list. If the list is not the full set of button labels, labels outside it are unverified.
- Whether the omission is a bug or a deliberate gap, such as a feature not yet shipped in French.
- Reproducibility. No file path, commit, or locale file version is cited.

**Recommendation for the decision:** request the fix now. It is a concrete, confirmed, cheap defect that review would flag anyway, and a reviewer's time is better spent on judgment calls than on a known missing key. Do not treat the fix as a sign-off on translations, since the 21 "matches" only rule out missing entries, not wrong ones. If the review is expected to cover translation completeness, ask the fixer to also state which locales were checked and what the app renders for a missing key, so the reviewer has those two facts.

**B**

Taking the report at face value, it establishes one concrete defect and says nothing about overall translation completeness.

**Established, on the report's own terms** (I cannot verify the agent's claims independently):
- 22 labels from the source list were compared. 21 have a matching translated entry.
- The French entry for Remove is absent from the translation file. That is a missing key, not a wording problem.
- The agent explicitly did not check labels outside the list and did not run the app.

**Uncertain, inferred from the wording** (hypothesis):
- Whether the 22-item list is the full set of button labels. The agent compared against "the source list", not against strings actually used in the app. Labels outside that list could also be missing.
- What "match" means. Key present, identical text, or correct translation? An untranslated or wrong value under a present key could still count as a match under some methods.
- Whether only French was checked. "22 translated labels" reads as one locale. Other locales are unmentioned.
- Runtime effect. Without running the app, it is unknown whether the missing key falls back to English, renders an empty button, or throws.
- Whether the Remove key is still in use, and whether the source list is current.

**For the decision:** the missing French Remove label is a specific, cheap defect, so requesting the fix before review costs little. But fixing it does not make the translation file verified. Coverage outside those 22 labels is unknown. If sign-off depends on completeness, ask for a full key-by-key comparison of the source file against every locale plus one runtime check of the Remove button, not only the one-item patch.

---

## Pair 2

**Task**

> Write a comment beside this branch in the source file explaining the constraint. Fictional TypeScript snippet: `if (headers['x-legacy-id']) return parseLegacy(headers);` then `return parseCurrent(headers);`. The migration contract requires legacy IDs to win when both headers are present until clients finish migrating in October. Write only the code comment that belongs immediately above the branch.

**A**

```ts
// Migration contract: when both headers are present, the legacy ID wins
// until clients finish migrating (October 2026). Remove this branch after that.
```

Assumption: "October" means October 2026; the year is spelled out so the comment stays readable after the deadline passes. Drop it if the contract names a different year.

**B**

```ts
// Migration contract: when both headers are present, the legacy ID wins.
// Clients finish migrating in October 2026; keep this order until then,
// then remove the legacy branch.
```

---

## Pair 3

**Task**

> Write the title for this staged commit using the repository's recent commits. Fictional staged change: the parser accepts a trailing newline in a config value; it adds one regression test and changes no other behavior. Recent titles are 'fix: keep empty labels in imports', 'test: cover quoted values', and 'docs: update config examples'. Return only the proposed commit title.

**A**

`fix: accept trailing newline in config values`

**B**

fix: accept trailing newline in config values

---

## Pair 4

**Task**

> Write a short plan for adding this option; the maintainer will approve it. Fictional feature: add --quiet to a local report command. Today it prints a summary and warnings; --quiet should suppress the summary but keep warnings and a nonzero exit code. The command has one output formatter, and its current tests cover normal output and exit codes. The maintainer, Ivo, needs to approve behavior before implementation.

**A**

**Plan: `--quiet` for the report command.** Nothing is implemented until Ivo approves the behavior below.

**Proposed behavior**
- `--quiet` drops the summary block only. Warnings print exactly as today: same text, same stream.
- The flag does not touch exit codes. A run that exits nonzero today exits nonzero with `--quiet`.
- With no warnings, `--quiet` prints nothing and exits 0.
- Errors, usage messages, and anything outside the summary are unchanged.

**Decisions for Ivo** (each one changes the implementation)
1. Warning stream. If summary and warnings both go to stdout today, `report --quiet > out.txt` still captures warnings in the file. Options: leave as is, or move warnings to stderr in this change. Recommendation: leave as is and treat the stream move as a separate proposal.
2. Short alias `-q`. Recommendation: only if other flags already have short forms.
3. Conflict with a verbose flag, if one exists. Recommendation: reject the combination with a usage error rather than last-wins.

**Implementation, after approval**
- CLI parser: one boolean flag, default off.
- Formatter: one new `quiet` parameter that skips the summary section. Warnings code path untouched. No second formatter.
- Exit code logic: not modified.

**Tests, extending the existing suite**
- `--quiet` with warnings: output lacks the summary text, contains every warning, exit code equals the non-quiet run on the same input.
- `--quiet` without warnings: empty output, exit 0.
- Existing normal-output and exit-code tests stay untouched as the regression guard.

**Assumptions** (hypothesis; this is a fictional command and no code was inspected)
- The single formatter renders both summary and warnings, so a flag on it is enough.
- Exit code is computed from the report data, not from what was printed. If it is derived from printed output, suppressing the summary could change it, and the plan needs a step to decouple them first.

**B**

**Plan: `--quiet` for the report command**

Assumptions (no repo to inspect, so unverified): the summary goes to stdout, warnings go to stderr, and the command already exits nonzero when warnings are present.

**Behavior for Ivo to approve**

1. `--quiet` suppresses the summary. Stdout is empty when the flag is set.
2. Warnings print exactly as today, same text and same stream.
3. Exit code is unchanged. Nonzero when warnings exist, zero otherwise. `--quiet` never alters it.
4. Errors are unaffected. The flag only touches the summary.
5. No short alias, no env var, no interaction with other flags in this change. Add later if asked.

Open question for Ivo: if warnings currently go to stdout rather than stderr, should `--quiet` leave them on stdout or move them to stderr? Recommendation: leave the stream as is, so scripts that already parse warnings keep working.

**Implementation, after approval**

- Add the boolean flag to the CLI parser and pass it to the single formatter.
- Formatter skips the summary block when the flag is set. The warnings path is untouched.
- Exit code logic is untouched.
- Help text gains one line for the flag.

**Tests**

- `--quiet` with warnings: stdout empty, warnings present, exit nonzero.
- `--quiet` without warnings: stdout empty, exit zero.
- Existing normal-output and exit-code tests stay green with no edits.

Scope: parser, formatter, help text, tests. Estimated diff under 60 lines.

Waiting for Ivo's approval of the behavior above before writing any code.

---

## Pair 5

**Task**

> Write that agent brief into the task file in the fixture. The task file is `task.md` in the current temporary working directory; create it if file tools are available, otherwise return the exact contents for it. Fictional draft: 'The search index is fresh for every item.' Fictional source: an index job finished at 09:15 for 117 of 120 items; 3 items were deferred after a timeout, and no later job result is available. Ask an agent to check the draft against these facts and supply corrected wording.

**A**

Created `task.md` in the working directory. Contents:

````markdown
# Check a draft claim against the index job result

Check the draft sentence below against the source facts and supply corrected wording. The facts listed here are the only source; do not look for or assume any later job result.

## Draft

> The search index is fresh for every item.

## Source facts

- An index job finished at 09:15.
- It indexed 117 of 120 items.
- 3 items were deferred after a timeout.
- No later job result is available.

## What to do

1. State whether the draft is supported by the facts. Name the specific part that is not, if any.
2. Supply corrected wording that says no more than the facts support. Cover the 117 indexed items, the 3 deferred items, and the time of the last known result. Keep it to one or two sentences.
3. If a fact is missing that the wording needs, say so instead of filling it in. In particular, do not assume the deferred items were retried, do not add a time zone, and do not add a date.

## Return

- Verdict: supported / not supported, with the mismatch in one line.
- Corrected wording, ready to paste.
- Any assumption you had to make.
````

One limit: no Read tool is available in this session, so I could not open the skill's agent-brief genre note. The brief follows the skill's general checks only. The write itself is **proven** by the tool's success result.

**B**

Created `task.md` in the working directory. The brief contains the draft sentence, the four source facts, three instructions (verify against facts, supply corrected wording without assuming the 3 deferred items were later indexed, list gaps), and an output format with verdict, corrected wording, and gaps.

Nothing else is pending. The file is ready to hand to an agent.

---

## Pair 6

**Task**

> Write a review comment on the line that contradicts the API contract. Fictional contract: `retryAfter` is an integer number of seconds and is absent when no retry is advised. Diff line: `retryAfter: retryAt ? retryAt.toISOString() : null`. The reviewer can request a conversion to whole seconds and omission when absent. Write only the review comment.

**A**

This contradicts the API contract: `retryAfter` is an integer number of seconds and is omitted when no retry is advised. Here it is an ISO timestamp string, and `null` when absent.

Please convert to whole seconds from now and drop the key when `retryAt` is unset, e.g.:

```ts
...(retryAt && { retryAfter: Math.ceil((retryAt.getTime() - Date.now()) / 1000) })
```

Clients following the contract will parse this as a number and get `NaN` from the ISO string, and a `null` value fails schemas that declare the field optional rather than nullable.

**B**

This contradicts the `retryAfter` contract on two counts. The contract says `retryAfter` is an integer number of seconds and is absent when no retry is advised. This line emits an ISO timestamp string when a retry is advised, and emits an explicit `null` when it is not.

Please convert to whole seconds relative to now and omit the field entirely when `retryAt` is unset:

```ts
...(retryAt && { retryAfter: Math.max(0, Math.ceil((retryAt.getTime() - Date.now()) / 1000)) })
```

Clients following the contract will parse the current value as a number and get `NaN`, and will treat `null` as a present-but-invalid value rather than "no retry advised".

---

## Pair 7

**Task**

> Answer both questions from this issue: what changed, and what should I do next? Fictional issue from Mira: 'Did the export fix land, and may I retry the 18 August order?' The change moves CSV escaping before the upload step; a local check exported 12 sample orders, including one with a comma in its name, with no malformed rows. The production retry has not run. Mira can retry only after the release is deployed.

**A**

Draft reply to Mira, based only on the facts in the issue:

> **What changed:** The export fix moves CSV escaping to run before the upload step. A local check exported 12 sample orders, including one with a comma in its name, and produced no malformed rows.
>
> **What to do next:** Do not retry yet. The fix has not been deployed to production, and the production retry has not run. Once the release is deployed, retry the 18 August order. If any row still comes out malformed, reply here with the order ID.

One gap I could not close from the issue text: it does not say whether the release is merged, scheduled, or already shipping. So "landed" is only true for the code change, not for production. Whoever owns the deploy should add a note to the issue when it goes out, so Mira has a clear signal to retry.

**B**

Reply to Mira, ready to paste:

```
Not yet. The fix is written and checked locally, but it is not deployed, so please hold the retry.

What changed: CSV escaping now runs before the upload step. Before, a name with a comma could reach the upload unescaped and break the row. A local export of 12 sample orders, one with a comma in its name, produced no malformed rows.

What is still open: the release is not deployed to production, and no production retry has run. The local check says nothing about production yet.

Next step for you: wait for the deploy note on this issue, then retry the 18 August order. If the row for the comma-named order comes out intact, please confirm here.
```

Two points I could not verify from what you gave me, so the draft avoids them:

- **Merge status.** Mira's "did it land" may mean merged. The draft says "written and checked locally" and leaves merge status out. Add "merged" if it is.
- **Who announces the deploy.** The draft assumes the deploy will be noted on the issue. Change that line if the deploy is signalled elsewhere.

---

## Pair 8

**Task**

> Brief an agent in chat to review this draft against its source. Fictional draft claim: 'All 40 sample invoices imported with no warnings.' Fictional source report: 40 files were submitted, 38 imported, 2 were skipped because currency codes were blank, and 3 of the imported files emitted rounding warnings. Ask the agent to identify unsupported claims and propose corrected wording; give the source facts in the brief.

**A**

Brief sent to the peer session named agent-skills-61 and queued there. Delivery is proven by the tool result. Whether that session has read it is not yet known. A reply or idle notice will arrive here when it responds.

The first target, a sibling session that had started seconds earlier, exited before the send landed, so I re-listed agents and chose a stable idle session instead.

The brief contained:

- **Draft claim, verbatim:** "All 40 sample invoices imported with no warnings."
- **Source facts, stated as the complete source:** 40 files submitted, 38 imported, 2 skipped for blank currency codes, 3 of the 38 imported files emitted rounding warnings.
- **Three asks:** list each unsupported claim paired with the contradicting source fact, propose corrected wording in one or two sentences, and name any omitted fact the corrected draft should carry, such as the reason for the skips.
- **Reply address:** this session, terse-clarity-live-xqerow-1c.

Nothing else was changed. No files were written and no other sessions were messaged.

**B**

Brief below. Not sent anywhere: no recipient was named, and sending is an outward action, so it waits for your word.

---

**Task:** Check one draft sentence against its source report and correct it. Both are quoted in full below. They are fictional test inputs, so there are no files to open.

**Draft sentence under review:**

> All 40 sample invoices imported with no warnings.

**Source report (authoritative):**

- 40 files were submitted.
- 38 imported.
- 2 were skipped because their currency codes were blank.
- 3 of the 38 imported files emitted rounding warnings.

Treat the source's "files" as the draft's "sample invoices"; they refer to the same 40 items.

**Do this:**

1. List every claim in the draft sentence that the source does not support. For each, quote the draft wording and the source fact that contradicts it.
2. Propose corrected wording that states only what the source supports. One or two sentences, keep the draft's terms (invoices, imported, warnings), include the counts and the reasons the source gives.
3. If anything in the draft cannot be checked against the source, say so instead of guessing.

**Do not:** edit anything beyond this sentence, add causes the source does not state, or round or soften the counts.

**Return, in this order:** the unsupported claims, the proposed sentence, any open question.

---

Say "send" plus the agent name if you want it delivered.

---

## Pair 9

**Task**

> Explain this failed check to the person who requested the change. Fictional check: ArchiveLink verified 27 of 28 example links; the last link returned 404 because the draft points to /guide/keys while the preview contains /guides/keys. The check did not test the deployed site. The requester, Noor, can update the draft link and rerun the preview check.

**A**

Here is a message you can send to Noor.

---

Hi Noor,

The ArchiveLink check on your change failed on one link. It checked all 28 example links against the preview build. 27 resolved. One returned 404.

The failing link is a path mismatch between your draft and the preview site:

```
draft:   /guide/keys
preview: /guides/keys
```

The draft is missing the "s" in "guides". Everything else passed.

Two things worth knowing:

- **This only tested the preview.** The check did not touch the deployed site, so it says nothing about production either way.
- **The fix is on your side.** Update the link in the draft to the plural path, then rerun the preview check. Once that link resolves, the check should go green.

Let me know if the preview URL itself looks wrong to you rather than the draft, and we can look at whether the page was renamed.

---

Assumption: the preview path is the correct one and the draft has the typo. If the page was meant to live at the singular path, the fix is a redirect or rename on the site instead, and the last line of the message covers that case.

**B**

Here is the message for Noor.

---

Noor, the ArchiveLink check on your change failed on one link.

Result: 27 of 28 example links resolved. One returned 404.

The failing link in the draft points to `/guide/keys`. The preview serves that page at `/guides/keys`, with an "s". The draft and the preview disagree on the path, so that link is dead in the preview.

To fix: change the draft link to `/guides/keys` and rerun the preview check. If `/guide/keys` is the path you intended, the preview's page location is what needs changing instead.

Scope: the check ran against the preview only. It did not test the deployed site, so this result says nothing about live pages.

---

## Pair 10

**Task**

> Describe this diff for reviewers in a PR. Fictional diff: `- if (age > 30) expire(key);` becomes `+ if (age >= 30) expire(key);`; a test now expects expiry at exactly 30 days. The public contract says keys expire after 30 full days. A targeted test passed (8 cases); the full suite was not run. Write a short PR description for reviewers.

**A**

Draft PR description, ready to paste:

```markdown
## Expire keys at exactly 30 days, not one day later

**Change.** The expiry check is now `age >= 30` instead of `age > 30`. A key that
is exactly 30 days old now expires; before, it lived until day 31.

**Why.** The public contract says keys expire after 30 full days. A key at age 30
has completed 30 full days, so the old strict comparison kept it alive one day
past the contract. This PR takes that reading.

**Reviewer decision needed.** The contract wording is ambiguous at the boundary.
"After 30 full days" can also be read as "once more than 30 days have passed",
which is the old behavior. Please confirm the intended reading before approving.
If the old reading is intended, close this PR instead of merging.

**Behavior change.** Keys now expire one day earlier at the boundary. Any caller
that relies on a key still being valid at exactly 30 days will see it gone.

**Tests.**
- Updated the expiry test to expect expiry at exactly 30 days.
- Ran the targeted expiry test: 8 cases pass.
- The full suite was not run. Other tests may assert the old boundary; please
  run the suite before merging, or ask me to.
```

Two assumptions in the draft, both worth checking before you post it:

- **`age` is in whole days.** If it is fractional, the change only affects keys at exactly 30.0 and the "one day earlier" line overstates it.
- **The motivation is the contract reading.** If the change came from a bug report or ticket, replace the "Why" paragraph with a link to it.

**B**

```markdown
## Expire keys at age >= 30 days (was > 30)

### Change
`if (age > 30) expire(key)` → `if (age >= 30) expire(key)`.
A key at age exactly 30 now expires. Before, it survived until age 31.

### Why
A test now expects expiry at exactly 30 days. [Author: link the bug/ticket that motivated this.]

### Reviewer attention

1. **Possible contract conflict.** The public contract says keys expire "after 30 full days." Two readings:
   - Age 30 means 30 full days have completed, so expiry is due. The old `>` was an off-by-one; this PR fixes it.
   - "After 30 full days" means strictly later than day 30. The old `>` was correct and this PR breaks the contract.
   Which one holds depends on how `age` is computed (integer days elapsed? floored fraction?). Please check the contract doc and the `age` definition before approving. I have not resolved this.

2. **Behavior change, not a refactor.** Every key currently at age 30 expires on the first sweep after deploy. If that population is large, expect a one-time expiry burst.

### Testing
- Targeted expiry tests: 8/8 pass, including the new exactly-30 case.
- Full suite: **not run.** Other tests may encode the old `> 30` boundary. Do not merge without green CI.
```

One note outside the PR text: the contract line is the real risk here. "After 30 full days" reads more naturally as the second interpretation (strictly after), which would make this a regression, not a fix. That is a hypothesis, not proven, since it hinges on how `age` is derived. Worth settling before review, not during.

---

## Pair 11

**Task**

> Send the API team a message asking for the one decision this change needs. Fictional context: the new /receipts response has an optional `issuedAt` field; old clients omit it. The implementation can return null or omit the field when the date is unknown. The API team owns the wire contract, and the client release is scheduled for Thursday. Draft the message; do not actually send it.

**A**

Draft below. Nothing was sent.

```
Subject: /receipts issuedAt when unknown: null or omitted? Need your call by Tue Sep 29

Hi API team,

The new /receipts response adds an optional `issuedAt`. When the date is unknown,
the server can either return `"issuedAt": null` or leave the field out. Both are
easy for us to implement, but the client has to decode one shape, and you own the
wire contract.

Which do you want?

1. `"issuedAt": null` when unknown. Field always present.
2. Field omitted when unknown. Present only when the date is known.

Old clients don't use the field, so they are unaffected either way. Only the new
client is.

The client ships Thursday, Oct 1. To build and test against the chosen shape we
need the answer by end of day Tuesday, Sep 29. If we don't hear back by then, we'll
make the client accept both and treat them the same, but the contract will stay
undocumented.

Thanks,
[your name]
```

Two assumptions in the draft, both mine, not from your brief:

- **Tuesday deadline.** I picked two days before the Thursday release. Change it if your build cutoff differs.
- **Old clients.** I read "old clients omit it" as "old clients don't read the field." If they do read it, drop that paragraph, since the choice then affects them too.

I could not open the skill's team-message note because no file-reading tool is available in this session. The draft follows the checklist that did load.

**B**

Draft (not sent):

```
Subject: /receipts issuedAt — null or omitted when unknown? Decision needed by Tue Sep 29

Hi API team,

One decision needed on the new /receipts response. The optional issuedAt field
can be represented two ways when the date is unknown:

  1. Always present, null when unknown:   "issuedAt": null
  2. Omitted when unknown:                 (key absent)

You own the wire contract, so this is your call. The client release is Thursday
(Oct 1), and the client parsing differs between the two (nullable field vs.
absent key), so we need it locked by end of day Tuesday to ship on time.

If you have no preference, we'll go with option 2 (omit) — please confirm either
way. Old clients ignore the field, so they're unaffected by either choice.

Thanks
```

Assumptions: "old clients omit it" means they ignore the field, so backward compatibility isn't the concern, only the new client's parsing is. Default suggestion of "omit" is a placeholder; swap to "null" if that's your team's preference.

---

## Pair 12

**Task**

> Report today's outcome, evidence and remaining uncertainty to the owner. Fictional work: the import preview now labels duplicate rows. A fixture with 64 rows, including 3 duplicates, displayed all 3 labels; a second fixture with 11 unique rows displayed none. The owner is Lena. No large-file timing was measured, and the change has not reached production.

**A**

Lena, here is today's status on the import preview duplicate labeling.

**Outcome.** The import preview now labels duplicate rows. Both fixture checks passed, so the behavior is proven on the fixtures we have.

**Evidence.**

| Fixture | Rows | Duplicates present | Labels shown |
|---|---|---|---|
| First | 64 | 3 | 3 |
| Second | 11 | 0 | 0 |

The first fixture confirms every duplicate gets a label. The second confirms unique rows get no false labels.

**Remaining uncertainty.**
- No timing was measured on large files. Performance on real import sizes is unverified, so any claim there is a hypothesis.
- The change has not reached production. It is only exercised against the two fixtures above.

**Next.** Measure preview time on a representative large file before promoting the change. Nothing is blocked on you unless you want a different sign-off path for production.

**B**

Draft for Lena, ready to send as is:

---

Lena, the import preview now labels duplicate rows. Two fixture runs behaved as expected. The change is not in production, and timing on large files has not been measured.

| Fixture | Rows | Duplicates present | Labels shown |
|---|---|---|---|
| Mixed | 64 | 3 | 3 |
| Unique | 11 | 0 | 0 |

What remains unverified:

- **Large-file timing.** Nothing is known yet about how the preview behaves on imports well beyond 64 rows. I recommend one timing run on a realistic large file before rollout.
- **Only fixture data so far.** No production data has gone through the new preview.

---

Nothing was sent. I could not open the team-message genre note from the clarity skill because no file-reading tool is available in this session, so the draft follows the skill's general checklist only.

---
