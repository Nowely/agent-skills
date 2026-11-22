# Offer card

`card.js` renders one dedicated-server offer: `renderCard(el, offer, { onConfigure })` replaces `el`'s content with
the card. The catalogue, the configurator and the comparison page call it, in containers of different widths.
`onConfigure(id)` is called when the user chooses to configure an offer that allows it.

| Field | |
|---|---|
| `id`, `sku` | the offer's id and its SKU, up to 40 characters |
| `badges` | 0–4 of `{ text, tone }`; `tone` is `accent` or absent |
| `cpu` | `{ model, vendor, frequency, cores, count }`: `count` processors of `cores` cores each |
| `cores` | `{ total, threads }`, already worded (`"32 ядра"`, `"64 потока"`) |
| `ram` | `{ size, type }` |
| `disks` | 1–4 groups of `{ count, size, type }` |
| `network` | `{ text, private, public, reservation, link }` |
| `power` | `{ text, help }` |
| `price` | `{ amount, period?, discount? }`; `discount` is `{ old, until }` for an offer on discount; an amount can be long |
| `stock` | `{ count, low }`: `low` marks a low stock |
| `configurable` | true when the offer can be configured: the configure action is shown only then |

The catalogue's API sends exactly these fields; the card has no other data.

The UI kit is in `kit/kit.css`: tokens, type styles, badges, chips, the help icon, indicator icons, the action
style and the popover's look. `story.html?data=<name>&w=<width>` renders an entry of `data.js` in a container of that
width (764 by default).
