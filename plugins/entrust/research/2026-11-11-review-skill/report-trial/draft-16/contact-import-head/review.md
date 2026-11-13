## Change
Import contacts from CSV text into the address book, creating or renaming by email and reporting rejected rows. The brief asks for a bulk import with per-row rejection, email-keyed upsert, de-duplication inside a file, and no writes when the file cannot be parsed.
- src/contacts/import.js: importContacts with its own CSV splitter, validation, upsert, retry loop, strict and legacy modes, and a skip of a test domain
- test/import.test.js: four tests, one of them for each extra
Sources: /tmp/review-run-k6dXb5/brief.md; the diff HEAD~1..HEAD

## Verdict
The happy path works, but the change misses two requirements: a repeated email in one file is counted as created plus updated, and an unparseable file is not detected, so earlier rows are already written. It also adds a second CSV parser and email check beside the project's own, plus several unrequested mechanisms (modes, retry, domain skip, rows) that silently drop rows or write partially.
Target: importContacts(text, store): parseCsv(text) (throws CsvError before any write), then validate each row with isEmail/normalizeEmail into a Map keyed by normalized email (last row wins), collecting rejected {line, reason}; then apply the map with store.findByEmail/insert/rename and count created/updated. Keeps only the validation reasons and upsert idea of the change.
Recommendation: Rewrite as the target, about 30 lines. Fix findings 1 and 2 first (they break stated requirements), then delete 4, 5 and 6, reuse isEmail (3), and add the tests of 7.

## Findings
### 1. Own CSV splitter instead of parseCsv: unclosed quotes undetected, multi-line fields break, writes happen while parsing (behavior; traced)
`src/contacts/import.js:13`: The text is split on \n and each line parsed alone, while src/lib/csv.js parseCsv already handles BOM, CRLF, quoted line breaks and throws CsvError for an unclosed quote. With 'name,email\nAnn,ann@site.test\n"Bob,bob@site.test\n' Ann is inserted, then the unclosed quote just ends the line: no error, so nothing tells the caller the file is bad (requirement 4). A quoted name containing a newline is cut in two lines, giving wrong rejections and, after it, wrong line numbers (i+1 counts physical lines). A lone \r line ending is not split. Parsing, validating and writing are done in one loop, so no write can be held back until the parse succeeds. Breaks requirement 4, 1.
Fix: Call parseCsv(text) first (its rows carry line and the header-keyed cells), let CsvError propagate, and only then touch the store.

### 2. A repeated email in one file is counted as created and updated (behavior; traced)
`src/contacts/import.js:76`: Rows are written as they are read. For 'Ann,a@x.test' then 'Anne,a@x.test' the first row inserts (created 1), the second finds it with findByEmail and counts updated 1. The brief says the same email twice counts once, last row wins: expected created 1, updated 0 with name Anne. The test suite has no such case. Breaks requirement 2.
Fix: Collect the valid rows into a Map keyed by normalizeEmail(email) (later rows overwrite), then upsert once per key.

### 3. Private email regex differs from isEmail (necessity; traced)
`src/contacts/import.js:1`: EMAIL_RE = /^\S+@\S+$/ accepts 'a@b' and 'a@@b', which src/contacts/email.js isEmail (and so createContact) rejects, since it requires a dot in the domain and one @. The same address is valid through the import and rejected by the form. The email is also normalized by hand five times instead of normalizeEmail. Breaks requirement 1.
Fix: Import isEmail and normalizeEmail from ./email.js and delete EMAIL_RE.

### 4. Rows of @example.invalid are silently dropped (behavior; traced)
`src/contacts/import.js:72`: A comment calls it temporary; no requirement asks for it. A valid row of that domain is neither created, updated nor rejected, so the user is not told, and it contradicts 'rows are rejected only when name or email is invalid'. Its test pins the behavior. Breaks requirement 1.
Fix: Delete the branch and its test.

### 5. Retry loop around insert is unnecessary and swallows errors (necessity; traced)
`src/contacts/import.js:83`: ContactStore.insert throws only when the email already exists; this was just checked with findByEmail, so a retry cannot succeed and the same error repeats three times. When it fails the row is dropped with continue: not created, not rejected, no reason. MAX_RETRIES has no source.
Fix: Call store.insert once; let an unexpected error propagate.

### 6. Unrequested modes and result.rows (necessity; traced)
`src/contacts/import.js:5`: mode 'strict' throws on the first bad row after earlier rows were written, so it leaves a partial import, and the brief says bad rows do not stop the import. mode 'legacy' changes the separator to ';' that nothing requires, and options.mode is read by no caller. result.rows is not in the return contract and holds the raw, unnormalized email. Each adds branches and a test.
Fix: Remove options, mode, separator and result.rows; return {created, updated, rejected}.

### 7. Tests miss the requirements and pin the extras (tests; judgment)
`test/import.test.js:6`: No test for a duplicate email in a file (finding 2 passes), for case or space differences in the email (an uppercase 'ANN@Site.test' row), for the rejection line number and reason (only the length is checked), for a rename actually changing the name, or for an unclosed quote writing nothing (finding 1 passes). Three of four tests cover extras (strict, legacy, example.invalid). Breaks requirement 2, 4.
Fix: Add those tests; drop the three that pin removed behavior.


## Ideas
- `src/contacts/import.js:78`: Skip the rename call when the name is unchanged: Already done, but ContactStore.rename scans the whole map; a rename by id or the contact object would avoid it. Gains O(1) updates, costs a store change.

## Structure
- `importContacts -> ContactStore`: splits CSV text, validates rows, upserts into the store, retries inserts, switches modes. Split (1, 2, 3, 4, 5, 6).
- `ContactStore`: keeps the contacts by normalized email. Existing.
- `parseCsv`: parses CSV text into rows with line numbers, throws CsvError. Existing.
- `isEmail`: checks and normalizes an address. Existing.
Target:
- `importContacts -> parseCsv, isEmail, ContactStore`: validates parsed rows, keeps the last row per email, applies it to the store. From the change.
- `parseCsv`: parses CSV text into rows with line numbers, throws CsvError. Existing.
- `isEmail`: checks and normalizes an address. Existing.
- `ContactStore`: keeps the contacts by normalized email. Existing.

## Change map
- `src/contacts/import.js:+1`: private email regex Serves 1. Remove (3).
- `src/contacts/import.js:+2`: retry limit constant Serves nothing. Remove (5).
- `src/contacts/import.js:+4, 7`: function head with options, and the result with the extra rows list Serves 3. Fix (6).
- `src/contacts/import.js:+5-6`: mode and separator selection Serves nothing. Remove (6).
- `src/contacts/import.js:+9-14, 17-23, 25-50`: BOM, line splitting, blank lines and hand-written quote-aware cell splitting, header capture Serves nothing. Remove (1).
- `src/contacts/import.js:+16, 99-101, 103-104`: row loop, closers and return Serves 3. Fix (1, 2).
- `src/contacts/import.js:+52-56`: reads name and email cells by header Serves 1. Fix (1).
- `src/contacts/import.js:+58-63`: rejects an empty name, or throws in strict mode Serves 1. Fix (6, 1).
- `src/contacts/import.js:+64-71`: rejects a non-address email, or throws in strict mode Serves 1. Fix (3, 6).
- `src/contacts/import.js:+72-75`: silently skips the old test domain Serves nothing. Remove (4).
- `src/contacts/import.js:+76-81`: finds the contact by email and renames it, counting updated Serves 2, 3. Fix (2).
- `src/contacts/import.js:+82, 96-97`: new-email branch and created count Serves 2, 3. Fix (2).
- `src/contacts/import.js:+83-95`: insert retried three times, failures dropped Serves nothing. Remove (5).
- `src/contacts/import.js:+98`: records an accepted row in result.rows Serves nothing. Remove (6).
- `test/import.test.js:+1-4`: test imports Serves nothing. Keep.
- `test/import.test.js:+6-14`: mixed file: one created, one updated, one rejected Serves 1, 2, 3. Fix (7).
- `test/import.test.js:+16-18`: strict mode throws Serves nothing. Remove (6).
- `test/import.test.js:+20-22`: legacy semicolon file Serves nothing. Remove (6).
- `test/import.test.js:+24-26`: old test domain skipped Serves nothing. Remove (4).
- No block serves requirement 4 (1, 7): Write nothing if the file cannot be parsed.

## Questions and oddities
- `src/contacts/import.js:52`: A file with no name or email column rejects every row as 'name is empty'; should a missing column be an error instead? The brief does not say.
- `src/contacts/import.js:81`: A row that renames to the same name counts as updated; the brief says an existing email 'renames', so this is probably intended, to be confirmed.

## Coverage
Read the whole diff, src/contacts/store.js, email.js, create.js, src/lib/csv.js and test/csv.test.js. Nothing was run (static review); a run of the duplicate-email and unclosed-quote inputs would confirm findings 1 and 2.
