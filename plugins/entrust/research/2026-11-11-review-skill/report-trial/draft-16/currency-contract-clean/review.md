## Change
Show the currency code in upper case in the list, the page and the CSV export. Some invoices show lower-case currency such as usd 10.00.
- readArchive upper-cases the archive's cur field when building an invoice
- a test for that conversion
Sources: brief.md; the diff; billing-client 2.3.0 code, types and changelog; data/archive.schema.json

## Verdict
The change does its task. Service invoices are already validated as upper case by billing-client 2.3.0 (installed and locked), and the only source of lower case is the closed archive, which the schema says is always ^[a-z]{3}$. Fixing it at the single place where archive rows become invoices covers the list, page and CSV with one line.
Target: readArchive normalises the archive's code to upper case; loadInvoices merges the service's and the archive's invoices; formatPrice and toCsv stay as they are. The change is already this.
Recommendation: Accept as is. No findings; the ideas are optional.

## Findings
none

## Ideas
- `test/archive.test.js:5`: Test through loadInvoices or the screens: A test that feeds a lower-case archive row through loadInvoices and formatPrice would pin the end-to-end requirement; costs a transport stub.
- `docs/billing.md:3`: Refresh stale docs: The page describes billing-client 1.x (null and mixed-case currency); 2.x guarantees upper case and never null. Updating it prevents someone adding guards later; costs a doc edit outside this change.

## Structure
- `readArchive`: maps archive rows to invoices, normalises the currency code. Keep.
- `loadInvoices -> readArchive, fetchInvoices`: merges service and archive invoices. Existing.
- `fetchInvoices`: fetches and validates service invoices, upper-case currency. Existing.
- `formatPrice`: formats currency and amount. Existing.
- `toCsv`: exports invoices as CSV. Existing.

## Change map
- `src/invoices/archive.js:+2, 4 -3`: Upper-cases the archive currency and documents why Serves 1, 2, 3. Keep.
- `test/archive.test.js:+1-8`: Checks a lower-case archive row becomes an upper-case invoice Serves 1, 2, 3. Keep.
- No block serves requirement 4, and no finding says it fails: Service invoices (billing-client) keep working; no changes needed to them

## Questions and oddities
none

## Coverage
Read all of src, the schema, docs/billing.md, billing-client 2.3.0 source, types, changelog and lockfile, and the nested 1.4.0 copy under @acme/reports (not used by this code). Did not run tests. Archive rows are assumed to follow the schema; a missing cur would throw, but the schema requires it.
