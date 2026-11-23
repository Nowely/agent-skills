# Offer card: review

## Roles of the references

| Reference | Role | Data, state, width |
|---|---|---|
| `design/card-764`, `card-601`, `card-486`, `card-280` | targets (screenshots, 1x, no layer data: landmarks named by hand from `design.mjs boxes`) | `OFFERS["card-<w>"]`, host width as named |
| `design/network-popover` | target; cropped to the popover box (the arrow below it is not built) | the network help opened by hover, over any card |

## Decisions (made without the owner, for the owner to dispute)

- **Modes.** The frames draw four layouts, not one squeezed: A (764) everything in one row; B (601) specs row, CPU and
  price below; C (486) CPU beside the id, one wrapping specs row, price and stock in a row; D (280) one column with
  larger type, "ГГц", "ядер", "×2 CPU", "256 ГБ RAM" worded, size-first disks, larger badge and chip. Text formats
  change by mode as drawn (disks "2 × 838" in A and B, "838 × 2" in C and D). Proposed unification: one disk format;
  it costs one CSS rule.
- **The mode follows the card's own width and its content.** `card.js` picks the widest mode whose content fits the
  container (`data-mode`, ResizeObserver on the card's own box, not the window) and never uses a mode below the width
  where the design first draws it (A 700, B 540, C 430). Longer data therefore switches wider (dense: A from 932).
- **Type sizes as drawn.** The frames draw values at 13/18 in A to C and the price at 14 (A, B) and 16 (C); the kit's
  `t-body` is 15/20 (used in D) and `t-price` 17. Local overrides in `card.css`; the footer is 12 (A to C) and 13 (D),
  below the kit's body. Badge and chip are drawn larger in D (26 and 30 px) than the kit's 20.
- **No frame shows a discount in A**: the indicator sits after the price (as in C and D), not above it as in B.
- **Footer.** The configure action follows the power item and wraps with it. Stock "Доступно N" always shows the
  count; the low-stock icon is before it in A and B, after it in C and D, as drawn.
- **AMD logo** is the vendor string in a bold grey wordmark (stand-in, ledger entry).
- **Popovers** use the Popover API with CSS anchor positioning (above the icon, flipping), no arrow.
- Long SKU wraps anywhere, a badge longer than its column ends in an ellipsis with its full text in `title`.

## Layout model

| Line and mode | What shares it: longest legal value, source | Width it needs | Below that width | What changes in this mode | Construct |
|---|---|---|---|---|---|
| top row, A | SKU 40 characters and 4 badges (README), CPU model, GHz, 16 cores and "×2", cores, RAM size and type, 4 disk groups, price "12 345 678 125,00 ₽ / месяц" (an amount can be long; unbounded, no owner bound: asked in the open questions) | 700 to 930 px by content (about 720 for the 764 frame's data) | mode B | one row, deal icon after the price | grid, `minmax(112px, 1.1fr)` for id, `minmax(88px, 1.1fr)` for CPU, content-sized tracks for the rest |
| specs row, B | id, GHz, cores, total cores, RAM, 4 disk groups | 540 px | mode C | CPU and price in the second row, deal icon above the price | grid areas |
| footer, A and B | network, power, configure, stock | any | the footer wraps, stock keeps its column | stock right | grid area, `flex-wrap` with `gap` |
| id and cpu, C | SKU, 4 badges / CPU model | 430 px | mode D | two equal columns | grid, `minmax(0, 1fr)` |
| specs row, C | GHz, "16 ядер ×2", cores, RAM, 4 disk groups | 430 to 470 px | mode D | wrapping row, space-between | `flex-wrap` with `gap` |
| price and stock, C | price (long), stock with low icon | any | stock wraps under | one row | `flex-wrap` |
| all, D | one column of blocks | 280 px | blocks stack; long tokens break | larger type, worded units | grid, `overflow-wrap: anywhere` |

## Acceptance

| Item | Checked by | Result |
|---|---|---|
| The four card frames match their screenshots by place and text, with the offsets listed in the handoff | visual comparison | pending — compared the four side.png captures with the references at the same data and width; four 13 to 14 px offsets at 764 px (proposed in the ledger) remain |
| Network popover content and look match its frame | visual comparison | pass — network-popover frame compared: same texts, one finding left (root height +6 px) |
| The card adapts to its own width between frames: no overlap, cut or wrapped group from 280 to 900 px | sweep | pass — sweep 280 to 900 px every 8 px and at each frame width: no finding on the frames' page |
| Dense story (40-character SKU, 4 badges, 4 disk groups, long price with discount, low stock, configure): no overlap or cut; it switches mode later than the frames | sweep.stories | pass — dense story swept 280 to 900 px: no overlap, cut or broken group; mode A from 960 px, B from 556 |
| Many entries (6 badges, 8 disk groups): the card grows and nothing overlaps | sweep.stories | pass — many story (6 badges, 8 disk groups) swept: grows, no finding |
| Minimal story (no badge, one disk, no period, no discount, 1 core): renders without gaps | sweep.stories | pass — minimal story swept, no finding |
| Configure action only when `configurable`, calls `onConfigure(id)` | script (scratch/behaviour.js) | pass — scratch/behaviour.js: configure only on dense and many; click calls onConfigure with o-dense |
| Hover or focus opens a help popover, it stays while the pointer is over icon or popover, closes on leaving, Escape, tap elsewhere; a tap toggles on touch | journeys | pass — 40 journeys hold: hover, focus, Escape, tap, leaving, a resize to 300 px, on each frame's data |
| A popover opened near a window edge stays whole in the window | journeys (edge runs) | pass — journeys at the window's top and bottom edge at 764 and 265 px: the popover flips (CSS anchor positioning, position fixed) |
| Discount indicator shows old price and end date on hover | journeys | pass — discount journeys on card-601, 486 and 280: old price shown on hover, closes on leaving |
| `renderCard(el, offer, { onConfigure })` unchanged for callers | script (scratch/behaviour.js) | pass — scratch/behaviour.js: renderCard(el, offer) without options, and a second call into the same el, give one card |

## Open questions for the owner

- Bound of the price amount and the period text (the README says only "can be long").
- One disk format (count × size or size × count) in all modes?
- Is the 13 px value size of the wide modes intended (the kit says 15)?
