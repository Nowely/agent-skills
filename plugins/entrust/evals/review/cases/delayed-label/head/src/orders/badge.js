const LABELS = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function badgeLabel(order, now = new Date(), options = {}) {
  const status = order.status ?? "unknown";
  let label = LABELS[status];
  if (!label) label = options.fallbackLabel || "Unknown";

  let promised = null;
  try {
    promised = order.promisedAt ? new Date(order.promisedAt) : null;
  } catch {
    promised = null;
  }

  if (status === "shipped" && promised && promised < now) label = "Delayed";
  return label;
}
