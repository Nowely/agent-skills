## Change
Show invoice currency codes in upper case in the list, invoice page, and CSV export. Archived invoices contain lower-case currency codes.
- Adds currency normalization for the invoice page.
- Formats prices separately in the list and page.
- Adds normalization and list tests.
Sources: brief.md; HEAD commit; data/archive.schema.json

## Verdict
The list handles archived lower-case codes, but the CSV still exports them lower case and the page can display the wrong currency. The code also duplicates price formatting and introduces fallbacks that the actual invoice contracts do not require.
Target: Use one currency uppercasing operation for display, reuse formatPrice for both screens, and apply the same operation to the CSV currency field. Preserve every valid code and test all three outputs with archived invoices.
Recommendation: Fix in place: correct CSV and preserve valid currencies first, then remove unsupported fallbacks and duplicated formatting and cover the three outputs.

## Findings
### 1. CSV export leaves archived currency lower case (behavior; traced)
`src/export/csv.js:2`: readArchive passes an archive row's three lower-case letters through as currency, and toCsv emits them unchanged: an archived 'usd' is still 'usd' in CSV. Breaks requirement 3.
Fix: Uppercase the currency in the CSV output, reusing the display normalization.

### 2. The page replaces valid currencies with USD (behavior; traced)
`src/invoices/price.js:8`: The archive accepts any three lower-case letters and billing-client 2.3.0 accepts any three upper-case letters. An archived 'jpy' or service 'JPY' becomes 'USD' on the page, mislabeling its amount; the list keeps JPY. Breaks requirement 2.
Fix: Uppercase the input without restricting it to the three listed codes.

### 3. Price formatting is duplicated between the screens (design; judgment)
`src/screens/list.js:5`: Both screens stopped using formatPrice and now own separate amount formatting and currency rules; a price-format change must be made in both places and the implementations already disagree for JPY. Breaks requirement 1, 2.
Fix: Put display normalization in the existing price formatter and reuse it from both screens.

### 4. Missing-currency fallbacks and their tests contradict the inputs (necessity; traced)
`src/invoices/price.js:4`: loadInvoices uses the root billing-client 2.3.0, which rejects absent or non-string currency, and the closed archive schema requires exactly three lower-case letters. The guard, fallback parameter, trimming, list's null fallback and tests of null are unsupported by either input; docs/billing.md describes 1.x, not the installed root client.
Fix: Remove the unsupported fallback, guard and trimming, the list fallback and stale comment, and the missing-currency test.

### 5. The page hides unexpected formatting failures as a real price (necessity; traced)
`src/screens/page.js:7`: Both supported sources require an integer amount and string currency, so formatting them has no demonstrated failure requiring recovery. If an unexpected exception does occur, this catch silently displays USD 0.00 instead of exposing it.
Fix: Remove the catch and let unexpected errors propagate.

### 6. Tests omit the page and CSV output (tests; traced)
`test/price.test.js:10`: The added lower-case test exercises the helper and list only. A page that converts JPY to USD or a CSV that leaves 'usd' unchanged passes the suite; the unknown-code test instead pins the wrong USD substitution. Breaks requirement 2, 3.
Fix: Test list, page and CSV using archived lower-case codes including a valid code outside USD/EUR/GBP, and remove the wrong fallback assertion.


## Ideas
none

## Screens
- Invoice list and invoice page: no pictures.
  - Not compared: No mockup, before or after images were supplied; screenshots of both screens would allow a visual comparison.

## Structure
- `normalizeCurrency`: normalize and restrict currency, supply a fallback. Split (2, 4).
- `renderList`: format invoice list prices. Merge (3, 4).
- `renderPage -> normalizeCurrency`: format invoice page price, hide formatting errors. Split (3, 5).
- `formatPrice`: format a price. Existing.
- `toCsv`: export invoice fields. Existing.
- `loadInvoices -> fetchInvoices, readArchive`: load service and archive invoices. Existing.
- `readArchive`: map archive rows to invoices. Existing.
- `fetchInvoices`: fetch and validate service invoices. Existing.
Target:
- `normalizeCurrency`: uppercase currency for display. From the change.
- `formatPrice -> normalizeCurrency`: format a price. Existing.
- `renderList -> formatPrice`: render invoice list. From the change.
- `renderPage -> formatPrice`: render invoice page. From the change.
- `toCsv -> normalizeCurrency`: export invoice fields. Existing.
- `loadInvoices -> fetchInvoices, readArchive`: load service and archive invoices. Existing.
- `readArchive`: map archive rows to invoices. Existing.
- `fetchInvoices`: fetch and validate service invoices. Existing.

## Change map
- `src/invoices/price.js:+1, 3-9`: Normalizes currency and substitutes a fallback outside a three-code list. Serves 2. Fix (2, 4).
- `src/screens/list.js:-1`: Removes the common price formatter import. Serves 1. Fix (3).
- `src/screens/list.js:+2-6 -4`: Uppercases list currency and formats amounts locally, with a null fallback. Serves 1. Fix (3, 4).
- `src/screens/page.js:+1 -1`: Switches the page from the common formatter to currency normalization. Serves 2. Fix (3).
- `src/screens/page.js:+4-6, 10 -4`: Formats the page price using normalized currency. Serves 2. Fix (2, 3).
- `src/screens/page.js:+7-9`: Converts formatting errors to a fixed price. Serves nothing. Remove (5).
- `test/price.test.js:+3-4 -3`: Imports the new helper and list renderer for tests. Serves 1, 2. Fix (6).
- `test/price.test.js:+10-13`: Tests uppercasing the helper and list. Serves 1, 2. Fix (6).
- `test/price.test.js:+15-18`: Tests null currency fallback. Serves nothing. Remove (4).
- `test/price.test.js:+20-22`: Tests fallback for an unlisted code. Serves nothing. Remove (2, 6).
- No block serves requirement 3 (1, 6): Show currency codes in upper case in the CSV export.

## Questions and oddities
none

## Coverage
Read the entire diff and all changed files and their base versions; traced loadInvoices, readArchive, toCsv, root and nested billing-client implementations and types, lockfile, archive schema, billing docs, and existing tests. Static review only: no project code or tests were run; running output tests would verify the traced cases. No screen images were supplied.

Interactive report: review.html
