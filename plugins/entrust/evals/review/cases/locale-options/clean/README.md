# Category selector

The host imports this package before selecting a supported locale (`en` or `ru`).
It may call `setLocale` between reads. Every fresh call to `listCategoryOptions()`
or `labelForCategory(id)` uses that current locale; IDs and option order are stable.
Callers pass IDs from the option list. These functions build/read values when called,
with no cached UI or rerender contract.

`saveSelection(id)` creates a historical record. Its label remains the text at the
time it was saved, even if the locale changes later. Only the public functions are
part of this contract; the internal dictionary representation is not prescribed.
