import assert from "node:assert/strict";

// The invoices as the app loads them: two from the service, one from the archive.
const open = async (tree) => {
  const { loadInvoices } = await tree("src/invoices/load.js");
  const service = [
    { id: "s1", number: "S-1", currency: "EUR", amountMinor: 1250 },
    { id: "s2", number: "S-2", currency: "JPY", amountMinor: 500000 },
  ];
  const invoices = await loadInvoices({ transport: { get: async () => service }, archiveRows: [{ id: "a1", no: "A-1", cur: "usd", amt: 1000 }] });
  const byNumber = (number) => invoices.find((invoice) => invoice.number === number);
  return { invoices, byNumber };
};

export default [
  { name: "an archived invoice shows an upper-case currency in the list and on its page", run: async (tree) => {
    const { invoices, byNumber } = await open(tree);
    assert.ok((await tree("src/screens/list.js")).renderList(invoices).includes("A-1  USD 10.00"));
    assert.equal((await tree("src/screens/page.js")).renderPage(byNumber("A-1")).price, "USD 10.00");
  } },
  { name: "an archived invoice shows an upper-case currency in the CSV export", run: async (tree) => {
    const { invoices } = await open(tree);
    assert.ok((await tree("src/export/csv.js")).toCsv(invoices).split("\n").includes("A-1,USD,10.00"));
  } },
  { name: "every invoice keeps its own currency", run: async (tree) => {
    const { invoices, byNumber } = await open(tree);
    assert.ok((await tree("src/screens/list.js")).renderList(invoices).includes("S-2  JPY 5000.00"));
    assert.equal((await tree("src/screens/page.js")).renderPage(byNumber("S-2")).price, "JPY 5000.00");
    assert.equal((await tree("src/screens/page.js")).renderPage(byNumber("S-1")).price, "EUR 12.50");
  } },
];
