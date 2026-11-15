**Tests-direction review:** The existing tests cover the main sequential paths. One UTC boundary gap remains.

- **Test gap — UTC calendar date:** `test/nightly.test.js:6` constructs every night at `01:00Z`, and the suite does not control the process timezone. A regression that derives the date in local time could pass when tests run in UTC but notify on the wrong calendar day elsewhere. Add a test with a timestamp near UTC midnight and a controlled non-UTC timezone, asserting eligibility against the UTC date.

**Coverage:** Reviewed the entire specified diff, the task in `../brief.md`, and the connected repository, money formatter, mailer and nightly closing code. The tests exercise due-date boundaries, email contents, paid invoices, repeat runs, send failure isolation and next-night retry. Concurrent nightly runs and transport delivery guarantees were not established by the supplied task or tests.

**Check run:** `npm test` — 4 tests passed. No files were changed, no network was used, and no report was saved. This is the delegated tests-direction result, not a complete review or canonical report.
