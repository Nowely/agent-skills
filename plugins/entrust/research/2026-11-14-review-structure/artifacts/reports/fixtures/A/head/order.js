function submitOrder(order, state) {
  if (state.stock === 0) throw new Error('Out of stock');
  let amount;
  if (order.member) {
    if (order.fragile) {
      amount = order.rush ? 15 : 11;
      state.stock -= 1;
      state.charges.push(amount);
      state.events.push('reserved', 'packed');
      if (order.rush) state.events.push('rush');
    } else {
      amount = order.rush ? 12 : 8;
      state.stock -= 1;
      state.charges.push(amount);
      state.events.push('reserved');
      if (order.rush) state.events.push('rush');
    }
  } else if (order.fragile) {
    amount = order.rush ? 17 : 13;
    state.stock -= 1;
    state.charges.push(amount);
    state.events.push('reserved', 'packed');
    if (order.rush) state.events.push('rush');
  } else {
    amount = order.rush ? 14 : 10;
    state.stock -= 1;
    state.charges.push(amount);
    state.events.push('reserved');
    if (order.rush) state.events.push('rush');
  }
  return amount;
}
module.exports = {submitOrder};
