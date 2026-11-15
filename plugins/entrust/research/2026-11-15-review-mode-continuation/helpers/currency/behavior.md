## Behavior findings

1. **Invoice pages mislabel valid currencies as USD.** `src/invoices/price.js:1-8` accepts only USD, EUR and GBP, and `src/screens/page.js:5` uses it for every invoice. Both the installed billing client contract and archive schema allow other three-letter codes (`node_modules/@acme/billing-client/index.d.ts:1-9`, `data/archive.schema.json:9`). In a local run, a service invoice in JPY and an archive invoice in `cad` both displayed as `USD 10.00` on their pages. Preserve the code and uppercase it rather than substituting USD.

2. **CSV export still emits lowercase archive currencies.** `src/export/csv.js:2` exports `invoice.currency` unchanged, while `src/invoices/archive.js:3` passes through the archive’s lowercase `cur`. In the same local run, the list displayed `CAD 10.00` but CSV contained `cad,10.00`. Apply the casing rule to export as well.

The existing shared `formatPrice` is no longer used by either screen and does not uppercase currency; CSV formats its fields separately. A single normalization at the appropriate shared boundary would avoid the three paths disagreeing, while preserving each valid currency.

**Tests:** `npm test` passed all four tests. They do not exercise the page, CSV export, or a valid currency outside the three-code allowlist. The local end-to-end function run above used `loadInvoices`, both screens and CSV.

**Scope and limits:** Reviewed the full diff and the connected loader, archive schema, export, installed billing-client 2.3.0 contract and implementation. No files were edited or comments posted. The old `docs/billing.md` describes client 1.x and does not establish the currently installed client’s contract. No canonical report was created; the coordinator owns synthesis.
