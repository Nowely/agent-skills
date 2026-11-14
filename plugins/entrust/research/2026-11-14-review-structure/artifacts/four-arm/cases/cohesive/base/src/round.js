export function createRound(tableIds, persist) {
  const tables = new Set(tableIds);
  const receipts = new Map();
  let revision = 0;

  return {
    submit({ id, table, home, away }) {
      if (!tables.has(table)) throw new Error('UNKNOWN_TABLE');
      if (![home, away].every(score => Number.isInteger(score) && score >= 0 && score <= 99) || home === away) {
        throw new Error('INVALID_SCORE');
      }
      const receipt = Object.freeze({ id, table, home, away, revision: revision + 1 });
      persist(receipt);
      receipts.set(id, receipt);
      revision = receipt.revision;
      return receipt;
    },

    snapshot() {
      return { revision, results: [...receipts.values()].map(receipt => ({ ...receipt })) };
    },
  };
}
