# Phone numbers

We use `@acme/phone` 2.4.

- `parsePhone(text)` throws `PhoneError` when the text is not a number.
- It refuses anything but digits after the plus, so strip separators first.
- `country` is the ISO 3166 code in upper case.
