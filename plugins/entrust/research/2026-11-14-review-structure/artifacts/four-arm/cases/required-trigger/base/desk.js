export function createDesk({ clock, onExpire, onError }) {
  const active = new Set();
  let closed = false;
  return {
    reserve(id, duration) {
      if (closed) throw new Error('desk is closed');
      if (typeof id !== 'string' || !id || typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) throw new TypeError('invalid reservation');
      if (active.has(id)) throw new Error('reservation already exists');
      active.add(id);
    },
    cancel(id) {
      if (closed) throw new Error('desk is closed');
      return active.delete(id);
    },
    has(id) { return active.has(id); },
    close() { closed = true; active.clear(); }
  };
}
