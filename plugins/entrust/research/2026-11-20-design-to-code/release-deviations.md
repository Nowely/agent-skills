# The accepted implementation against the design

What the public captures of the owner's final implementation (the "reference release" of the
[predecessor's gallery](../2026-11-20-adaptive-frontend/visual/README.md)) show against the design frames, written
as the ledger would hold it. The kinds are a reading of the images; the owner confirms or corrects them in tier 1 of
[the protocol](protocol.md).

## Geometry at 280 px

Every text row, the availability line included, is within 2 px of the design: the availability text starts at 464
against 463, and the availability badge is 18 px high in both (rows 461–478 against 460–477). The card is 500 px high
against 499. A first reading of these images put the availability line 4 px lower and its badge at 15 px; an
independent verifier re-measured them: the band method had mixed the badge with the text.

## Differences

| Where | Design | Final | Likely kind |
|---|---|---|---|
| core count, every width | "32 ядер" | "32 ядра" | design-error: the form after 32 is «ядра» |
| disk rows, 280 | unit after each size | units in their own column | ux or owner: sizes and units read as columns |
| disk row, 764 | a wide gap before "SSD" | the unit right after the size | owner |
| price, every width | a lighter weight | a heavier one | system or owner |
| availability badge | yellow, `#ffeda5` | pale orange, `#ffebce` | system: the UI kit's badge |
| "New" badge | blue text `#4768c2` on `#e5edff` | blue text `#3072b3` on `#e1f0fd` | system: the UI kit's colours |
| text widths | Figma's rendering | Chromium's | platform: never a finding by itself |

## As ledger entries

```json
[
  { "landmark": "32 ядер", "property": "text", "actual": "32 ядра", "category": "design-error",
    "status": "accepted", "reason": "the plural form after 32 is «ядра»", "decidedBy": "owner" },
  { "landmark": "Доступно 1", "property": "region", "region": [108, 456, 30, 26], "frame": "280",
    "category": "system", "status": "proposed",
    "reason": "the UI kit's availability badge is pale orange, the drawn one yellow",
    "options": ["keep the kit's badge (consistent with the product)", "a custom yellow badge (matches the drawing)"] }
]
```

The first entry is the owner's: the final code has the corrected form. The second is `proposed` because the reading
is ours; its region is approximate and would be taken from the check's report.
