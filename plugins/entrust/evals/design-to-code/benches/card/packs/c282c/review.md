# Offer card: review

## References

| Reference | Role |
|---|---|
| `design/card-764`, `card-601`, `card-486`, `card-280` | target frames (screenshots, 1x, no layer data) |
| `design/network-popover` | target: the popover opened by the network help icon (image includes shadow and tail margin) |
| `design/context.md`, `README.md` | roles, styles, behaviour, data contract |

## The map

| Design | Project |
|---|---|
| SKU | `t-caption` (xs frame: 15 px) |
| badges, "New" accent | `kit-badge`, `kit-badge--accent` |
| values, secondary lines, units | `t-body`, `t-muted` |
| "x2" | `kit-chip` |
| help icons | `kit-help` (glyph is a pseudo-element, so it is not page text) |
| deal / low indicators | `kit-icon--deal` / `kit-icon--low` |
| price | `t-body` bold (the frames draw it at body size; `t-price` is 25 % larger) |
| popover | `kit-popover`, `kit-popover__title`, `kit-link` |
| configure | `kit-action` with a gear icon |
| AMD logo | none: the vendor name as bold muted text (no asset in the pack) |
| network / gear / chevrons / bars icons | inline SVG stand-ins (no assets in the pack) |

## The layout model

Layout follows the card's own width (container query on `.card`).

| Mode | Container width | What shares the lines | Below it |
|---|---|---|---|
| wide (764) | 720+ | one flowing row: SKU+badges, CPU, frequency, cores, threads, RAM, disks, price; footer row | the row wraps whole items (disks, price) to the next row; price stays right-aligned |
| medium (601) | 600–719 | SKU/badges/CPU in the left column, five spec columns right, price under them (deal icon above), footer + stock | left column is `minmax(min-content, 1fr)` |
| narrow (486) | 480–599 | SKU/badges left, CPU right; specs in one wrapping row; footer; price and stock | specs wrap by column |
| xs (280) | 280–479 | one column; type about 15 % larger as drawn | nothing narrower is drawn; swept down to 280 |

## Decisions

- Each frame is built as drawn; where frames differ the difference is kept: units ("ГГц", "ядер", "RAM", "CPU") only at 486 and below; disk rows read "count × size" at 601 and up, "size × count" at 486 and below; the low-stock icon before "Доступно N" at 601 and up, after it below; the deal icon above the price at 601, after it at 486/280.
- Wide (764) has no discount or low-stock drawing: deal icon sits before the price on the same line; low-stock icon as at 601.
- The price is `t-body` bold, as drawn, not `t-price`.
- RAM column is `width: min-content`, so the type wraps under the size as drawn.
- Processor chip is shown only when `count > 1`.
- Units hidden below the narrowest frames are `display: none` (not read by screen readers in the wide modes).
- Popovers are `popover="manual"` elements in the top layer, placed by `card.js` against the icon, flipped below and clamped to the window.
- Stock `count` 0 still reads "Доступно 0" (the design is silent).

## Candidates

Answered where the check printed them (none open in the last complete round).

## Acceptance

- Card at 764 matches the frame: pass — `card-764` frame passes, no findings, notes only (fonts wider than the design's)
- Card at 601 matches the frame: pass — `card-601` frame passes
- Card at 486 matches the frame: pass — `card-486` frame passes
- Card at 280 matches the frame: pass — `card-280` frame passes
- Network popover shows the drawn text and link: pass — `network-popover` frame: all five text landmarks found; root size proposed in the ledger
- Adapts to its own width between the frames: pass — sweep 280 to 900 px, step 8, no findings; layout changes only at 480, 600, 720 (and a wrap of the price near 750 with the 764 data)
- Long SKU (40 characters), long price, four badges, four disk groups: pass — `dense` story swept 280 to 900 px, no findings
- Discount present or absent, configure present or absent: pass — `dense`, `many` and the frames' data swept (discount and configure on and off)
- Configure action only on offers that allow it: pass — consumer script rendered `plain` (configurable) and `card-601` (not): the button appeared only on the first; click called `onConfigure("o-plain")`
- `renderCard(el, offer, { onConfigure })` unchanged for other pages: pass — consumer script called it through `window.renderCard` from story.html, twice on one element (popovers replaced, none left open), no page errors
- Popovers open on hover and focus, stay while over icon or popover, close on leaving, Escape, tap elsewhere; tap toggles: pass — 34 journeys hold, including touch and the window's top and bottom edges at 764 and 280
- Discount indicator shows old price and end date: pass — discount popover journey at each frame's page
- Low stock shows the indicator and keeps the count: pass — frames 601, 486 and 280 show both
