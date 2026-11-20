# Offer card: design context

What a Figma file with auto layout would give for this card, written out because the case has no Figma file. The
images in each frame's folder are the design at 2× scale; where a `spec.json` is given beside one, it holds the
positions and fonts of the frame's texts.

## Tokens

| Token | Value |
|---|---|
| Surface | `#ffffff`, page `#f2f3f5`, outline `0 0 0 1px #e1e3e8` |
| Text primary / secondary | `#1f2329` / `#7a808c`; the unit after each spec value is secondary |
| Accent | `#2457c5`; badge "New" `#2457c5` text on `#e3edff`; other badges `#eef0f3`; the button `#2457c5` with white text |
| Media placeholder | a 135° gradient from `#c9d6ff` to `#e2e2e2` |
| In stock | `#1a8a4a` |
| Radius | card 12, media 8, badge 6, button 8 |
| Font | the page's `sans-serif` |
| Caption | 12 / 16, secondary |
| Badge | 13 / 22, horizontal padding 8 |
| Title | 18 / 24, semibold (600) |
| Body | 14 / 20 |
| Old price | 13 / 18, secondary, struck through |
| Price | 22 / 28, bold (700) |
| Stock | 13 / 18 |
| Button | 14 / 36 semibold, height 36, horizontal padding 16 |

## Frames

The card's width decides its layout, not the window's: the card is placed in containers of different widths.

**720 (row).** Padding 20. Three columns, gap 20: media 96 × 96; the main column fills; the buy column hugs its
content and aligns right. Main column, top to bottom: SKU; badges row (gap 6) 6 below; title 10 below; specs 10 below
as two columns of hugging width, column gap 24, row gap 4. Buy column: old price, price, stock 4 below, button 12
below.

**480 (two rows).** Padding 20. Top row: media 72 × 72 and the main column, gap 16. The buy group spans the full
width 16 below the top row, left-aligned: price, then old price on the same baseline 8 to its right; stock on its
own line; button 8 below, hugging its text.

**320 (column).** Padding 16, gap 16 between media, main and buy. Media full width, 120 high. Specs in one column.
The buy group as at 480, with the button full width.

Between the frames the card switches layout at its own width of 640 and 420 px.
