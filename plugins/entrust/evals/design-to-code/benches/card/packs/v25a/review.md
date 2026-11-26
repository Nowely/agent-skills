# Offer card: review

No `.design/returns.md` exists for this task, so there are no past returns to quote.

## References and their roles

| Reference | Role | Data | Width |
|---|---|---|---|
| `design/card-764` | target | `OFFERS["card-764"]`, no discount, stock not low, no period | 764 px, 1x |
| `design/card-601` | target | `OFFERS["card-601"]`, discount, low stock | 601 px, 1x |
| `design/card-486` | target | `OFFERS["card-486"]`, 3 disk groups | 486 px, 1x |
| `design/card-280` | target | `OFFERS["card-280"]`, long SKU `HA-a701-6N-4H-2X25G` | 280 px, 1x |
| `design/network-popover` | target (overlay) | the network help of `card-764`, opened by hover | 307 x 161 px, 1x, with the popover's shadow and pointer margin |

All five are screenshots, so they are measured as named boxes (`frames/*/spec.json`, from `design.mjs boxes`). The
scale is 1x as `context.md` says. The popover reference includes about 20 px of shadow around the popover box.

## Map

| Design | Project |
|---|---|
| card surface, radius 12, outline | `--c-surface`, `--r-card`, `--shadow-card` |
| SKU | `t-caption` |
| badges | `kit-badge`, "New" `kit-badge--accent` |
| values | `t-body`, secondary lines `t-muted` |
| "x2" / "x2 CPU" | `kit-chip` |
| help icons | `kit-help` (kit 14 px; the frames draw about 12: set to 12 inside the footer, a raw size) |
| discount, low stock | `kit-icon--deal`, `kit-icon--low` (kit 20 px; the frames draw 18: set to 18, a raw size) |
| price | `t-price` |
| popovers | `kit-popover`, `kit-popover__title`, `kit-link` |
| configure | `kit-action` with an inline settings icon |
| AMD mark, network port icon, settings icon, indicator glyphs | none in the kit: inline SVGs in `card.js` (raw) |
| gaps | `--s-1..--s-6` everywhere except two raw ones in the narrow mode (see decisions) |

## How the parts relate

From the frames (seen) and from the data contract (inferred):

- Seen: in the wide and mid modes the specs share one row (frequency, cores with the "x2" chip, threads, memory, disks)
  and the model and price sit in their own places; in the compact mode the SKU and badges sit beside the processor,
  the specs are one row under them, the footer line is under that and the price and stock close the card; in the
  narrow mode everything is one column, with larger type.
- Seen: units appear only where there is room (3.33 / 3.33 ГГц, 16 / 16 ядер, "x2" / "x2 CPU", 256 ГБ / 256 ГБ RAM).
- Seen: the disk groups read `count x size` in the wide and mid frames and `size x count` in the compact and narrow
  ones. Built as drawn, see decisions.
- Seen: the stock icon is before the count in the mid frame and after it in the compact and narrow frames. Built as drawn.
- Seen: the specs row ends about 12 px before the right edge in the mid and compact frames, where the price and
  stock end at the edge.
- Inferred: more badges wrap in the compact and narrow modes and force the next mode in the wide and mid ones; disk
  groups stack and the card grows; the configure action joins the footer row and wraps with it.

## Layout model

The mode is chosen by `card.js` from the card's own width: the widest mode whose content fits (no piece past the
card, the footer line unbroken, the price clear of the stock). A switch therefore lands where the content stops
fitting, not at a frame's width, and it moves with the data (see the stories' switch widths below).

| Line and mode | What shares it: longest legal value, source | Width it needs | Below that width | What changes in this mode | Construct |
|---|---|---|---|---|---|
| specs row, wide | SKU (40 characters, README), model, frequency, cores, chip, threads, memory, disks (count x size, 4 groups stack), price ("1 125 898 000,00 ₽ / месяц", owner's "long price"), badges (4, one row) | 749 px for the 764 frame's data; 884+ px with a discount and 4 groups; more with a 40-character SKU | the specs move to the mid mode | gaps 24/16/16/12/16/24/20 from the frame; units off; the deal icon beside the price; stock icon before the count | grid, `auto` columns and a `1fr` processor column, `nowrap` pieces |
| footer, wide | network, power, configure action (only when `configurable`), stock | 749 px | the footer line breaks, so the mode changes | stock right, icon first | grid area `meta` and `stock`, `flex-wrap` |
| specs row, mid | SKU and badges, frequency, cores and chip, threads, memory, disks | 500 px for the 601 frame's data (about 610 for a 1-badge short offer) | compact | specs row ends 12 px short of the edge | grid, `auto` columns, `space-between` |
| processor and price, mid | vendor mark, price with period and the deal icon above it | as the row above | compact | price right-aligned, icon above | grid areas `cpu` and `price` |
| footer, mid | network, power, configure, stock | as the row above | compact | meta gap 4 | `flex-wrap`, grid |
| top, compact | SKU (wraps at hyphens or anywhere), badges (wrap), model, vendor | 427 px | narrow | units on, `size x count` disks | two `minmax(0, 1fr)` columns, `overflow-wrap: anywhere` |
| specs, compact | frequency with unit, cores with unit and chip, threads, memory, disks | 427 px for 3 disk groups; 4 groups only make it taller | narrow | specs end 12 px short of the edge | grid with `grid-auto-flow: column`, `space-between` |
| price and stock, compact | price (long amounts) and stock | 427 px; a long price falls to narrow | narrow | stock icon after the count, price left | grid, price row-reverse with the deal icon |
| cores, narrow | cores, chip, threads | 265 px | threads wrap under the cores | type 17 px, badges 26 px tall, chip 26 px, SKU 15 px, memory inline, one column | `flex-wrap`, `minmax(0, 1fr)` column |
| footer, narrow | network, power, configure | 242 px | configure wraps under the others | meta 14 px, gap 20 | `flex-wrap` with `gap` |

Switch widths measured on the frame's own data: 749, 500, 427, 264, 241. On the other stories the first three move
(dense: mid up to 900, compact 721 to 527, narrow below 527; many: compact 646, narrow 447; wide-full: wide above
884, compact 543, narrow 432; minimal: mid 610, compact 468, narrow 411), which is the model working as intended.

## Decisions I made and what each costs

- The frames draw `count x size` for disks in 764 and 601 and `size x count` in 486 and 280, for the same data shape
  (`{ count: 2, size: "838" }` reads "2 x 838" and "838 x 2"). Built as drawn. Unifying would be one line of CSS; if
  the owner wants `size x count` everywhere, the wide frames' disk text changes. Proposed, not applied.
- The stock icon is before the count in 601 and after it in 486 and 280. Built as drawn. Unifying is one `order` rule.
- The 764 frame's data has no period, so its price has none; the rest show "/ месяц". The period follows the data.
- Unit words (ГГц, ядер, CPU, RAM) are hidden in the wide and mid modes, as drawn. They are not in the accessible
  text there either: a screen reader hears "3.33", "16". Proposed improvement: a visually hidden unit. Not built.
- The chip reads "x2" in the wide frames (it may be the font's multiplication sign); `context.md` says "×2" and the "×2 CPU" frame shows the sign, so the card writes "×2" everywhere.
- The discount icon in the wide mode (no frame shows it) goes beside the price, in the mid mode above it (as drawn).
- A discount, a low stock and the configure action are not all drawn together in any frame; the `wide-full`,
  `many` and `dense` stories show them together.
- Hover on the deal icon shows "Скидка", "Старая цена" and "Действует до"; the wording is mine (the design gives none).
- The power popover is the help text alone, with no title (`context.md`).
- The popover opens above its icon with a pointer and moves inside the card's width; it is clipped by nothing, but a
  page container with `overflow: hidden` would clip it. Consumers were not checked (none are in this project).
- Raw values kept: 12 px help icons, 18 px indicator icons, 17/18 px type and 26 px badges in the narrow mode (the 280
  frame draws them so), the 2 px secondary-line offset, 14 px vendor mark in the narrow mode, 18 px line pitch in the
  popover.
- The font: the kit's `sans-serif` renders as Inter here, about 10 % wider than the frames' font. Texts are wider, so
  columns that the frames pack tightly sit a few px apart. One platform entry per frame records it.

## Ideas not built

- A visually hidden unit for the bare numbers in the wide and mid modes (gain: spoken units; cost: a hidden span per value).
- Crop the popover reference to the popover box (gain: the root compares like for like; cost: a new export).

## Acceptance

| Item | Checked by | Result |
|---|---|---|
| card-764 matches its reference: order, columns, text, footer | visual comparison and the frame check | pending — every difference is within 12 px or a font/icon effect and is proposed in `deviations.json`; the owner decides |
| card-601 matches its reference (discount above the price, low stock before the count) | visual comparison and the frame check | pending — as above; the price block sits 9 px lower than drawn (the icon cannot overlap the memory column) |
| card-486 matches its reference (processor beside badges, three disk groups, price and stock row) | visual comparison and the frame check | pending — as above |
| card-280 matches its reference (single column, 17 px type, 26 px badges, "x2 CPU") | visual comparison and the frame check | pending — as above |
| The network popover matches its reference: title, two speed rows, the reservation as a link | visual comparison and the frame check | pending — text, order and link match; the popover is 9 px wider (font) and its frame has a 20 px shadow margin; rows use the kit's padding |
| The card adapts between the frames: no overflow, no overlap, every line holds from 240 to 900 px | `sweep` | pass — sweep 240-900 px every 8 px plus the frame widths and the switch pixels: 0 findings |
| Long SKU (40), long price, four badges, four disk groups, discount and configure together keep every line | `sweep.stories` | pass — stories `dense`, `many`, `wide-full`, `minimal` swept 240-900 px: 0 findings |
| The dense story adds: a 40-character SKU, 4 badges, 4 disk groups (one with 12 x 15360), a 18-character price with a discount, low stock and the configure action | `sweep.stories` | pass — `dense` is clean at every width; at 900 px it is the mid mode, at 280 the narrow one |
| An empty badge list, one disk group, no period and no discount render | `sweep.stories` | pass — story `minimal` is clean; no empty row is left where the badges would be |
| Configure appears only when `configurable` | manual: `scratch/behave.js` in Chromium | pass — shown and visible for `wide-full`, absent for `card-764` |
| `onConfigure(id)` is called with the offer's id | manual: `scratch/behave.js` | pass — clicking "Сконфигурировать" on `wide-full` set `configured` to `o-wide-full` |
| `renderCard(el, offer, { onConfigure })` can be called again on the same element | manual: `scratch/behave.js` | pass — two re-renders left one card and one set of popovers |
| Hover or keyboard focus opens the network, power and discount popovers; leaving both closes them | journeys | pass — hover and focus journeys hold on 8 pages (frames and stories) |
| Escape and a tap elsewhere close a popover | journeys | pass — Escape and tap-elsewhere journeys hold |
| A tap toggles a popover on touch | journeys | pass — the touch journeys hold |
| An open popover survives a resize | journeys | pass — tap, resize 764 to 300, still visible, then closed |
| The discount icon's popover shows the old price and the end date | manual: `scratch/behave.js` | pass — "Старая цена: 139 900,00 ₽", "Действует до 31.12" |
| The popover stays inside the card at 280 px | manual: `scratch/behave.js` | pass — left and right overshoot 0 px |
| Low stock shows the icon and keeps the count | frames | pass — "Доступно 1" and the icon in 601, 486, 280 |

## Not checked

Browsers other than Chromium, a real consumer page (none in this project), screen readers, device scale 2, widths
below 240 px, the old card for a before/after (its code was replaced before the first capture; `out/before` holds the
first capture of the new card).
