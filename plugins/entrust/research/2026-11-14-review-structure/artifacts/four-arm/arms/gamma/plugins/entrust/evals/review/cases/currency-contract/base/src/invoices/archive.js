// Invoices the desktop app wrote before the billing service existed. data/archive.schema.json describes a row.
export function readArchive(rows) {
  return rows.map((row) => ({ id: row.id, number: row.no, currency: row.cur, amountMinor: row.amt }));
}
