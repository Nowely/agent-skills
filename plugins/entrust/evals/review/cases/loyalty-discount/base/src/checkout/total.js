import { round2 } from "./money.js";

const FREE_SHIPPING_FROM = 50;
const SHIPPING = 4.9;
const TAX_RATE = 0.2;
const STAFF_RATE = 0.3;

export function computeTotal(cart, customer) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discounted = subtotal;
  if (cart.coupon) discounted -= cart.coupon.amount;
  if (customer.isStaff) discounted -= discounted * STAFF_RATE;
  discounted = Math.max(discounted, 0);

  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING;
  const tax = round2(discounted * TAX_RATE);
  return { subtotal: round2(subtotal), shipping, tax, total: round2(discounted + shipping + tax) };
}
