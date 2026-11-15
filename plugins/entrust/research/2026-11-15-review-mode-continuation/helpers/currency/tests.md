## Findings

1. **Page and CSV regressions escape the tests.** `test/price.test.js:10–13` checks the normalizer and list, but never calls `renderPage` or `toCsv`. An end-to-end test using `loadInvoices` with a lowercase archive currency would catch the CSV omission; a page assertion with a valid currency outside the three-code allowlist would catch currency substitution.

2. **The page changes valid currencies to USD.** `src/invoices/price.js:1–8` permits only USD, EUR and GBP, although the installed billing client accepts three uppercase letters (`node_modules/@acme/billing-client/index.js:3,11`) and the archive schema accepts three lowercase letters (`data/archive.schema.json:9`). Both service `JPY` and archive `jpy` render as `USD 10.00` on the page. The test at `test/price.test.js:20–21` instead codifies fallback for an unrecognized code; it does not establish that other valid currencies must be preserved.

3. **CSV leaves archive currency lowercase.** `src/export/csv.js:2` exports the currency unchanged, and `src/invoices/archive.js:3` passes through the archive’s lowercase value. This misses the task’s explicit CSV requirement.

## Checks and scope

- `npm test`: **4 passed**.
- Ran a local integration example through `loadInvoices`, list, page and CSV: list showed JPY, both pages showed USD, and the archive CSV row retained `jpy`.
- Examined all changed files, the invoice loading and archive paths, CSV export, schema, installed billing-client contract and tests. No edits or external requests. Visual presentation was not checked.
