## Design review: reshape at the archive boundary

The cleanest target is to uppercase `row.cur` in `readArchive` (`src/invoices/archive.js:2–3`), preserving the code itself, then restore both screens’ use of `formatPrice`. The installed billing client already guarantees uppercase currency (`node_modules/@acme/billing-client/index.d.ts:1–15` and `index.js:3–14`); the archive schema guarantees three lowercase letters (`data/archive.schema.json:5–10`). `loadInvoices` combines those two sources for screens and export (`src/invoices/load.js:4–6`). Normalizing the archive adapter therefore gives downstream consumers one representation without adding a whitelist or fallback policy.

### Findings

1. **Valid currencies are relabeled as USD on the invoice page.** `normalizeCurrency` accepts only USD, EUR and GBP and substitutes USD otherwise (`src/invoices/price.js:1–8`; called at `src/screens/page.js:5`). Both source contracts permit other three-letter codes. I ran an archive invoice with `jpy`: the list displayed `JPY 10.00`, but the page displayed **`USD 10.00`**. Preserve the currency code; change its case only.

2. **CSV export remains lowercase.** `toCsv` writes `invoice.currency` directly (`src/export/csv.js:1–3`), while `readArchive` still passes `row.cur` through unchanged. The same executed example exported `A,jpy,10.00`. Normalize at the archive boundary so the export receives uppercase as well.

3. **Formatting ownership is scattered.** **Design judgment:** the change removes the shared `formatPrice` call from both screens, duplicates amount formatting in them, and leaves the shared formatter unchanged (`src/screens/list.js:1–5`, `src/screens/page.js:1–10`, `src/invoices/price.js:11–13`). Even if each behavior is corrected locally, the price-formatting rule would still require the screens to stay in step. Restoring their shared formatter and adapting the archive once avoids that burden; no new formatting interface is needed.

4. **The new fallback policies are unsupported by the current inputs.** The page’s catch converts any formatting exception to `USD 0.00` (`src/screens/page.js:4–8`), hiding an error as a plausible monetary value; previously it propagated. The null fallback and whitelist follow stale 1.x documentation (`docs/billing.md:3,7–8`), whereas the installed 2.3.0 contract rejects null and lowercase service currencies. The archive schema also requires a string. Remove these policies rather than silently inventing amounts or currencies. Behavior for malformed archive rows outside that schema is not established.

5. **Tests miss the connected paths.** `test/price.test.js` exercises the helper and list, but not page or CSV through `loadInvoices`; it also asserts the unsupported unknown-currency fallback. Add a test with a non-whitelisted archive currency covering list, page and CSV, plus a service invoice to establish that its code is preserved.

### Checks and limits

- `npm test`: **4 passed**.
- Executed `loadInvoices` → list/page/CSV with an archive `jpy` invoice; observed the results above.
- Read the complete diff, both input adapters, archive schema, export, installed billing-client implementation/types, and dependency lockfile. No source edits, comments, web or MCP calls.
- The archive schema describes the historical writer; its implementation and actual archived data were not available. No visual UI check was performed. No canonical report was written; the coordinator owns it.
