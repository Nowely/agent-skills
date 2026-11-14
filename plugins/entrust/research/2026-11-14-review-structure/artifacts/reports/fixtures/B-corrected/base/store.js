function createStore(initial, scheduler) {
  const items = new Map(initial.map(item => [item.id, {...item, highlighted: false}]));
  return {
    get(id) { return {...items.get(id)}; },
  };
}
module.exports = {createStore};
