# Catalogue card

`card.js` renders the catalogue's product cards: `renderCards(host, items)` replaces `host`'s content with a card for
each item, or a "Nothing matches" line when there are none. The catalogue page (`index.html`, `page.js`) calls it on
load and again on every search keystroke; the sidebar it opens narrows the list's column; a card's Details opens the
page's sheet (the page finds the card by its `data-id`). Other pages call `renderCards` in containers of their own
widths.

| Field | |
|---|---|
| `id` | the item's id |
| `title`, `sku` | its title and SKU, any length |
| `tags` | 0–8 short labels |
| `sizes` | 1–6 sizes, in order |
| `price`, `stock` | already worded (`"€49.00"`, `"12 in stock"`) |

`page.css` is the page's: tokens, the bar, the sidebar and the sheet. `story.html?data=<name>&w=<width>` renders a list
of `data.js` alone in a container of that width.
