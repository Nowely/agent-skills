import { computeTotal } from "./total.js";

// Runs again on every cart update (a quantity change, a coupon applied) with the same cart object.
export function renderSummary(cart, customer) {
  const totals = computeTotal(cart, customer);
  return {
    lines: cart.items.map((item) => `${item.quantity} x ${item.name} @ ${item.price.toFixed(2)}`),
    ...totals,
  };
}
