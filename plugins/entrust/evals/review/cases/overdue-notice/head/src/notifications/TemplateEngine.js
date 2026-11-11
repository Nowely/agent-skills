import { formatAmount } from "../invoices/money.js";

const PLACEHOLDER = /\{\{\s*([\w.]+)\s*(?:\|\s*(\w+)\s*)?\}\}/g;

function lookup(vars, path) {
  return path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), vars);
}

export class TemplateEngine {
  #filters = new Map([
    ["upper", (value) => String(value).toUpperCase()],
    ["lower", (value) => String(value).toLowerCase()],
    ["money", ({ minor, currency }) => formatAmount(minor, currency)],
  ]);

  registerFilter(name, fn) {
    this.#filters.set(name, fn);
  }

  render(template, vars) {
    return template.replace(PLACEHOLDER, (_, path, filterName) => {
      const filter = filterName === undefined ? undefined : this.#filters.get(filterName);
      if (filterName !== undefined && !filter) {
        throw new Error(`Unknown filter: ${filterName}`);
      }
      const value = lookup(vars, path);
      if (value == null) {
        return "";
      }
      return String(filter ? filter(value) : value);
    });
  }
}
