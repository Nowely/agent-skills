# Offer card: design context

The design exists only as screenshots, exported at 1× from Figma; no layer data was exported. Each folder holds
`reference.png`.

| Folder | Role | What it shows |
|---|---|---|
| `card-764` | target | the card 764 px wide, with `OFFERS["card-764"]` |
| `card-601` | target | the card 601 px wide, with `OFFERS["card-601"]` |
| `card-486` | target | the card 486 px wide, with `OFFERS["card-486"]` |
| `card-280` | target | the card 280 px wide, with `OFFERS["card-280"]` |
| `network-popover` | target | the popover the network's help icon opens |

The card sits in containers of different widths (catalogue grids, the configurator's side panel, the comparison
page): its own width decides its layout, not the window's. The frames are samples of that range.

## Styles

From the kit (`kit/kit.css`): the SKU `t-caption`; badges `kit-badge`, "New" with the accent tone; values `t-body`,
their secondary lines and units `t-muted`; the processor count `kit-chip` ("×2"); the help icons `kit-help`; the
discount and low-stock indicators `kit-icon--deal` and `kit-icon--low`; the price `t-price`, its period in the same
style; the popover `kit-popover` with `kit-popover__title`; the link `kit-link`; the configure action `kit-action`.
Card: surface, radius 12, the kit's card outline.

## Behaviour

- The network and power help icons open popovers in the kit's look. Hover or keyboard focus opens one; it stays open
  while the pointer is over the icon or the popover, and closes when the pointer has left both, on Escape and on a
  tap elsewhere. On touch screens a tap toggles it. The network popover: "Скорость соединения сетевых карт" as its
  title; "Приватная сеть:" and "Публичная сеть:" with their speeds; "Резервирование через" and the reservation as a
  link. The power popover shows the power help text.
- The discount indicator sits next to the price; hovering it shows the old price and the date the discount ends.
- A low stock shows the low-stock indicator next to "Доступно N"; the count stays.
- An offer that can be configured shows "Сконфигурировать" in the footer, after the power item, in the action
  style with a small settings icon; it calls `onConfigure(id)`.
