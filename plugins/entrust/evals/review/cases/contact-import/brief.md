# Task given to the author

Add CSV import of contacts to the address book. Each row has a `name` and an `email`.

- A row is rejected when its name is empty or its email is not an address. Rejected rows are reported with their line number and the reason, and do not stop the import.
- An email identifies a contact whatever its letter case and surrounding spaces. A row whose email already exists renames that contact; a new email creates one. The same email twice in one file counts once, and the last row wins.
- Return how many contacts were created and updated, and the rejected rows.
- Nothing is written if the file cannot be parsed.
