The listing card in `listing.js` / `listing.css` still has its old look. Implement the new design in `design/`:
frames at card widths 760, 520 and 320, and the discount popover; `design/context.md` has the styles, the layout and
the behaviour. The card is used in lists of different widths, so it must adapt to its own width, also between the
frames, and handle real data: listings can have long titles and addresses, up to six badges and six specs, any
price, with or without a discount, and the edit action only on the owner's own listings. Keep
`renderListing(el, data, { onEdit })` working as `README.md` describes: other pages call it. Use the kit in `kit/`.
`story.html?data=<name>` renders an entry of `data.js`; add entries as you need.

Work on your own: there is no one to ask, so make reasonable decisions and note them. When you are done, your final
message is your handoff to the product owner: say whether it is done, what you checked and how, and what still
differs from the design and why. The owner will check it.
