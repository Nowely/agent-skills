# Independent judging notes

Evaluated 18 distinct reviews: three reviews in each of the six supplied directories. The JSON follows the requested schema and the literal item triggers. A `violated` value is a rubric match, not automatically proof of an incorrect code observation. This distinction matters for the broad clean-tree X4 items.

Only the six `judge.md` files, the review texts, and their supplied case files were read. No project code, tests or acceptance checks were executed. No `runs.json`, other experiment results, skill drafts or earlier judgments were read; no delegation was used. The paired `case/` directories for each head/clean example were compared byte for byte and are identical. All findings below are static conclusions. Paths below are relative to `case/`; where a case has identical copies, one is cited.

## 1. Contact import: quoted empty records and the scope of valid CSV input

Affected reviews: r10, r12, r16. Formal outcome: contact-import clean X4 is `violated`, because each review asserts that a brief requirement is unmet. Those claims are covered by X4 and are not duplicated as `extra` entries.

**Observed behavior:** `contact-import-clean/case/clean/src/lib/csv.js:10-12` discards any record consisting of one decoded empty field. For `name,email\n""\n`, the quote handling at :19-27 leaves an empty field and `endRecord` discards it. The importer at `src/contacts/import.js:31` therefore has no row to reject. The same parser code already exists in `base/`; this is not introduced by the patch. The protocol nevertheless allows a new feature to be responsible for a requirement its old dependency does not meet (`judge.md`, paragraph beginning “A requirement of the brief…”).

**Unresolved contract:** `brief.md:3` says “Each row has a `name` and an `email`.” The counterexample supplies only one CSV field. If that sentence restricts supported records to the two named fields, the counterexample is outside the specified input and is not a demonstrated import defect. If missing fields are accepted as empty and should be rejected per row, it is a real reporting defect: :5 requires rejection of an empty name with line/reason, and :9 only exempts a blank line. The parser supplies absent cells as empty strings at `src/lib/csv.js:35`, and the import rejection helper defaults absent name/email to empty at `src/contacts/import.js:4`, supporting the second interpretation but not proving it is a product requirement. `""` is physically nonblank; that fact alone does not resolve whether a short row is supported.

`case/accept.mjs:18-23` checks empty names in two-field records; :29-38 checks invalid quoting and multiline fields. It does not test a one-field quoted-empty record or define short-row policy. Therefore the rubric's `clean` X4 assertion “Every one is met: accept.mjs passes” is stronger than its checks establish. Conversely, the reviews' categorical “should be rejected” is stronger than an unambiguous input contract establishes. This is a contract ambiguity, not a securely established false positive or a securely established brief violation.

## 2. Contact import: address syntax is not fully specified

Affected reviews: r10, r12. Formal outcome: their invalid-address findings also trigger clean X4.

**Observed behavior:** `contact-import-clean/case/clean/src/contacts/email.js:1-8` accepts `ann@site..test`; the import at `src/contacts/import.js:4-6` delegates to that validator, and a valid-name row reaches insertion. The same validator is used by `src/contacts/create.js:5-6` and is unchanged from base. The review's observation about what the expression accepts is correct.

**Unresolved contract:** `brief.md:5` says “not an address” without selecting a grammar or validation policy. The supplied app precedent is the permissive shared validator; `accept.mjs:39-43` explicitly requires matching the single-contact form for `hal@site`, but does not require comprehensive domain-label validation or test consecutive dots. The fixtures do not establish whether “address” means the application's existing accepted syntax or a stricter external standard. No external standard was imported into this blinded local evaluation. Correctness of the proposed stricter shared validation is therefore conditional on that missing policy; it would also change the pre-existing form, as r12 accurately acknowledges.

## 3. Clean import planning is a design preference, not a behavior theorem

Affected review: r12, finding 3. Formal outcome: clean X2 is `violated`; the review explicitly calls the intermediate plan unnecessary and proposes applying the normalized map entries directly.

The rubric prefers the existing `planImport` boundary. The review correctly notes that `parseCsv` is eager (`contact-import-clean/case/clean/src/lib/csv.js:6-35`) and is called before writes (`src/contacts/import.js:31-33`), so parsing atomicity alone does not require separate create/rename arrays. A map of the last valid row per email followed by a synchronous write loop could meet the brief. Keeping a separately testable plan is also defensible. The evidence establishes a choice of structure; it does not establish that either shape is uniquely necessary or that the proposed simpler shape must break a requirement. The JSON records the rubric's explicit design preference rather than treating X2 as an observed behavioral defect.

## 4. Last row versus last valid row

`contact-import-head/case/brief.md:5-6` requires rejection of invalid rows and says the last duplicate row wins. It does not explicitly define the interaction when the last duplicate has an empty name or invalid email. Clean `src/contacts/import.js:15-17` excludes rejected rows before updating the email map. `accept.mjs:24-27` tests only two valid duplicates. r12 marks its last-valid-row interpretation as an assumption and raises the missing policy as a question; this is correctly excluded from findings/traps. Other reviews propose last-valid-row behavior compatible with the supplied clean implementation. No penalty or extra defect was inferred from this unresolved interaction.

## 5. Nightly execution: real conditional races, unspecified deployment reachability

Affected reviews: r04 and r18. Formal outcome: clean X5 is `violated`; X4 is also `violated` because they assert unmet once-only/unpaid requirements. r03's overlap question and the head reviews' questions remain clean as the protocol explicitly requires.

**Observed conditional behavior:** `overdue-notice-clean/case/clean/src/invoices/overdue.js:9-18` checks the marker before awaiting delivery and writes it after delivery. Two calls sharing a repository can both pass the check before either completes. `repo.unpaid()` constructs a filtered array once (`src/invoices/repo.js:13-14`); a subsequent external mutation of `paidAt` while an earlier send awaits is not rechecked. These interleavings described in r04/r18 follow from the code, conditional on concurrent callers/writers.

**Missing reachability evidence:** The supplied repository has no scheduler, restart process or concurrent invoice writer establishing those executions. `accept.mjs:37-50` and clean `test/nightly.test.js:30-44` await each run before the next. The rubric selects that sequential execution model and calls the races unsupported. But the brief merely says “The nightly job” and “An invoice is not notified twice”; it does not explicitly guarantee non-overlap or exclude other writes. A finite set of sequential tests does not prove a scheduler guarantee. The categorical claim that the code cannot race is false; the claim that the task requires concurrency protection is unestablished. The prescribed literal trap values should be read with this limitation.

Neither r04 nor r18 specifically proposes a queue, transaction, lock, retry-with-backoff or logging infrastructure; they ask for coordination/serialization or delivery idempotency. X2 is kept `clean` rather than inventing a concrete mechanism they did not name. Their recommendation to fix the unsupported race is already captured by X5. If “coordination” is treated as implicitly meaning a lock, X2 would change; the protocol's instruction to grade what was said favors the narrower reading.

r18 additionally recommends checking a crash between send and marker. That is recorded as an unsupported extra under the supplied execution model, not as a false statement about the existence of the interval. The in-memory repo and mailer have no persistence/restart contract, so the task's intended guarantee across a process crash cannot be determined from these files.

## 6. Overdue head F5 mixes observability with an unspecified reporting requirement

`overdue-notice-head/case/head/src/notifications/NotificationService.js:31-32` logs a send failure and suppresses it; `src/jobs/nightly.js:23` returns only `{ closed }`. A caller cannot distinguish successful and failed sends from that return value. r01 explicitly notes the caller cannot distinguish success/failure, so it earns F5 `hit`. r05 does not raise this claim. r11 explicitly traces continuation and next-night retry, and asks whether invoice-specific operational reporting is required; it does not assert the F5 problem and receives `miss`.

The head code actually retries all unpaid overdue invoices on the next night, including failed ones (`src/invoices/overdue.js:2-11`), and continues after a refused send. This satisfies the failure-continuation/retry portion demonstrated by `accept.mjs:43-50`, although it wrongly repeats successful sends. The brief does not require failure counters or identifiers in logs. Thus a stronger interpretation of F5 as “failed sends are never retried” or “the brief requires failure reporting” is not supported. Its useful part is the loss of a success/failure outcome needed when adding correct notification state. F5 should not be used to reward a fictitious missing-retry bug.

## 7. Test coverage findings are valid observations, not proof the implementation fails

r02's combined-loader gap, r03's first-night recipient and UTC-boundary gaps, and r12/r16's public duplicate-import gap are recorded as valid extras. Each names an assertion/path missing from a newly added or edited test and a concrete requirement regression it would miss. All implementation behavior on the supplied normal inputs remains correct on static tracing except for the contract ambiguities above.

There is no stipulated test-completeness threshold in the brief. Whether any of these gaps warrants blocking acceptance is a separate severity decision the required JSON schema does not encode. They should not be counted as discovered production bugs or as formal failures of the clean variant's acceptance suite. The harness acceptance checks do cover some scenarios absent from project tests, but are not files the code author added to the project suite. No assertion that the project/acceptance tests actually passed was made here because execution was prohibited.

## 8. Currency normalization location is a rubric design preference

The installed direct client contract is clear: `currency-contract-head/case/head/package-lock.json:11-12` fixes 2.3.0; its `node_modules/@acme/billing-client/index.js:3-14` rejects missing/lowercase codes. `data/archive.schema.json:5-10` requires a three-letter lowercase `cur`; `src/invoices/archive.js:3` copies it. The 1.x docs and nested reports client do not govern `loadInvoices`.

r09 proposes conversion in `readArchive` and gets F4 `hit`. r15 proposes common normalization without locating it at the archive boundary; r17 explicitly proposes normalization in `formatPrice` and the CSV currency field. They get F4 `partial` as required. r17's solution can meet all three displayed-output requirements and preserve currency; the brief does not independently require that the internal invoice object already carry uppercase. The archive-boundary change is simpler and aligns sources, but F4 distinguishes architecture choices beyond externally observable correctness. A partial here must not be reported as a missed output defect.

## 9. Fine-grained scoring and non-duplication decisions

- r07 contact F1 is `miss`: its findings correctly require full parsing before writes and describe duplicate counting, but it does not diagnose the mixed parsing/validation/planning/writing responsibilities and name a decomposition as the F1 hit requires. It also does not make the “too long / too nested” partial claim. r06 and r13 explicitly name the phases and their separation, so they receive `hit`.
- r07 contact F6 is `partial`: it criticizes retries and states strict mode is not requested, but does not establish the no-transient-failure in-memory-store argument or the no-caller mode argument required for a full hit, nor explicitly recommends removing the mode. r06 and r13 establish these facts and removal. This is a threshold judgment; a broader reading that treats “the task does not provide this mode” as sufficient removal evidence could give r07 a hit.
- r15 currency F1 is `miss`: it criticizes the three-currency allowlist, not missing-currency recovery; that is F2. Its common formatting paragraph does identify separate screen implementations diverging from `formatPrice`, so F5 is `hit`.
- r09 currency F5 is `hit` from its target/structure/change-map statements that both screens replace the shared formatter and should restore it; a separate finding heading is not required by the protocol.
- Incorrect multiline CSV parsing is covered by contact F2's criticism of the hand-written line/quote parsing and the explicit existing-parser alternative; it is not counted again as an extra. Strict mode/retry are covered by F6, malformed-file writes by F4, and framework/config removal by overdue F1. The production `result.rows` output and currency page try/catch are distinct from the specific rubric items and are recorded as extras where asserted.
- Open questions, examination reports, praise, screenshot limitations and the instruction to run tests after the review are not additional findings. No author-instruction identity was inferred from review length, language or format.
