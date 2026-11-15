export function createRuleCache(loadRule, schedule) {
  const requests = new Map();
  const queued = new Set();

  return { load, warmAll };

  function load(kind) {
    if (!requests.has(kind)) {
      const request = Promise.resolve()
        .then(() => loadRule(kind))
        .catch(error => {
          requests.delete(kind);
          throw error;
        });
      requests.set(kind, request);
    }
    return requests.get(kind);
  }

  function warmAll(kinds) {
    for (const kind of new Set(kinds)) {
      if (typeof kind !== 'string' || kind.length === 0 || requests.has(kind) || queued.has(kind)) {
        continue;
      }

      queued.add(kind);
      try {
        schedule(() => {
          queued.delete(kind);
          load(kind).catch(() => {});
        });
      } catch {
        queued.delete(kind);
      }
    }
  }
}
