# Phone numbers

We use `@acme/phone` 3.1.

- `parsePhone(text)` returns `null` when the text is not a number. It does not throw.
- It ignores spaces, dashes, dots and brackets, so the text goes in as typed.
- `country` is the ISO 3166 code in lower case; `src/profiles/phone.js` raises it to compare with our codes.
