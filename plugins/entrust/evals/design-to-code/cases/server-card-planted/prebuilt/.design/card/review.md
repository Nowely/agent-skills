# Offer card: review

## References
| Reference | Role |
|---|---|
| `design/card-764`, `card-601`, `card-486`, `card-280` | target frames (1x PNG, no layer data); each is a different layout, built as drawn |
| `design/network-popover` | target; the checker's copy in `frames/network-popover` is cropped to the popover box (x 20-287, y 12-125 of the original, tail and shadow margin cut off) so that the root compares with the frame |
| `design/context.md`, `README.md`, `kit/kit.css` | context and contract |

## Handover note
- `card.js` builds the card for one of four layouts (`data-mode`: wide, medium, narrow, compact). It tries them from the widest and keeps the first whose content fits the width of the element it was given (grid scrollWidth), re-chosen by a ResizeObserver on that element; so the switch widths move with the data (a long price or four badges leave the wide layouts earlier). At the frame data the switches are about 736 / 512 / 448 px.
- The wording differs per frame and is built per layout, as drawn: "3.33" / "3.33 ГГц", "16" / "16 ядер", chip "×2" / "×2 CPU", disks "2 × 838" (wide, medium) / "5587 × 4" (narrow, compact), "256 ГБ" over "DDR3 ECC" / "256 ГБ RAM DDR3 ECC", the low-stock icon before the text (medium) / after it (others). Units dropped in a layout stay for a screen reader (`.sr`).
- Popovers: Popover API (top layer), placed above the icon (below when there is no room), clamped to the window, tail follows the icon. Hover, focus-visible, tap, Escape and outside tap as in `context.md`. Listeners on the document exist only while one is open.
- Map: SKU `t-caption`, values `t-body`, badges `kit-badge`, chip `kit-chip`, help `kit-help`, deal / low `kit-icon--*`, popover `kit-popover`, link `kit-link`, action `kit-action`. Raw: the compact layout's 17 px type, badges and chip height 28 px (the kit has no larger badge); the price at 15 px.
- Stand-ins: the AMD mark (text and arrow), the port, settings, deal and low icons.
- Stories added to `data.js`: `dense`, `many`, `configurable`, `intel-single`.

## Acceptance
| Item | Checked by | Result |
|---|---|---|
| The card at 764, 601, 486 and 280 px matches its frame (landmarks named from the screenshots) | — | pass — the four frames pass; only notes remain (offsets of 12 px or less, drifts from the font) |
| The network popover matches its frame | — | pending — only the box's width differs (298.6 against 267 px): proposed in `deviations.json` |
| The card adapts to its own width, between the frames, 280 to 900 px | sweep | pass — swept every 8 px and at each frame's width, no finding |
| Longest values and every conditional piece: 40-character SKU, 4 badges, 4 disk groups, long price with period and discount, low stock, configure | sweep.stories | pass — `dense` swept 280 to 900 px |
| More entries than any frame shows | sweep.stories | pass — `many` swept 280 to 900 px |
| A price and its period never split as "₽ /" \| "месяц"; amount and period are `nowrap` | sweep | pass — no `wrap` finding in the sweep, `dense` and `many` included |
| The configure action only on offers that allow it, and it calls `onConfigure(id)` | consumer test | pass — `scratch/consumer.mjs`: absent when `configurable` is false, `onConfigure("o-cfg")` called once after 5 re-renders |
| `renderCard(el, offer, { onConfigure })` keeps working for its callers: re-render, emptied and refilled element, detached element, parent width change | consumer test | pass — `scratch/consumer.mjs` (12 checks, no page errors) |
| Popovers: hover, focus, tap toggle, Escape, tap elsewhere, window edges | journeys | pass — 35 journeys hold (11 defined, each also at the window's top and bottom edges) |
| Offer data is escaped; a `javascript:` link is dropped | consumer test | pass — `scratch/consumer.mjs` |

## Candidates
Nothing from the generated conditions was left unanswered.
