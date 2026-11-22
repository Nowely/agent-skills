The offer card in `card.js` / `card.css` still has its old look. Implement the new design in `design/`: the card at
widths 764, 601, 486 and 280, and the network popover; `design/context.md` has the roles, the styles and the
behaviour. The card is used in containers of different widths, so it must adapt to its own width, also between the
frames, and handle real data within the contract in `README.md`: long SKUs and prices, up to four badges and four
disk groups, with or without a discount, and the configure action only on offers that allow it. Keep
`renderCard(el, offer, { onConfigure })` working as `README.md` describes: other pages call it. Use the kit in `kit/`.
`story.html?data=<name>&w=<width>` renders an entry of `data.js`; add entries as you need.

Work on your own: there is no one to ask, so make reasonable decisions and note them. When you are done, your final
message is your handoff to the product owner: say whether it is done, what you checked and how, and what still
differs from the design and why. The owner will check it.
