// Text on its way into markup: the one place it is escaped, and the one place it is cut to fit.
export const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export const clip = (value, length) => String(value).length > length ? `${String(value).slice(0, length - 1)}…` : String(value);
