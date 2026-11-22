The catalogue card in `card.js` / `card.css` still has its old look. Implement the new design in `design/`: the card at
764 and 375 px, and with a size chosen; `design/context.md` has the styles, the layout and the behaviour. The card is
rendered by `renderCards(host, items)` in the catalogue (`index.html`, `page.js`) and on other pages, in lists of
different widths: keep it working as `README.md` describes, and keep the catalogue working, its search, its Filters
sidebar and the Details sheet. Change `card.js` and `card.css`; `index.html`, `page.js` and `page.css` are the page's.
`story.html?data=<name>&w=<width>` renders a list of `data.js` alone; add entries as you need.

Work on your own: there is no one to ask, so make reasonable decisions and note them. When you are done, your final
message is your handoff to the product owner: say whether it is done, what you checked and how, and what still
differs from the design and why. The owner will check it.
