import { statusLabel } from "./labels.js";

export function toCsv(orders) {
  const rows = orders.map((order) => [order.id, statusLabel(order.status), order.promisedAt ?? ""].join(","));
  return ["id,status,promised", ...rows].join("\n");
}
