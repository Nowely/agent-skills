function createStore(initial, scheduler) {
  const items = new Map(initial.map(item => [item.id, {...item, highlighted: false}]));
  const timers = new Map();
  return {
    get(id) { return {...items.get(id)}; },
    rename(id, text) { items.get(id).text = text; },
    flash(id, duration) {
      if (timers.has(id)) scheduler.clear(timers.get(id));
      items.get(id).highlighted = true;
      const handle = scheduler.set(() => {
        if (timers.get(id) !== handle) return;
        items.get(id).highlighted = false;
        timers.delete(id);
      }, duration);
      timers.set(id, handle);
    },
  };
}
module.exports = {createStore};
