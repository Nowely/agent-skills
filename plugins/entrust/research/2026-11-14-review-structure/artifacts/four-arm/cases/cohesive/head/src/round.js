export function createRound(tableIds, persist) {
  const tables = new Set(tableIds);
  const receipts = new Map();
  let revision = 0;
  let sealed = false;

  return {
    submit({ id, table, home, away, expectedRevision }) {
      const previous = receipts.get(id);
      if (previous) {
        if (previous.table !== table || previous.home !== home || previous.away !== away) {
          throw new Error('ID_REUSED');
        }
        return previous;
      }
      if (sealed) throw new Error('ROUND_SEALED');
      if (expectedRevision !== revision) throw new Error('STALE_REVISION');
      if (!tables.has(table)) throw new Error('UNKNOWN_TABLE');
      if ([...receipts.values()].some(receipt => receipt.table === table)) {
        throw new Error('TABLE_RECORDED');
      }
      if (![home, away].every(score => Number.isInteger(score) && score >= 0 && score <= 99) || home === away) {
        throw new Error('INVALID_SCORE');
      }
      const receipt = Object.freeze({ id, table, home, away, revision: revision + 1 });
      persist(receipt);
      receipts.set(id, receipt);
      revision = receipt.revision;
      return receipt;
    },

    seal() {
      sealed = true;
    },

    snapshot() {
      return { revision, results: [...receipts.values()].map(receipt => ({ ...receipt })) };
    },

    receipt(id) {
      return receipts.get(id) ?? null;
    },
  };
}
