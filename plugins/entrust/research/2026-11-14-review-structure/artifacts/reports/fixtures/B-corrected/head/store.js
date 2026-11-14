function createStore(initial, scheduler) {
  const items = new Map(initial.map(item => [item.id, {...item, highlighted: false}]));
  const versions = new Map();
  const handles = new Map();
  return {
    get(id) { return {...items.get(id)}; },
    rename(id, text) { items.get(id).text = text; },
    flash(id, duration) {
      if (handles.has(id)) scheduler.clear(handles.get(id));
      const version = (versions.get(id) || 0) + 1;
      versions.set(id, version);
      items.get(id).highlighted = true;
      handles.set(id, scheduler.set(() => {
        if (versions.get(id) === version) {
          items.get(id).highlighted = false;
          handles.delete(id);
        }
      }, duration));
    },
  };
}
module.exports = {createStore};
