// Invoices the desktop app wrote before the billing service existed. data/archive.schema.json describes a row.
// The archive holds currencies in lower case; an invoice carries the code in upper case, as the service's do.
export function readArchive(rows) {
  return rows.map((row) => ({ id: row.id, number: row.no, currency: row.cur.toUpperCase(), amountMinor: row.amt }));
}
