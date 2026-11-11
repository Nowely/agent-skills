import { round2 } from "./money.js";
import { isLoyal } from "./loyalty.js";

const FREE_SHIPPING_FROM = 50;
const SHIPPING = 4.9;
const TAX_RATE = 0.2;
const STAFF_RATE = 0.3;

export function computeTotal(cart, customer, options = {}) {
  let subtotal = 0;
  let loyaltyApplied = false;
  const loyal = !options.skipLoyalty && isLoyal(customer);
  for (const item of cart.items) {
    if (loyal && !cart.coupon) {
      item.price = round2(item.price * 0.95);
      loyaltyApplied = true;
    }
    subtotal += item.price * item.quantity;
  }

  let discounted = subtotal;
  if (cart.coupon) {
    discounted -= cart.coupon.amount;
    if (loyal) {
      discounted = discounted * 0.95;
      loyaltyApplied = true;
    }
  }
  if (customer.isStaff) discounted -= discounted * STAFF_RATE;
  discounted = Math.max(discounted, 0);

  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING;
  const tax = round2(discounted * TAX_RATE);
  return { subtotal: round2(subtotal), shipping, tax, loyaltyApplied, total: round2(discounted + shipping + tax) };
}
