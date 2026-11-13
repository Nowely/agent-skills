// Invoices as the jobs see them. Dates are calendar dates in UTC, written YYYY-MM-DD.
export class InvoiceRepo {
  #invoices;

  constructor(invoices) {
    this.#invoices = invoices.map((invoice) => ({ ...invoice }));
  }

  all() {
    return this.#invoices;
  }

  unpaid() {
    return this.#invoices.filter((invoice) => !invoice.paidAt);
  }

  update(id, patch) {
    Object.assign(this.#invoices.find((invoice) => invoice.id === id), patch);
  }
}
