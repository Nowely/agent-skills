# Add a non-mutating import preview

Add an exported synchronous `previewImport(text, store)` in the import module. For the same input and unchanged initial store, its `created`, `updated`, and `rejected` fields must equal what the existing `importContacts(text, store)` would produce, including rejection reasons and original physical line numbers.

Preview must not call `insert` or `rename` on the supplied store, or mutate its contacts (including objects returned by store reads). Repeated previews leave the store unchanged. It must propagate parsing errors without writes. Existing `importContacts` behavior and the original task contract stay intact; it still applies the import.

The store is stable within each call and when preview is compared with import on an equal initial copy. Concurrency, transactions, UI and networking are outside this task. Keep the existing policy for an existing contact whose incoming name is unchanged; do not invent a new counting rule or require an unnecessary rename. Internal layout and helpers are your choice.
