# Offer card: review record

## Roles of the references

| Reference | Role | Data / state / width |
|---|---|---|
| `design/card-764`, `card-601`, `card-486`, `card-280` | target | `OFFERS["card-<w>"]`, card in a host of that width, no hover |
| `design/network-popover` | target (overlay) | the popover opened by hovering the network help icon; the reference is cropped to the bubble (x 20-286, y 12-129 of the 307 x 161 export) so the root is the popover; the tail is not part of the root |
| `design/context.md` | context | roles, styles, behaviour |

The frames are screenshots at 1x, no layer data: their landmarks were named from `design.mjs boxes`.

## Map

| Design | Project |
|---|---|
| SKU | `t-caption` |
| badges | `kit-badge`, "New" `kit-badge--accent` |
| values | `t-body`, secondary lines `t-muted` |
| processor count | `kit-chip` |
| help icons | `kit-help` (hit area enlarged by a pseudo-element to 24 px) |
| discount / low stock | `kit-icon--deal` / `kit-icon--low` (glyphs inline SVG: the kit has none) |
| price | `t-price` (17 px) in n and s; 15 px bold in w and m where the frames draw it smaller (the frame measures about 15) |
| popovers | `kit-popover`, `kit-popover__title`, `kit-link`; a tail added with a pseudo-element |
| configure | `kit-action` with an inline settings SVG |
| AMD logo | none: the vendor name as bold faint text (stand-in, the asset was not exported) |
| footer text | 12 px / 18 (the kit's `t-caption` is 13): in the page's face 13 px is 8 % wider than the frame |

Decisions made without the owner (there was no one to ask):

- Modes are chosen by the card's own width with a content test in `card.js` (`fit()`): the widest of w, m, n, s whose content
  fits and whose SKU takes at most two lines and whose footer does not wrap. The switches therefore depend on the data
  (longer data switches wider); for the frames' data they are at 735, 499, 465 px of card width.
- Formats as drawn per mode: `3.33` / `3.33 ГГц`, `16` / `16 ядер` (plural from the number), `x2` / `×2 CPU`, `256 ГБ` over `DDR3 ECC` /
  `256 ГБ RAM DDR3 ECC`, disks `2 × 838` (w, m: count first) / `838 × 2` (n, s: size first). The two disk orders look like
  a design inconsistency; a unification (one order everywhere) is a one-line follow-up if the owner wants it.
- Not in any frame, inferred: the deal icon in w goes after the price (as in n and s); the low-stock icon in w goes before the count (as in m);
  the processor count chip is shown for one processor too ("x1"); the deal tooltip reads "Скидка до <date>" and "Старая цена: <old>".
- Type scale of s: body 17 px, badges and chip 26 px high with 17 px text, SKU 15 px, footer 15 px, as the frame measures; these are
  not kit sizes (kit badge 20 px).
- The popover opens above its opener and flips below when there is no room; it stays inside the viewport (it may be wider than a 248 px card).

## Layout model

| Line and mode | What shares it: longest legal value, source | Width it needs | Below that width | What changes in this mode | Construct |
|---|---|---|---|---|---|
| top row, w | SKU (40 characters, README; two lines) and up to 4 badges (README, wrap), CPU model (wraps), frequency, cores, chip, cores total over threads, RAM size over type (type wraps to the size's width), 1-4 disk groups stacked (README), price with period and an old-price icon ("12 345 678 901,00 ₽ / месяц", dense story) | about 735 px for the frames' data, wider for longer data | m | 15 px type, price 15 px bold, formats `3.33`, `16`, `x2`, `2 × 838` | grid with content tracks, `min-content` RAM track, first two tracks 127 and 110 px |
| footer, w | network, power, configure (only when allowed), stock with the low icon before the count | about 330 px | the footer wraps, so the card switches | footer 12 px | flex-wrap with `gap` in a grid area |
| top row, m | SKU and badges, the specs, stacked disks | about 495 px | n | the model and vendor go under the badges, the price (icon above) under the disks, RAM spans both rows | grid areas, `minmax(8rem, 1fr)` |
| footer, m | as w | about 330 px | n | stock right | grid area |
| top, n | SKU and badges beside the model and vendor | 2 columns 11fr:10fr | s | blocks one under the other | grid |
| specs, n | frequency with unit, cores with word, chip, cores total over threads, RAM, disks | about 465 px | s | price (17 px) and stock on one line under the footer, stock icon after the count | grid, content tracks |
| all, s | one column | 240 px and up | the cores row wraps (cores column `minmax(0, 1fr)`), long tokens break | body 17 px, `×2 CPU`, `256 ГБ RAM DDR3 ECC` in one line, price over stock | flex column with gaps |

Many entries: disks and badges stack or wrap and the card grows (the `many` story has 8 disk groups and 6 badges).

## Acceptance list

| Item | Checked by | Result |
|---|---|---|
| card-764 matches its frame (one row, footer, no discount, one disk group, no configure) | visual comparison, frame check | pass — frame `card-764` compared by landmarks and pixels, offsets 12 px or less, listed in the ledger as proposed |
| card-601 matches its frame (two rows, discount icon above the price, low icon before the count) | visual comparison, frame check | pass — frame `card-601` compared by landmarks and pixels, remaining differences proposed in the ledger |
| card-486 matches its frame (blocks, three disk groups, price row) | visual comparison, frame check | pass — frame `card-486` compared by landmarks and pixels, remaining differences proposed in the ledger |
| card-280 matches its frame (one column, 17 px type, `×2 CPU`) | visual comparison, frame check | pass — frame `card-280` compared by landmarks and pixels, remaining differences proposed in the ledger |
| Network popover matches its frame: title, two rows, reservation as a link | visual comparison, frame check | pass — frame `network-popover` compared; the popover is 33 px wider in the page face |
| Widths between and beyond the frames keep every line | sweep | pass — swept 240-800 px every 8 px and at each frame width, lines hold and the four switches are where predicted |
| Longest legal values together (40-character SKU, 4 badges, 4 disk groups, long price with discount, low stock, configure) neither overlap nor cut | sweep.stories | pass — story `dense` swept 240-800 px |
| More entries than any frame (8 disk groups, 6 badges) make the card grow | sweep.stories | pass — story `many` swept 240-800 px |
| The least the contract allows (no badges, one disk, no period, no discount, not low, not configurable) | sweep.stories | pass — story `short` swept 240-800 px |
| Configure is shown only for a configurable offer and calls `onConfigure(id)` | Playwright script | pass — `configure` story: one button, click set `configured` to `o-cfg`; `card-764` has none |
| `renderCard(el, offer, { onConfigure })` keeps working for other pages | Playwright script | pass — rendered twice into one container of 400 px, options omitted and given, one card remains, no page error |
| Hover, focus, Escape, tap elsewhere and touch tap work for network, power and discount popovers | journeys | pass — seventeen journeys hold in the check; Tab, Escape and click-away also tried by script |
| Discount indicator shows the old price and the end date on hover | Playwright script | pass — text "Скидка до 31.12", "Старая цена: 139 900,00 ₽" |
| Low stock shows the indicator next to the count and keeps the count | visual comparison | pass — frames 601, 486 and 280 |
| Popover opens above and stays in view in a 280 px card on a 320 px viewport | Playwright script | pass — Playwright at a 320 px viewport, card 280 px: popover left 13, right 312 of 320, above the opener, tail on the icon (scratch/narrow.png) |
