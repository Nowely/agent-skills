# The accepted implementation against the design

What the public captures of the owner's final implementation (the "reference release" of the
[predecessor's gallery](../2026-11-20-adaptive-frontend/visual/README.md)) show against the design frames, written
as the ledger would hold it. The kinds are a reading of the images; the owner confirms or corrects them in tier 1 of
[the protocol](protocol.md).

## Geometry at 280 px

Text rows, as ink bands, are within 2 px of the design from top to bottom except the last: the availability line
starts 4 px lower (464 against 460) and its badge is 15 px high against 18. The card is 500 px high against 499.

## Differences

| Where | Design | Final | Likely kind |
|---|---|---|---|
| core count, every width | "32 ядер" | "32 ядра" | design-error: the form after 32 is «ядра» |
| disk rows, 280 | unit after each size | units in their own column | ux or owner: sizes and units read as columns |
| disk row, 764 | a wide gap before "SSD" | the unit right after the size | owner |
| price, every width | a lighter weight | a heavier one | system or owner |
| availability badge | yellow (#ffeda5), 18 px | pale orange (#ffebce), 15 px | system: the UI kit's badge |
| "New" badge | pale blue text on #e5edff | darker blue text on #e1f0fd | system: the UI kit's colours |
| text widths | Figma's rendering | Chromium's | platform: never a finding by itself |

## As ledger entries

```json
[
  { "landmark": "32 ядер", "property": "text", "actual": "32 ядра", "category": "design-error",
    "status": "accepted", "reason": "the plural form after 32 is «ядра»", "decidedBy": "owner" },
  { "landmark": "Доступно 1", "property": "y", "frame": "280", "max": 4, "category": "system",
    "status": "proposed", "reason": "the UI kit's availability badge is 15 px high, the drawn one 18",
    "options": ["keep the kit's badge (consistent with the product)", "a custom 18 px badge (matches the drawing)"] }
]
```

The second entry is `proposed` because the reading is ours, not the owner's; accepted, it would carry `decidedBy`.
