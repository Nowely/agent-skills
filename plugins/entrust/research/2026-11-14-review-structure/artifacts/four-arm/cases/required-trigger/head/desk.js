export function createDesk({ clock, onExpire, onError }) {
  const active = new Map();
  let closed = false;

  function ensureOpen() {
    if (closed) throw new Error('desk is closed');
  }

  return {
    reserve(id, duration) {
      ensureOpen();
      if (typeof id !== 'string' || id.length === 0 ||
          typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) {
        throw new TypeError('invalid reservation');
      }
      if (active.has(id)) throw new Error('reservation already exists');
      const entry = {};
      entry.timer = clock.setTimeout(() => {
        if (active.get(id) !== entry) return;
        active.delete(id);
        try {
          onExpire(id);
        } catch (error) {
          try { onError(error, id); } catch { /* Error reporting must not interrupt the desk. */ }
        }
      }, duration);
      active.set(id, entry);
    },
    cancel(id) {
      ensureOpen();
      const entry = active.get(id);
      if (!entry) return false;
      active.delete(id);
      clock.clearTimeout(entry.timer);
      return true;
    },
    has(id) {
      return active.has(id);
    },
    close() {
      if (closed) return;
      closed = true;
      for (const entry of active.values()) clock.clearTimeout(entry.timer);
      active.clear();
    }
  };
}
