// Text on its way into markup: the one place it is escaped.
export const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export const prose = (value) => esc(value).replace(/`([^`]+)`/g, "<code>$1</code>");
