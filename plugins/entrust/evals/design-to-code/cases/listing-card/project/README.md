# Listings

`listing.js` renders one rental listing: `renderListing(el, data, { onEdit })` replaces `el`'s content with the
card. The search page, the owner's dashboard and the map's side panel call it, in containers of different widths.
`onEdit(id)` is called when the owner chooses to edit the listing.

| Field | |
|---|---|
| `id` | the listing's id |
| `title`, `address` | text of any length |
| `badges` | 0–6 of `{ text, tone }`; `tone` is `accent`, `warn` or absent |
| `specs` | 1–6 of `{ value, unit }` |
| `price` | `{ amount, period, old?, discount?, until? }`: `old`, `discount` and `until` come together, for a listing on discount |
| `availability` | `{ text, help }` |
| `editable` | true on the owner's own listings: the edit action is shown only then |

The UI kit is in `kit/`: `kit.css` (tokens, type styles, badges, buttons, the help icon, the popover's look) and
`popover.js` (`Kit.attachPopover`). `story.html?data=<name>` renders an entry of `data.js` in a 760 px container;
`#host`'s width can be changed.
