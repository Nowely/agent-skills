# Task given to the author

Add a phone number to a profile, when one is created and when one is edited.

- A profile cannot be created without a phone. A text that is not a phone number is refused with a reason, and so is a number from a country the shop does not deliver to (`src/profiles/countries.js`).
- The number is stored in E.164 form, `+14155550100`, however it was typed.
- Two profiles cannot have the same number.

Decided when the task was discussed: strip spaces, dashes and brackets from what the person typed before it is given to `@acme/phone`, because the library refuses a formatted number.

The app stays on `@acme/phone` 3.1 in this release.
