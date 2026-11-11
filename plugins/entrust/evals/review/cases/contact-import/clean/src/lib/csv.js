export class CsvError extends Error {}

// The rows of a CSV text as objects keyed by the header row, each with the line its record starts on.
// Handles a BOM, CRLF, and quoted fields that hold commas, doubled quotes and line breaks.
export function parseCsv(text) {
  const records = [];
  let cells = [], field = "", quoted = false, line = 1, start = 1;
  const endRecord = () => {
    cells.push(field);
    if (cells.some((cell) => cell !== "")) records.push({ line: start, cells });
    cells = [];
    field = "";
  };
  const source = text.replace(/^﻿/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else { field += char; if (char === "\n") line++; }
    } else if (char === '"') quoted = true;
    else if (char === ",") { cells.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      endRecord();
      start = ++line;
    } else field += char;
  }
  if (quoted) throw new CsvError(`line ${start}: a quoted field is never closed`);
  endRecord();
  const [header, ...rows] = records;
  if (!header) return [];
  const columns = header.cells.map((name) => name.trim());
  return rows.map((row) => ({ line: row.line, ...Object.fromEntries(columns.map((name, i) => [name, row.cells[i] ?? ""])) }));
}
