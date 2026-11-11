import { badgeLabel } from "./badge.js";

export function renderList(orders, now = new Date()) {
  return orders.map((order) => ({ id: order.id, label: badgeLabel(order, now) }));
}
