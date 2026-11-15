## Necessity review

**Recommendation: reshape around the archive boundary.** The installed billing client already guarantees uppercase currency codes; the archive contract guarantees three lowercase letters. Uppercasing `row.cur` in `readArchive` would give all three consumers the requested representation without the new allowlist, defaults or page-level catch.

### Findings

1. **The allowlist changes valid currencies, rather than just their case** — `src/invoices/price.js:1-8`, `src/screens/page.js:6`. Both producer contracts permit codes beyond USD, EUR and GBP: the archive permits any three lowercase letters (`data/archive.schema.json:9`), and the installed client accepts three uppercase letters (`node_modules/@acme/billing-client/index.js:3,11-13`). A `jpy` archive invoice displays as **USD** on the page. Remove the allowlist and fallback rather than substituting a different currency.

2. **CSV remains lowercase for archive invoices** — `src/export/csv.js:2`. It reads `invoice.currency` directly, and `readArchive` passes `row.cur` through unchanged (`src/invoices/archive.js:3`). Normalizing at that archive boundary covers CSV as well as both screens. This is a requirement gap, despite the CSV file being unchanged.

3. **Missing-currency defaults and the page catch have no supported producer premise** — `src/screens/list.js:4`, `src/invoices/price.js:3-6`, `src/screens/page.js:5-9`. The archive requires `cur` and integer `amt`; client 2.3.0 validates currency and amount (`data/archive.schema.json:5-10`, `node_modules/@acme/billing-client/index.js:11-14`). `docs/billing.md:3-8` describes client **1.x**, while the direct dependency is locked to **2.3.0** (`package-lock.json:11-12`); its changelog confirms the 2.x contract (`node_modules/@acme/billing-client/CHANGELOG.md:7-9`). The catch also masks unexpected errors with a fabricated `USD 0.00`. Remove these defenses and the tests asserting unsupported null/unknown fallbacks; retain tests using contract-valid invoices.

4. **Price formatting is duplicated** — `src/screens/list.js:4-5`, `src/screens/page.js:6`. Both screens stopped using the existing `formatPrice` (`src/invoices/price.js:11-12`) and now independently own amount formatting and currency handling. After normalizing archive input, restoring that shared formatter avoids maintaining the price rule in multiple places; CSV can continue its separate column formatting.

### Checks and limits

- `npm test`: **4 passed**. The tests do not exercise the page or CSV and instead assert the unsupported fallback behavior.
- Executed an archive-backed `jpy` invoice through `loadInvoices`, list, page and CSV: list returned `JPY 10.00`, page `USD 10.00`, CSV `jpy,10.00`.
- Reviewed the whole textual diff and connected producers, contracts and consumers for necessity. The archive schema documents the historical writer; its implementation and actual stored data were not available. No edits, web requests or MCP calls were made.
