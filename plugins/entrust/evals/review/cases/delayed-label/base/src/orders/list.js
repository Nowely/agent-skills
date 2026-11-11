import { statusLabel } from "./labels.js";

export function renderList(orders) {
  return orders.map((order) => ({ id: order.id, label: statusLabel(order.status) }));
}
