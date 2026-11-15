function submitOrder(order, state) {
  if (state.stock === 0) throw new Error('Out of stock');
  let amount = 10;
  if (order.member) amount -= 2;
  if (order.fragile) amount += 3;
  state.stock -= 1;
  state.charges.push(amount);
  state.events.push('reserved');
  if (order.fragile) state.events.push('packed');
  return amount;
}
module.exports = {submitOrder};
