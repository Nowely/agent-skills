# Listing card: design context

What the Figma file's design context gives for the new listing card. Each frame folder holds `reference.png`, the
frame exported at 2×, and `spec.json`, the positions and fonts of its texts in CSS px, extracted from Figma.

## Frames

| Frame | What it shows |
|---|---|
| `wide-760` | the card 760 px wide |
| `medium-520` | the card 520 px wide |
| `narrow-320` | the card 320 px wide |
| `deal-popover` | the popover the discount badge opens, over the wide card |

The card sits in containers of different widths (search results, the owner's dashboard, the map's side panel): its
own width decides its layout, not the window's.

## Styles

All from the kit (`kit/kit.css`): title `t-title`; address `t-caption`; spec value `t-body` semibold, its unit
`t-body` muted, below the value; price `t-price`, its period `t-small` muted; old price `t-small` muted and struck;
discount `kit-badge--sale`; badges `kit-badge` (accent and warn tones from the data); availability `t-small`; help
`kit-help`; edit `kit-button`. Card: surface, radius 12, the kit's card outline.

## Layout (auto layout)

- **Wide.** Padding 20. A top row of three: the main column fills; the specs hug (three columns, gap 16); the price
  column hugs and aligns right (price and period; 4 below, the old price and the discount badge, gap 6). Gap 24
  between them. 16 below, the footer: a 1 px line (`--c-line`) above, 12 padding on top; the availability and the
  help icon (gap 6) on the left, the edit button on the right.
- **Medium.** As wide, but the top row holds the main column and the price column; the specs take their own row
  below (one row, gap 24).
- **Narrow.** Padding 16. One column, 16 between blocks: main, specs (three columns, gap 16), price (left aligned),
  footer: the availability and help, then the edit button full width, 8 below.
- **Main column.** Title; the address 4 below; the badges 8 below (gap 6, wrapping).

## Behaviour

The help icon and the discount badge open popovers in the kit's look. Hover or keyboard focus opens one; it stays
open while the pointer is over the trigger or the popover, and closes when the pointer has left both, on Escape and
on a tap elsewhere. On touch screens a tap toggles it. The deal popover: "Old price" with the old price struck;
"New price" with the new price in bold; "Discount until <date>" as a caption. The help popover shows the
availability's help text.
