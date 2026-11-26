# Offer card: review

## Roles of the references

| Reference | Role |
|---|---|
| `frames/card-764`, `card-601`, `card-486`, `card-280` | targets: the card at that width with `OFFERS["card-<w>"]` |
| `frames/network-popover` | target: the popover of the network help icon; the image is cropped to the popover box (the shadow margin and the arrow below it are dropped, so the root is the popover) |
| `design/context.md` | behaviour and kit styles |
| `design/*/reference.png` | the uncropped originals |

Screenshots only, 1x, no layer data: the frames are named with `design.mjs boxes`, landmarks written by hand in `frames/*/spec.json`.

## Map to the kit

| Design | Project |
|---|---|
| SKU | `t-caption` |
| badges | `kit-badge`, `kit-badge--accent` |
| values, secondary lines | `t-body`, `t-muted` |
| "×2" | `kit-chip` |
| help icons | `kit-help` (a real button) |
| discount, low stock | `kit-icon--deal`, `kit-icon--low` (deal is a button: it opens the old-price popover) |
| price | `t-price` |
| popovers | `kit-popover`, `kit-popover__title`; link `kit-link`; action `kit-action` |
| AMD logo, network icon, settings icon, chevrons, bars | none in the kit: a bold grey wordmark and small inline SVGs stand in |
| card surface | `--c-surface`, `--r-card`, `--shadow-card` |

## Decisions made without the owner

1. The layout is chosen by `card.js` from the container's width and the content (`data-mode` on `.offer-card`): it tries wide, medium, narrow and keeps the first that fits without squeezing a column; below 400 px it is the single-column "stack". Not a media query: the card sits in containers of any width, and a longer SKU or price moves the switch.
2. Between the frames the card keeps the nearest layout that fits; the frames show four samples, the switch widths between them are mine.
3. Frames differ in format and each is built as drawn: units (ГГц, ядер, "CPU", "RAM") only in narrow and stack; disks "count × size" in wide and medium but "size × count" in narrow and stack; the stock icon before the text in medium and after it elsewhere; the discount icon above the price in medium and beside it elsewhere (the wide frame has no discount: beside the price is inferred). Unifying any of these is a small follow-up; the owner decides.
4. The "×N" chip is shown only when `cpu.count > 1`.
5. Units hidden in wide and medium stay in the markup as `title`s of the values (display none).
6. The discount popover reads "Цена без скидки: <old>" and "Скидка действует до <date>"; the power popover only the help text. The wording of the first is mine.
7. The popover is anchored with CSS anchor positioning (`position-area: top span-right`, `position-try-fallbacks` flipping), in the top layer; the arrow side and position are set from measured rectangles after it opens. Browsers without anchor positioning would show it unanchored.
8. The host element needs a definite width (block-level, as the three pages use it); the card fills it.
9. Disk sizes carry no unit (the data has none); the kit has no table or logo components.

## Layout model

| Line and mode | What shares it: longest legal value, source | Width it needs | Below that width | What changes in this mode | Construct |
|---|---|---|---|---|---|
| top row, wide | id (SKU 40 characters, README; up to 4 badges, README), processor, frequency, cores and "×N", threads, RAM (type up to 3 words, fixtures), 1–4 disk groups (README), price (amount long, README: not bounded; fixtures "1 125 898,00 ₽ / месяц") | about 660 px with the frame data, about 900+ with the dense story | medium | one row; no units; the id column capped at 14rem, SKU and badges wrap inside it; RAM type wraps at spaces; disks stack | grid, flexible gap tracks in the design's proportions, `max-content` columns, `overflow-wrap: anywhere` |
| footer, wide | network (text, help), power (text, help), configure (only when `configurable`), stock (with low icon) | about 380 px | wraps within `.card__foot` | — | flex-wrap with gap |
| top row, medium | id, frequency, cores, threads, RAM, disks | about 530 px with the frame data | narrow | processor and price move to a second row; the discount icon above the price; stock icon before its text | grid with spacer tracks, RAM spanning two rows |
| narrow | id and processor side by side; specs row; footer; price and stock | 400 px | stack | units shown, "size × count", chip "×N"; specs wrap between groups | grid 2 columns, flex-wrap with gap, space-between |
| stack | one column | — | — | body 17 px, badges and chip 26 px, price 18, caption 14–15, padding 20, bigger vendor mark; RAM type inline after the size; frequency, RAM and disks each their own row; cores and threads share a row and wrap | grid, one column; flex-wrap |

Measured switches (container width, descending): frame-764 data wide until 660, medium until 466, narrow until 398; dense (4 badges, 4 disk groups, long SKU and price) medium at 900, narrow below 634; stack below 398 for all.

## Acceptance list

| Item | Checked by | Result |
|---|---|---|
| Card at 764, 601, 486, 280 matches its frame in layout, order, formats and texts | frames | pending — every text, order and format matches; what remains is the fallback font's widths (Inter) and stand-in icons, proposed in the ledger |
| Network popover: title, two speeds, reservation link | frame, journeys | pending — 34 px wider than the frame because the title is wider in Inter |
| Hover or focus opens a help popover; it stays while the pointer is over the icon or the popover; leaving closes it | journeys | pass — the hover journeys of the network and the power help |
| Escape closes it | journeys | pass — the Escape journey |
| A tap toggles it; a tap elsewhere closes it | journeys | pass — the touch journey on the network help |
| Discount icon shows the old price and the end date on hover | manual | pass — hovered `.price__deal` on card-601 in Chromium: the popover showed both |
| Low stock shows the icon next to "Доступно N"; the count stays | frames | pass — frames 601, 486, 280 show both |
| Configure only on `configurable` offers, calls `onConfigure(id)` | manual | pass — `dense` and `plain` show it and a click set `window.configured`; frames 764 to 280 and `many` do not show it |
| Dense: long SKU, 4 badges, 4 disk groups, long price, discount, low stock, configure | `sweep.stories` `dense` | pass — swept 280 to 900 px: no overlap, clipping or broken line |
| Data without a discount, one processor, no badges, not low | `sweep.stories` `plain` | pass — swept 280 to 900 px |
| Four badges and four disk groups, no configure, no discount | `sweep.stories` `many` | pass — swept 280 to 900 px |
| Between the frames the card adapts to its width, not the window's | sweep | pass — the modes follow the host width in the sweep (host 280–900 in a 1000 px window) |
| Price groups stay together ("/ месяц" moves whole) | sweep | pass — no wrap finding |
