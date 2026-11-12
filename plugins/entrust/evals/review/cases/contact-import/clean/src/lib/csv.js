export class CsvError extends Error {}

// The rows of a CSV text as objects keyed by the header row, each with the line its record starts on.
// Handles a BOM, CRLF, and quoted fields that hold commas, doubled quotes and line breaks. A blank line is no
// record, and a quote that does not enclose a whole field is an error.
export function parseCsv(text) {
  const records = [];
  let cells = [], field = "", quoted = false, closed = false, line = 1, start = 1;
  const endField = () => { cells.push(field); field = ""; closed = false; };
  const endRecord = () => {
    endField();
    if (cells.length > 1 || cells[0] !== "") records.push({ line: start, cells });
    cells = [];
  };
  const source = text.replace(/^﻿/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i], crlf = char === "\r" && source[i + 1] === "\n", newline = char === "\n" || char === "\r";
    if (crlf) i++;
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else { field += crlf ? "\r\n" : char; if (newline) line++; }
    } else if (char === ",") endField();
    else if (newline) { endRecord(); start = ++line; }
    else if (closed || (char === '"' && field !== "")) throw new CsvError(`line ${line}: a quote must enclose a whole field`);
    else if (char === '"') quoted = true;
    else field += char;
  }
  if (quoted) throw new CsvError(`line ${start}: a quoted field is never closed`);
  endRecord();
  const [header, ...rows] = records;
  if (!header) return [];
  const columns = header.cells.map((name) => name.trim());
  // The line comes last, so that no column of the file can replace it.
  return rows.map((row) => ({ ...Object.fromEntries(columns.map((name, i) => [name, row.cells[i] ?? ""])), line: row.line }));
}
