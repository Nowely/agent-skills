## Change
Import contacts from CSV, rejecting invalid rows and reporting created and updated contacts. Add bulk import to the address book.
- Parse and validate rows, then insert or rename contacts.
- Return counts and rejected rows; add import tests.
Sources: brief.md (task text); HEAD commit and diff

## Verdict
The importer handles a simple file but does not satisfy several core requirements: it writes before detecting parse errors, mishandles multiline records and repeated addresses, and accepts invalid addresses. It also silently discards some valid contacts and provides a mode that stops on invalid rows.
Target: Parse the whole file with parseCsv before touching the store, validate rows with isEmail and collect rejected line numbers. Deduplicate valid rows by normalized email, keeping the last row, then look up and write each contact once and count it once. Reuse ContactStore and its normalization; retain the import entry point and focused tests.
Recommendation: Fix in place, starting with full-file parsing before writes and deduplication, then use the existing email validator and remove the unsupported modes and silent skips. Add tests for each required outcome.

## Findings
### 1. Parsing happens incrementally and unclosed quotes are accepted (behavior; traced)
`src/contacts/import.js:13`: For name,email followed by a valid row and then a row with an unclosed quote, the valid row is inserted before the malformed row is read; inQuotes is never checked, so no parse error is raised. The existing parseCsv throws CsvError for an unclosed quoted field. This breaks the no-writes-on-parse-failure requirement. Breaks requirement 5.
Fix: Call parseCsv on the entire text before any store write, and propagate its parse error.

### 2. Quoted line breaks split one CSV record into multiple rows (behavior; traced)
`src/contacts/import.js:13`: A valid record such as "Ann\nSmith",ann@site.test is split before quote handling: its first half is rejected for missing email, and the second half is also treated as a separate row instead of completing the record. The existing parser preserves quoted newlines and records their starting line. Breaks requirement 1, 2.
Fix: Use parseCsv records and their line property for validation and reporting.

### 3. Repeated emails are counted as multiple operations (behavior; traced)
`src/contacts/import.js:76`: Two valid rows for a new email insert it on the first row and rename it on the second, returning created=1 and updated=1 for one contact. For an existing email updated is incremented twice. Case and spaces still match because the store normalizes them, but the required once-per-file count is lost. Breaks requirement 3, 4.
Fix: Deduplicate valid rows by normalized email before writes, retain the last row, and count each resulting contact once according to its state before import.

### 4. The local email check accepts values the address book rejects (behavior; traced)
`src/contacts/import.js:1`: The regex accepts ann@site and a@b@site.test, while src/contacts/email.js isEmail rejects both; these rows are inserted instead of being reported as invalid. The single-contact form uses isEmail as the project address contract. Breaks requirement 1.
Fix: Use the existing isEmail function for import validation.

### 5. Valid addresses at example.invalid are silently skipped (behavior; traced)
`src/contacts/import.js:72`: Ann,ann@example.invalid passes the project's isEmail check but is neither imported nor rejected; the added test explicitly pins this behavior. The task gives no domain exclusion. Breaks requirement 2, 4.
Fix: Remove the domain skip and replace its test with an assertion that the contact is imported.

### 6. Strict mode aborts on an invalid row (behavior; traced)
`src/contacts/import.js:59`: With mode=strict, an empty name or invalid email throws instead of recording the rejection and continuing; a valid earlier row may already have been written. The new test requires the abort although the task says rejected rows do not stop import. Breaks requirement 1.
Fix: Remove strict mode and always append a rejection and continue.

### 7. Insert failures are retried and then silently discarded (necessity; traced)
`src/contacts/import.js:83`: ContactStore.insert synchronously throws on a duplicate, which findByEmail has just excluded; its implementation shows no transient failure for retry to address. Any other insert error is swallowed after three attempts, so the caller receives a successful result without the row or an error.
Fix: Insert once and let errors propagate; remove the retry constant and loop.

### 8. Extra legacy mode and returned rows add an unsupported interface (necessity; judgment)
`src/contacts/import.js:4`: The task specifies CSV and counts plus rejections, but adds neither a semicolon format nor a list of accepted rows. The new option, separator branch, result.rows and corresponding tests add behaviors that callers would have to maintain without a stated requirement.
Fix: Remove the mode parameter, legacy separator branch and rows result; use the project CSV parser.

### 9. Tests do not exercise the required import outcomes (tests; traced)
`test/import.test.js:6`: The sole general test checks counts and rejected length only, so wrong names, line numbers or reasons, missing last-row wins, non-normalized duplicate handling, and writes after malformed input can all regress without failing. It also has no invalid-email case. Breaks requirement 1, 2, 3, 4, 5.
Fix: Test stored names and normalized identities, duplicate counts and last row, rejection line/reason with continued import, quoted multiline rows and parse failure with an unchanged store.


## Ideas
none

## Structure
- `importContacts -> ContactStore`: selects input mode, parses CSV, validates rows, writes contacts, counts and reports results. Keep.
- `ContactStore`: looks up normalized emails, inserts and renames contacts. Existing.
- `parseCsv`: parses CSV records before returning, reports starting line and throws on an unclosed quote. Existing.
- `isEmail`: validates normalized addresses. Existing.
- `normalizeEmail`: normalizes email case and whitespace. Existing.
Target:
- `importContacts -> parseCsv, isEmail, normalizeEmail, ContactStore`: parses entire file, validates and deduplicates records, writes each contact once and reports results. From the change.
- `parseCsv`: parses CSV records and reports starting line. Existing.
- `isEmail`: validates addresses. Existing.
- `normalizeEmail`: normalizes identity. Existing.
- `ContactStore`: looks up, inserts and renames contacts. Existing.

## Change map
- `src/contacts/import.js:+1`: Defines a local email regex. Serves 1. Fix (4).
- `src/contacts/import.js:+2`: Sets insert retry limit. Serves nothing. Remove (7).
- `src/contacts/import.js:+4-7`: Selects mode and delimiter and initializes results. Serves 4. Fix (6, 8).
- `src/contacts/import.js:+9-14`: Removes BOM and splits text into lines. Serves 1, 2, 5. Fix (1, 2).
- `src/contacts/import.js:+16-23`: Iterates lines, strips CR and skips blank lines. Serves 1, 2. Fix (1, 2).
- `src/contacts/import.js:+25-45`: Splits each line into CSV cells with quotes. Serves 1, 2, 5. Fix (1, 2).
- `src/contacts/import.js:+47-56`: Reads header and extracts and trims row fields. Serves 1, 2. Fix (2).
- `src/contacts/import.js:+58-64`: Rejects empty names or throws in strict mode. Serves 1. Fix (6).
- `src/contacts/import.js:+65-71`: Validates email and rejects or throws. Serves 1. Fix (4, 6).
- `src/contacts/import.js:+72-75`: Skips the old test domain. Serves nothing. Remove (5).
- `src/contacts/import.js:+76-82`: Looks up and renames existing contacts and counts updates. Serves 2, 3, 4. Fix (3).
- `src/contacts/import.js:+83-95`: Retries inserts and silently drops failed ones. Serves 2. Fix (7).
- `src/contacts/import.js:+96-97`: Counts created contacts. Serves 3, 4. Fix (3).
- `src/contacts/import.js:+98`: Returns accepted row details. Serves nothing. Remove (8).
- `src/contacts/import.js:+99-104`: Closes control flow and returns result. Serves 4. Keep.
- `test/import.test.js:+1-4`: Imports test utilities and importer. Serves 1, 2, 4. Keep.
- `test/import.test.js:+6-14`: Tests simple import counts. Serves 1, 2, 4. Fix (8, 9).
- `test/import.test.js:+16-18`: Tests strict rejection mode. Serves nothing. Remove (6).
- `test/import.test.js:+20-22`: Tests semicolon legacy mode. Serves nothing. Remove (8).
- `test/import.test.js:+24-26`: Tests skipping a valid test-domain address. Serves nothing. Fix (5).

## Questions and oddities
none

## Coverage
Read both changed files in full, the task, all base source and test files, and package.json. Static review only: did not run project code or tests. Running targeted tests would verify the traced outcomes and integration; no UI or mockups are involved.

Interactive report: review.html
