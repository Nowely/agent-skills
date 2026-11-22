# Catalogue card: design context

What a Figma file with auto layout would give for this card. Each frame's folder holds `reference.png`, the design at
2×, and `spec.json`, the positions and fonts of its texts at 1×. Each frame draws the first card of the default list
(`data.js`).

| Frame | What it shows |
|---|---|
| `card-764` | the card 764 px wide: one row |
| `card-375` | the card 375 px wide: stacked |
| `size-chosen-375` | the card 375 px wide with the size M chosen |

## Styles

The page's tokens (`page.css`): ink `--ink`, secondary `--muted`, lines `--line`, chips `--chip`, surface `--paper`;
the font Inter.

| Role | Style |
|---|---|
| Title | 17 / 24, 600 |
| SKU, stock | 13 / 18, secondary |
| Tag | 12 / 18 on the chip colour, radius 999, padding 2 × 8, 6 apart; 10 below the SKU |
| Size | a button 28 high, at least 36 wide, padding 0 × 8, a 1 px line, radius 8, 13 / 26 600; 6 apart |
| Chosen size | ink fill and border, white text |
| Price | 17 / 24, 700 |
| Details | the page's `.button` |

The card has no frame of its own: 16 above and below its content, a 1 px line under it.

## Layout

The card's own width decides its layout, not the window's: the card is placed in lists of different widths, and the
catalogue's sidebar narrows its list when it opens.

- **One row from 640 px:** the title block fills, then the sizes, then the price, the stock and Details stacked; 24
  apart, aligned to the top.
- **Stacked below 640 px:** the title block, the sizes and a row of the price, the stock and Details, 12 apart; that
  row wraps when it has no room.

## Behaviour

- **A size is chosen by clicking or tapping it:** one per card; choosing the chosen size again clears the choice. A
  chosen size is announced as pressed (`aria-pressed`).
- **A choice stays while its card is shown.** The catalogue's search re-renders the list on every keystroke and
  empties it when nothing matches; a card that is shown again keeps its choice. Opening the sidebar does not reset it
  either.
- **Details opens the page's sheet** for the card's item, as before.
