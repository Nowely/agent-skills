const LOYALTY_MIN_ORDERS = 5;
const loyaltyCache = new Map();

export function isLoyal(customer) {
  if (loyaltyCache.has(customer.id)) return loyaltyCache.get(customer.id);
  const loyal = !customer.isStaff && customer.completedOrders > LOYALTY_MIN_ORDERS;
  loyaltyCache.set(customer.id, loyal);
  return loyal;
}
